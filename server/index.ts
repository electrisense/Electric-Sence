import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import rateLimit from 'express-rate-limit';
import { initDatabase } from './db';
import { initLmsAndRagSchema } from './lms/schema';
import { seedCurriculumIfEmpty } from './lms/lmsStore';
import { initRagTables } from './rag/store';
import healthRouter from './routes/health';
import conversationsRouter from './routes/conversations';
import geminiRouter from './routes/gemini';
import ragRouter from './routes/rag';
import lmsRouter from './routes/lms';
import documentsRouter from './routes/documents';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Initialize database schema and tables (Preserving existing data)
initDatabase();
initLmsAndRagSchema();
seedCurriculumIfEmpty();
initRagTables();

// Security: Rate limiting for public deployment protection
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 350,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again later.' },
});

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'AI request limit reached. Please wait a moment before sending another prompt.' },
});

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
}));

app.use(express.json({ limit: '2mb' }));
app.use('/api', apiLimiter);
app.use('/api/gemini/chat', chatLimiter);

// Request logger for API calls
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use('/api', healthRouter);
app.use('/api', conversationsRouter);
app.use('/api', geminiRouter);
app.use('/api', ragRouter);
app.use('/api', lmsRouter);
app.use('/api', documentsRouter);

// 404 handler for unhandled /api requests
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Production: Serve compiled Vite frontend assets
const DIST_PATH = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));

  // SPA fallback for non-API GET routes (enables deep linking & browser refreshes)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(DIST_PATH, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
}

// Centralized error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  if (err?.type === 'entity.parse.failed' || err?.status === 400) {
    res.status(400).json({ error: 'Invalid JSON request payload', status: 400 });
    return;
  }
  res.status(500).json({
    error: 'Internal server error occurred',
    status: 500
  });
});

app.listen(PORT, () => {
  const keyConfigured = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  console.log(`⚡ Electric Sence Backend Server running at http://localhost:${PORT}`);
  console.log(`   Health check:    http://localhost:${PORT}/api/health`);
  console.log(`   LMS Curriculum:  http://localhost:${PORT}/api/lms/courses`);
  console.log(`   RAG Knowledge:   http://localhost:${PORT}/api/rag/documents`);
  console.log(`   Conversations:   http://localhost:${PORT}/api/conversations`);
  console.log(`   Gemini AI:       http://localhost:${PORT}/api/gemini/chat (with RAG enabled)`);
  console.log(`   Gemini status:   ${keyConfigured ? '✅ API key configured' : '⚠️  API key NOT set — add GEMINI_API_KEY to .env'}`);
});

export default app;
