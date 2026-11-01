import { db } from '../db';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  generateEmbedding,
  float32ArrayToBuffer,
  bufferToFloat32Array,
  cosineSimilarity,
} from './embeddings';
import { extractFromPdf, extractFromPlainText } from './pdfExtractor';

export interface VectorSearchResult {
  chunk_id: string;
  document_id: string;
  document_title: string;
  subject: string;
  course_id: string | null;
  page_number: number | null;
  chunk_text: string;
  score: number;
  file_name: string;
}

export interface IngestDocumentParams {
  id: string;
  title: string;
  subject: string;
  course_id?: string | null;
  description?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  visibility?: 'public' | 'course_only' | 'admin_only';
  uploaded_by?: string;
}

/**
 * Process and ingest an uploaded document asynchronously:
 * Extracts text, chunks with page numbers, generates 3072-dim embeddings, and stores in SQLite.
 */
export async function processAndIndexDocument(docParams: IngestDocumentParams): Promise<void> {
  const now = new Date().toISOString();

  // 1. Initial insert with status 'processing'
  const insertDoc = db.prepare(`
    INSERT INTO documents (
      id, title, subject, course_id, description, file_name, file_path, file_size,
      mime_type, page_count, processing_status, visibility, uploaded_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processing', ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      processing_status = 'processing',
      error_message = NULL
  `);

  insertDoc.run(
    docParams.id,
    docParams.title,
    docParams.subject,
    docParams.course_id || null,
    docParams.description || '',
    docParams.file_name,
    docParams.file_path,
    docParams.file_size,
    docParams.mime_type,
    1,
    docParams.visibility || 'public',
    docParams.uploaded_by || 'Admin (Faculty)',
    now
  );

  try {
    const fileBuffer = fs.readFileSync(docParams.file_path);

    // 2. Extract text & page-aware chunks
    let extracted;
    if (docParams.mime_type === 'application/pdf' || docParams.file_name.toLowerCase().endsWith('.pdf')) {
      extracted = await extractFromPdf(fileBuffer);
    } else {
      const textContent = fileBuffer.toString('utf-8');
      extracted = extractFromPlainText(textContent);
    }

    if (extracted.chunks.length === 0) {
      throw new Error('No readable text content could be extracted from document.');
    }

    // 3. Clear any existing chunks for this document (in case of re-processing)
    const clearChunks = db.prepare('DELETE FROM document_chunks WHERE document_id = ?');
    clearChunks.run(docParams.id);

    // 4. Generate embeddings and insert chunks into SQLite
    const insertChunk = db.prepare(`
      INSERT INTO document_chunks (
        id, document_id, chunk_index, page_number, subject, course_id, chunk_text, embedding, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    console.log(`⚡ Generating vector embeddings for ${extracted.chunks.length} chunks of "${docParams.title}"...`);

    for (const chunk of extracted.chunks) {
      const chunkId = `chk_${randomUUID()}`;
      // Generate 3072-dim Float32Array vector embedding via Gemini API
      const vector = await generateEmbedding(chunk.chunk_text);
      const vectorBlob = float32ArrayToBuffer(vector);

      const metadata = JSON.stringify({
        page_number: chunk.page_number,
        document_title: docParams.title,
        subject: docParams.subject,
        file_name: docParams.file_name,
      });

      insertChunk.run(
        chunkId,
        docParams.id,
        chunk.chunk_index,
        chunk.page_number,
        docParams.subject,
        docParams.course_id || null,
        chunk.chunk_text,
        vectorBlob,
        metadata,
        now
      );
    }

    // 5. Update document status to 'indexed'
    const updateSuccess = db.prepare(`
      UPDATE documents
      SET processing_status = 'indexed', page_count = ?, error_message = NULL
      WHERE id = ?
    `);
    updateSuccess.run(extracted.page_count, docParams.id);

    console.log(`✅ Successfully indexed document "${docParams.title}" (${extracted.chunks.length} chunks, ${extracted.page_count} pages).`);
  } catch (error: any) {
    console.error(`❌ Failed to process document "${docParams.title}":`, error);

    const updateError = db.prepare(`
      UPDATE documents
      SET processing_status = 'failed', error_message = ?
      WHERE id = ?
    `);
    updateError.run(error?.message || 'Processing and embedding generation failed', docParams.id);
    throw error;
  }
}

/**
 * Delete a document and all its associated vector chunks from SQLite
 * Also deletes physical file from storage.
 */
export function deleteDocument(documentId: string): boolean {
  const getDoc = db.prepare('SELECT file_path FROM documents WHERE id = ?');
  const doc = getDoc.get(documentId) as { file_path: string } | undefined;

  if (doc?.file_path && fs.existsSync(doc.file_path)) {
    try {
      fs.unlinkSync(doc.file_path);
    } catch (e) {
      console.warn('Could not delete physical file:', e);
    }
  }

  // Cascading delete removes chunks & embeddings automatically
  const deleteStmt = db.prepare('DELETE FROM documents WHERE id = ?');
  const result = deleteStmt.run(documentId);
  return result.changes > 0;
}

/**
 * Perform exact mathematical Cosine Similarity Search over vector embeddings in SQLite
 */
export async function searchVectorChunks(options: {
  query: string;
  subject?: string;
  courseId?: string;
  allowedVisibilities?: string[];
  topK?: number;
  minScore?: number;
}): Promise<VectorSearchResult[]> {
  const {
    query,
    subject,
    courseId,
    allowedVisibilities = ['public', 'course_only'],
    topK = 3,
    minScore = 0.40,
  } = options;

  if (!query || !query.trim()) return [];

  // Step 1: Compute real query vector embedding
  const queryVector = await generateEmbedding(query.trim());

  // Step 2: Fetch candidate chunks with embeddings from SQLite
  let sql = `
    SELECT 
      c.id as chunk_id,
      c.document_id,
      c.chunk_text,
      c.page_number,
      c.subject,
      c.course_id,
      c.embedding,
      d.title as document_title,
      d.file_name,
      d.visibility,
      d.processing_status
    FROM document_chunks c
    JOIN documents d ON d.id = c.document_id
    WHERE d.processing_status = 'indexed'
      AND c.embedding IS NOT NULL
  `;

  const params: any[] = [];

  // Filter by visibility
  if (allowedVisibilities.length > 0) {
    const placeholders = allowedVisibilities.map(() => '?').join(',');
    sql += ` AND d.visibility IN (${placeholders})`;
    params.push(...allowedVisibilities);
  }

  // Filter by subject if specified
  if (subject && subject !== 'all') {
    sql += ` AND (c.subject = ? OR d.subject = ?)`;
    params.push(subject, subject);
  }

  // Filter by course if specified
  if (courseId) {
    sql += ` AND (c.course_id = ? OR d.course_id = ?)`;
    params.push(courseId, courseId);
  }

  const stmt = db.prepare(sql);
  const rows = stmt.all(...params) as any[];

  if (rows.length === 0) return [];

  // Step 3: Compute exact cosine similarity for each vector
  const scoredResults: VectorSearchResult[] = [];

  for (const row of rows) {
    if (!row.embedding) continue;
    const chunkVector = bufferToFloat32Array(row.embedding);
    const score = cosineSimilarity(queryVector, chunkVector);

    if (score >= minScore) {
      scoredResults.push({
        chunk_id: row.chunk_id,
        document_id: row.document_id,
        document_title: row.document_title,
        subject: row.subject,
        course_id: row.course_id,
        page_number: row.page_number,
        chunk_text: row.chunk_text,
        file_name: row.file_name,
        score: Number(score.toFixed(4)),
      });
    }
  }

  // Step 4: Sort by cosine similarity descending and return top-k
  return scoredResults
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Format retrieved RAG chunks into grounded prompt instructions for Gemini
 */
export function buildGroundedPromptContext(chunks: VectorSearchResult[]): {
  ragContextPrompt: string;
  hasMatchingDocuments: boolean;
} {
  if (chunks.length === 0) {
    return {
      hasMatchingDocuments: false,
      ragContextPrompt: `
[STUDY MATERIAL SEARCH RESULT: NO MATCHING DOCUMENTS RETRIEVED]
The search of the university EEE study materials and syllabus library returned NO matching documents for this query.

INSTRUCTIONS:
1. Clearly state to the student: "Note: No specific Electric Sence study material or textbook was retrieved from the library for this query."
2. Provide your best electrical engineering answer using your verified core knowledge, clearly distinguishing it as general engineering knowledge.
`
    };
  }

  const citations = chunks.map((c, i) => {
    const pageStr = c.page_number ? ` (Page ${c.page_number})` : '';
    return `[Source ${i + 1}]: "${c.document_title}"${pageStr} | Subject: ${c.subject} | Similarity: ${(c.score * 100).toFixed(1)}%
Content:
${c.chunk_text}`;
  }).join('\n\n---\n\n');

  return {
    hasMatchingDocuments: true,
    ragContextPrompt: `
[RETRIEVED ELECTRICAL ENGINEERING SOURCE DOCUMENTS (RAG GROUNDING)]
The following verified excerpts were retrieved from the Electric Sence authorized library:

${citations}

STRICT GROUNDING INSTRUCTIONS:
1. Ground your technical explanation, formulas, equivalent circuits, and numerical derivations in the retrieved sources above.
2. Explicitly cite the sources by title and page number when stating facts or formulas (e.g. "According to [Source 1: Title, Page X]...").
3. Explain equations clearly with defined variables and SI units.
4. If the retrieved material is only partially sufficient, use your general electrical engineering knowledge to fill gaps, but explicitly distinguish between what was directly retrieved from the document and general principles.
5. Never invent or fabricate citations, page numbers, or textbook content that does not exist in the retrieved text.
`
  };
}

