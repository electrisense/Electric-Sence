import { Router, Request, Response } from 'express';
import { db } from '../db';
import { randomUUID } from 'node:crypto';

const router = Router();

interface ConversationRow {
  id: string;
  title: string;
  subject: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

/**
 * GET /api/conversations
 * Fetch all conversations ordered by recent activity
 */
router.get('/conversations', (_req: Request, res: Response) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        c.id,
        c.title,
        c.subject,
        c.created_at,
        c.updated_at,
        COUNT(m.id) as message_count
      FROM conversations c
      LEFT JOIN messages m ON c.id = m.conversation_id
      GROUP BY c.id
      ORDER BY c.updated_at DESC
    `);
    const rows = stmt.all() as ConversationRow[];
    res.json({ conversations: rows });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
});

/**
 * POST /api/conversations
 * Create a new conversation session
 */
router.post('/conversations', (req: Request, res: Response) => {
  try {
    const { title, subject, initial_message } = req.body || {};

    const id = `conv_${randomUUID()}`;
    const now = new Date().toISOString();
    
    // Auto title if initial message provided
    let finalTitle = (title && typeof title === 'string' && title.trim())
      ? title.trim()
      : (initial_message && typeof initial_message === 'string' && initial_message.trim())
        ? (initial_message.trim().length > 36 ? initial_message.trim().substring(0, 36) + '...' : initial_message.trim())
        : 'New Electrical Chat';

    const finalSubject = (subject && typeof subject === 'string' && subject.trim())
      ? subject.trim()
      : 'General Electrical';

    const insertConv = db.prepare(`
      INSERT INTO conversations (id, title, subject, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertConv.run(id, finalTitle, finalSubject, now, now);

    // If an initial message was included, save it immediately
    if (initial_message && typeof initial_message === 'string' && initial_message.trim()) {
      const msgId = `msg_${randomUUID()}`;
      const insertMsg = db.prepare(`
        INSERT INTO messages (id, conversation_id, role, content, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertMsg.run(msgId, id, 'user', initial_message.trim(), now);
    }

    const getCreated = db.prepare(`
      SELECT id, title, subject, created_at, updated_at
      FROM conversations
      WHERE id = ?
    `);
    const created = getCreated.get(id) as ConversationRow;

    res.status(201).json({ conversation: created });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

/**
 * GET /api/conversations/:id
 * Retrieve single conversation and all its messages
 */
router.get('/conversations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const convStmt = db.prepare(`
      SELECT id, title, subject, created_at, updated_at
      FROM conversations
      WHERE id = ?
    `);
    const conversation = convStmt.get(id) as ConversationRow | undefined;

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const messagesStmt = db.prepare(`
      SELECT id, conversation_id, role, content, created_at
      FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
    `);
    const messages = messagesStmt.all(id) as MessageRow[];

    res.json({
      conversation,
      messages
    });
  } catch (error) {
    console.error('Error fetching conversation details:', error);
    res.status(500).json({ error: 'Failed to retrieve conversation details' });
  }
});

/**
 * POST /api/conversations/:id/messages
 * Add a message to an existing conversation
 */
router.post('/conversations/:id/messages', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, content } = req.body || {};

    if (!content || typeof content !== 'string' || !content.trim()) {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }

    const validRoles = ['user', 'assistant', 'system'];
    const finalRole = validRoles.includes(role) ? role : 'user';

    // Verify conversation exists
    const convStmt = db.prepare(`SELECT id, title FROM conversations WHERE id = ?`);
    const conv = convStmt.get(id) as ConversationRow | undefined;

    if (!conv) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const msgId = `msg_${randomUUID()}`;
    const now = new Date().toISOString();

    const insertMsg = db.prepare(`
      INSERT INTO messages (id, conversation_id, role, content, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertMsg.run(msgId, id, finalRole, content.trim(), now);

    // Update conversation timestamp (and title if still placeholder)
    if (conv.title === 'New Electrical Chat' && finalRole === 'user') {
      const generatedTitle = content.trim().length > 36 
        ? content.trim().substring(0, 36) + '...' 
        : content.trim();
      const updateConv = db.prepare(`
        UPDATE conversations 
        SET updated_at = ?, title = ?
        WHERE id = ?
      `);
      updateConv.run(now, generatedTitle, id);
    } else {
      const updateTime = db.prepare(`
        UPDATE conversations 
        SET updated_at = ?
        WHERE id = ?
      `);
      updateTime.run(now, id);
    }

    const createdMsg: MessageRow = {
      id: msgId,
      conversation_id: id,
      role: finalRole,
      content: content.trim(),
      created_at: now
    };

    res.status(201).json({ message: createdMsg });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

/**
 * PATCH /api/conversations/:id
 * Rename or update conversation metadata
 */
router.patch('/conversations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, subject } = req.body || {};

    const convStmt = db.prepare(`SELECT id FROM conversations WHERE id = ?`);
    const exists = convStmt.get(id);

    if (!exists) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (title && typeof title === 'string' && title.trim()) {
      updates.push('title = ?');
      values.push(title.trim());
    }

    if (subject && typeof subject === 'string' && subject.trim()) {
      updates.push('subject = ?');
      values.push(subject.trim());
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No valid fields provided for update' });
      return;
    }

    const now = new Date().toISOString();
    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const updateStmt = db.prepare(`
      UPDATE conversations
      SET ${updates.join(', ')}
      WHERE id = ?
    `);
    updateStmt.run(...values);

    const getUpdated = db.prepare(`
      SELECT id, title, subject, created_at, updated_at
      FROM conversations
      WHERE id = ?
    `);
    const updated = getUpdated.get(id) as ConversationRow;

    res.json({ conversation: updated });
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

/**
 * DELETE /api/conversations/:id
 * Delete a conversation and associated messages
 */
router.delete('/conversations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const checkStmt = db.prepare(`SELECT id FROM conversations WHERE id = ?`);
    const exists = checkStmt.get(id);

    if (!exists) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const deleteStmt = db.prepare(`DELETE FROM conversations WHERE id = ?`);
    deleteStmt.run(id);

    res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

export default router;
