import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { db } from '../db';
import { processAndIndexDocument, deleteDocument } from '../rag/vectorStore';
import { requireAdminAuth, isAdminKeyRequired } from '../middleware/auth';

const router = Router();

// Ensure upload directory exists (supports persistent volume DATA_DIR/uploads)
export const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : (process.env.DATA_DIR
      ? path.join(path.resolve(process.env.DATA_DIR), 'uploads')
      : path.resolve(process.cwd(), 'server', 'uploads'));

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueName = `${sanitizedBase}_${Date.now()}_${randomUUID().slice(0, 8)}${ext}`;
    cb(null, uniqueName);
  }
});

// File filter & size limits
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/x-markdown',
      'text/x-markdown'
    ];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) || ['.pdf', '.txt', '.md'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF (.pdf), Text (.txt), and Markdown (.md) documents are supported.'));
    }
  }
});

/**
 * GET /api/documents/admin-status — Check whether admin key is configured
 */
router.get('/documents/admin-status', (_req: Request, res: Response) => {
  res.json({
    auth_required: isAdminKeyRequired(),
    message: isAdminKeyRequired()
      ? 'Admin authorization is required for document uploads and deletions.'
      : 'Development mode: No admin passcode configured.'
  });
});

/**
 * POST /api/documents/verify-admin — Verify administrator passcode
 */
router.post('/documents/verify-admin', (req: Request, res: Response) => {
  const adminKey = process.env.ADMIN_KEY?.trim() || process.env.ADMIN_SECRET?.trim();
  if (!adminKey) {
    res.json({ valid: true, message: 'Development mode: No admin passcode required.' });
    return;
  }
  const provided = (req.body?.passcode || req.headers['x-admin-key'] || '').toString().trim();
  if (provided === adminKey) {
    res.json({ valid: true, message: 'Admin passcode verified.' });
  } else {
    res.status(401).json({ valid: false, error: 'Incorrect administrator passcode.' });
  }
});

/**
 * GET /api/documents — List authorized documents with vector indexing status
 */
router.get('/documents', (req: Request, res: Response) => {
  try {
    const { subject, course_id, visibility } = req.query;

    let sql = `
      SELECT 
        d.*,
        c.title as course_title,
        c.code as course_code,
        COUNT(chk.id) as chunk_count
      FROM documents d
      LEFT JOIN courses c ON c.id = d.course_id
      LEFT JOIN document_chunks chk ON chk.document_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (subject && subject !== 'all') {
      sql += ` AND d.subject = ?`;
      params.push(subject);
    }

    if (course_id) {
      sql += ` AND d.course_id = ?`;
      params.push(course_id);
    }

    if (visibility) {
      sql += ` AND d.visibility = ?`;
      params.push(visibility);
    }

    sql += ` GROUP BY d.id ORDER BY d.created_at DESC`;

    const documents = db.prepare(sql).all(...params);
    res.json({ documents });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

/**
 * GET /api/documents/:id — Single document metadata & chunks count
 */
router.get('/documents/:id', (req: Request, res: Response) => {
  try {
    const doc = db.prepare(`
      SELECT 
        d.*,
        c.title as course_title,
        c.code as course_code,
        COUNT(chk.id) as chunk_count
      FROM documents d
      LEFT JOIN courses c ON c.id = d.course_id
      LEFT JOIN document_chunks chk ON chk.document_id = d.id
      WHERE d.id = ?
      GROUP BY d.id
    `).get(req.params.id);

    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.json({ document: doc });
  } catch (error: any) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

/**
 * GET /api/documents/:id/download — Securely download or view original document
 */
router.get('/documents/:id/download', (req: Request, res: Response) => {
  try {
    const doc = db.prepare('SELECT file_name, file_path, mime_type, visibility FROM documents WHERE id = ?').get(req.params.id) as any;

    if (!doc || !doc.file_path || !fs.existsSync(doc.file_path)) {
      res.status(404).json({ error: 'Document file not found on disk' });
      return;
    }

    // Prevent directory traversal
    const safePath = path.resolve(doc.file_path);
    if (!safePath.startsWith(UPLOADS_DIR)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.file_name)}"`);
    fs.createReadStream(safePath).pipe(res);
  } catch (error: any) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

/**
 * POST /api/documents/upload — Upload and trigger asynchronous RAG chunking & vector indexing (Protected)
 */
router.post('/documents/upload', requireAdminAuth, upload.single('file'), async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: 'No document file provided.' });
    return;
  }

  const { title, subject, course_id, description, visibility, uploaded_by } = req.body || {};

  if (!title || !title.trim()) {
    // Clean up uploaded file if validation fails
    fs.unlinkSync(file.path);
    res.status(400).json({ error: 'Document title is required.' });
    return;
  }

  if (!subject || !subject.trim()) {
    fs.unlinkSync(file.path);
    res.status(400).json({ error: 'Document subject is required.' });
    return;
  }

  const documentId = `doc_${randomUUID()}`;

  const docParams = {
    id: documentId,
    title: title.trim(),
    subject: subject.trim(),
    course_id: course_id || null,
    description: description ? description.trim() : '',
    file_name: file.originalname,
    file_path: file.path,
    file_size: file.size,
    mime_type: file.mimetype,
    visibility: (visibility === 'course_only' || visibility === 'admin_only') ? visibility : 'public',
    uploaded_by: uploaded_by || 'Admin (Faculty)',
  };

  try {
    // Start background processing & vector embedding generation
    processAndIndexDocument(docParams).catch((err) => {
      console.error(`Background indexing failed for ${docParams.title}:`, err);
    });

    res.status(202).json({
      success: true,
      message: 'Document uploaded successfully. Vector chunking and embedding generation in progress.',
      document: {
        id: documentId,
        title: docParams.title,
        subject: docParams.subject,
        file_name: docParams.file_name,
        processing_status: 'processing',
      }
    });
  } catch (err: any) {
    console.error('Upload handling error:', err);
    res.status(500).json({ error: err.message || 'Failed to process document upload' });
  }
});

/**
 * DELETE /api/documents/:id — Delete document and cascade delete vector embeddings (Protected)
 */
router.delete('/documents/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const success = deleteDocument(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Document not found or already deleted' });
      return;
    }
    res.json({ success: true, message: 'Document and its vector embeddings deleted.' });
  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

/**
 * POST /api/documents/:id/retry — Retry failed document processing (Protected)
 */
router.post('/documents/:id/retry', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id) as any;
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    processAndIndexDocument({
      id: doc.id,
      title: doc.title,
      subject: doc.subject,
      course_id: doc.course_id,
      description: doc.description,
      file_name: doc.file_name,
      file_path: doc.file_path,
      file_size: doc.file_size,
      mime_type: doc.mime_type,
      visibility: doc.visibility,
      uploaded_by: doc.uploaded_by,
    }).catch(console.error);

    res.json({ success: true, message: 'Re-indexing initiated.' });
  } catch (error: any) {
    console.error('Retry error:', error);
    res.status(500).json({ error: 'Failed to retry indexing' });
  }
});

export default router;

