import { Request, Response, NextFunction } from 'express';

/**
 * Admin Authorization Middleware for Document Ingestion, Deletion, and Maintenance
 * Reads ADMIN_KEY from environment variables.
 * In production, any mutation on study materials or RAG vectors requires this key.
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const adminKey = process.env.ADMIN_KEY?.trim() || process.env.ADMIN_SECRET?.trim();

  // If no admin key is configured in local dev, allow with development notice
  if (!adminKey) {
    res.setHeader('x-admin-notice', 'Development mode: ADMIN_KEY is not set.');
    return next();
  }

  // Check headers: 'x-admin-key' or 'authorization: Bearer <key>'
  const headerKey = req.headers['x-admin-key'] as string | undefined;
  const authHeader = req.headers.authorization;
  const bearerKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;

  const providedKey = (headerKey || bearerKey || '').trim();

  if (!providedKey || providedKey !== adminKey) {
    res.status(401).json({
      error: 'Unauthorized: A valid administrator passcode (x-admin-key) is required to perform this action.',
      code: 'ADMIN_AUTH_REQUIRED'
    });
    return;
  }

  next();
}

/**
 * Check if the server requires an admin key
 */
export function isAdminKeyRequired(): boolean {
  const adminKey = process.env.ADMIN_KEY?.trim() || process.env.ADMIN_SECRET?.trim();
  return !!adminKey;
}

