import { db } from '../db';
import { randomUUID } from 'node:crypto';
import { SEED_RAG_DOCUMENTS } from '../seedData';

export interface RagSearchResult {
  chunk_id: string;
  document_id: string;
  document_title: string;
  document_author: string;
  source_type: string;
  chunk_title: string;
  content: string;
  score: number;
}

export interface IngestDocumentInput {
  title: string;
  subject: string;
  source_type: 'textbook' | 'syllabus' | 'lab_manual' | 'reference_notes' | 'student_notes';
  author: string;
  content: string;
}

/**
 * Initialize RAG tables in SQLite and seed initial EEE documents
 */
export function initRagTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rag_documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      source_type TEXT NOT NULL,
      author TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rag_chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      keywords TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (document_id) REFERENCES rag_documents(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_rag_chunks_doc ON rag_chunks(document_id);
  `);

  // Seed default knowledge base if empty
  const countStmt = db.prepare('SELECT count(*) as count FROM rag_documents');
  const result = countStmt.get() as { count: number };

  if (result.count === 0) {
    console.log('📚 Seeding EEE RAG Knowledge Base...');
    const now = new Date().toISOString();

    const insertDoc = db.prepare(`
      INSERT INTO rag_documents (id, title, subject, source_type, author, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertChunk = db.prepare(`
      INSERT INTO rag_chunks (id, document_id, chunk_index, title, content, keywords, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const doc of SEED_RAG_DOCUMENTS) {
      insertDoc.run(doc.id, doc.title, doc.subject, doc.source_type, doc.author, now);
      doc.chunks.forEach((chunk, idx) => {
        insertChunk.run(
          chunk.id,
          doc.id,
          idx,
          chunk.title,
          chunk.content,
          chunk.keywords.join(', '),
          now
        );
      });
    }

    console.log(`✅ Seeded ${SEED_RAG_DOCUMENTS.length} authoritative EEE documents into RAG.`);
  }
}

/**
 * Split raw document text into meaningful overlapping chunks
 */
function splitIntoChunks(text: string, chunkSize = 1000, overlap = 150): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (!trimmed) continue;

    if ((currentChunk + '\n\n' + trimmed).length > chunkSize) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      // Retain overlap if possible
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.min(words.length, 25)).join(' ');
      currentChunk = overlapWords + '\n\n' + trimmed;
    } else {
      currentChunk = currentChunk ? currentChunk + '\n\n' + trimmed : trimmed;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

/**
 * Extract simple keywords from text
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'with', 'as', 'by',
    'that', 'it', 'from', 'be', 'are', 'this', 'or', 'an', 'can', 'has', 'have', 'were', 'was'
  ]);
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));
  return Array.from(new Set(words)).slice(0, 10);
}

/**
 * Ingest a new document into the RAG knowledge base
 */
export function ingestDocument(input: IngestDocumentInput) {
  const docId = `doc_${randomUUID()}`;
  const now = new Date().toISOString();

  const insertDoc = db.prepare(`
    INSERT INTO rag_documents (id, title, subject, source_type, author, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertDoc.run(docId, input.title.trim(), input.subject.trim(), input.source_type, input.author.trim(), now);

  const chunks = splitIntoChunks(input.content);
  const insertChunk = db.prepare(`
    INSERT INTO rag_chunks (id, document_id, chunk_index, title, content, keywords, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  chunks.forEach((chunkText, idx) => {
    const chunkId = `chunk_${randomUUID()}`;
    const keywords = extractKeywords(chunkText).join(', ');
    const chunkTitle = `${input.title.trim()} (Part ${idx + 1})`;
    insertChunk.run(chunkId, docId, idx, chunkTitle, chunkText, keywords, now);
  });

  return {
    documentId: docId,
    chunkCount: chunks.length,
    title: input.title,
    createdAt: now,
  };
}

/**
 * List all documents stored in the RAG knowledge base
 */
export function listRagDocuments() {
  const stmt = db.prepare(`
    SELECT 
      d.id, d.title, d.subject, d.source_type, d.author, d.created_at,
      count(c.id) as chunk_count
    FROM rag_documents d
    LEFT JOIN rag_chunks c ON c.document_id = d.id
    GROUP BY d.id
    ORDER BY d.created_at DESC
  `);
  return stmt.all() as Array<{
    id: string;
    title: string;
    subject: string;
    source_type: string;
    author: string;
    created_at: string;
    chunk_count: number;
  }>;
}

/**
 * Semantic & Keyword Hybrid Retrieval from EEE knowledge base
 */
export function retrieveRelevantChunks(query: string, topK = 3): RagSearchResult[] {
  if (!query || !query.trim()) return [];

  const rawTokens = query
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);

  const queryTerms = Array.from(new Set(rawTokens));
  if (queryTerms.length === 0) return [];

  // Query all chunks along with parent document metadata
  const stmt = db.prepare(`
    SELECT 
      c.id as chunk_id,
      c.document_id,
      c.title as chunk_title,
      c.content,
      c.keywords,
      d.title as document_title,
      d.author as document_author,
      d.source_type,
      d.subject
    FROM rag_chunks c
    JOIN rag_documents d ON c.document_id = d.id
  `);

  const allChunks = stmt.all() as Array<{
    chunk_id: string;
    document_id: string;
    chunk_title: string;
    content: string;
    keywords: string | null;
    document_title: string;
    document_author: string;
    source_type: string;
    subject: string;
  }>;

  const normalizedQuery = query.toLowerCase();

  const scored = allChunks.map(chunk => {
    const contentLower = chunk.content.toLowerCase();
    const titleLower = chunk.chunk_title.toLowerCase();
    const docTitleLower = chunk.document_title.toLowerCase();
    const keywordsLower = (chunk.keywords || '').toLowerCase();
    const subjectLower = chunk.subject.toLowerCase();

    let score = 0;

    // 1. Direct multi-word phrase matching
    if (contentLower.includes(normalizedQuery)) {
      score += 15.0;
    }

    // 2. Term frequency in content, title, and keywords
    for (const term of queryTerms) {
      // Content matches
      const contentMatches = contentLower.split(term).length - 1;
      if (contentMatches > 0) {
        score += Math.min(contentMatches * 1.5, 8.0);
      }

      // Title matches (high signal)
      if (titleLower.includes(term)) {
        score += 4.0;
      }
      if (docTitleLower.includes(term)) {
        score += 3.0;
      }

      // Keyword matches
      if (keywordsLower.includes(term)) {
        score += 3.5;
      }

      // Subject matches
      if (subjectLower.includes(term)) {
        score += 2.0;
      }
    }

    // Normalize score roughly between 0.0 and 1.0
    const normalizedScore = Math.min(Number((score / 25).toFixed(2)), 0.99);

    return {
      chunk_id: chunk.chunk_id,
      document_id: chunk.document_id,
      document_title: chunk.document_title,
      document_author: chunk.document_author,
      source_type: chunk.source_type,
      chunk_title: chunk.chunk_title,
      content: chunk.content,
      score: normalizedScore,
    };
  });

  // Filter to chunks with a minimum relevance threshold and sort descending
  return scored
    .filter(item => item.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Format retrieved chunks into Markdown context for Gemini system instruction
 */
export function buildRagPromptContext(chunks: RagSearchResult[]): string {
  if (chunks.length === 0) return '';

  const formatted = chunks.map((c, i) => {
    return `### [Document Reference ${i + 1}]: "${c.chunk_title}"
Source: ${c.document_title} (Author/Org: ${c.document_author}, Type: ${c.source_type})
Relevance Score: ${Math.round(c.score * 100)}%

${c.content}
`;
  }).join('\n---\n\n');

  return `
[VERIFIED ELECTRICAL ENGINEERING KNOWLEDGE BASE (RAG CONTEXT)]
The following authoritative references were retrieved from the university knowledge base and IEEE compendium based on the student's question:

${formatted}

INSTRUCTIONS FOR USING RETRIEVED REFERENCES:
1. Ground your technical explanation, equations, and numerical parameters in the reference material provided above.
2. Explicitly cite the source reference (e.g., "According to [Document Reference 1]...") when stating core formulas, equivalent circuits, or derivations.
3. If the student's query goes beyond the retrieved text, use your verified electrical engineering expertise to fill any gaps smoothly.
`;
}

