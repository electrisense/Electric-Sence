import { Router, Request, Response } from 'express';
import { listRagDocuments, ingestDocument, retrieveRelevantChunks } from '../rag/store';

const router = Router();

// GET /api/rag/documents — List all indexed documents in the RAG repository
router.get('/rag/documents', (_req: Request, res: Response) => {
  try {
    const docs = listRagDocuments();
    res.json({ documents: docs });
  } catch (error: any) {
    console.error('Error listing RAG documents:', error);
    res.status(500).json({ error: 'Failed to retrieve RAG documents' });
  }
});

// POST /api/rag/documents — Ingest new lecture notes or textbook syllabus into RAG
router.post('/rag/documents', (req: Request, res: Response) => {
  try {
    const { title, subject, source_type, author, content } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Document title is required.' });
      return;
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      res.status(400).json({ error: 'Document content is required.' });
      return;
    }

    const result = ingestDocument({
      title,
      subject: subject || 'General Electrical Engineering',
      source_type: source_type || 'student_notes',
      author: author || 'Student / Faculty Contributor',
      content,
    });

    res.status(201).json({
      message: 'Document successfully ingested and indexed into RAG repository.',
      document: result,
    });
  } catch (error: any) {
    console.error('Error ingesting RAG document:', error);
    res.status(500).json({ error: 'Failed to ingest document into RAG.' });
  }
});

// POST /api/rag/search — Test RAG semantic search and view retrieved references
router.post('/rag/search', (req: Request, res: Response) => {
  try {
    const { query, top_k } = req.body || {};
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Search query is required.' });
      return;
    }

    const k = typeof top_k === 'number' && top_k > 0 ? Math.min(top_k, 10) : 3;
    const results = retrieveRelevantChunks(query, k);

    res.json({
      query,
      count: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Error performing RAG search:', error);
    res.status(500).json({ error: 'Failed to perform RAG search.' });
  }
});

export default router;

