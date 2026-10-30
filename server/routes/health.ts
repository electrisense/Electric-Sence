import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/health', (_req, res) => {
  try {
    // Quick query to confirm DB is responding
    db.prepare('SELECT 1').get();
    res.json({
      status: 'ok',
      service: 'Electric Sence Backend API',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'Electric Sence Backend API',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database check failed'
    });
  }
});

export default router;
