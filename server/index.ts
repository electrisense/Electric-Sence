import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { initDatabase } from './db';
import healthRouter from './routes/health';
import conversationsRouter from './routes/conversations';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Initialize database schema and tables
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for API calls
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use('/api', healthRouter);
app.use('/api', conversationsRouter);

// 404 handler for unhandled /api requests
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal server error occurred',
    status: 500
  });
});

app.listen(PORT, () => {
  console.log(`⚡ Electric Sence Backend Server running at http://localhost:${PORT}`);
  console.log(`   Health check endpoint: http://localhost:${PORT}/api/health`);
  console.log(`   Conversations endpoint: http://localhost:${PORT}/api/conversations`);
});

export default app;
