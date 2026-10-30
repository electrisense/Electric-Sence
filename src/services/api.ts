export interface ApiConversation {
  id: string;
  title: string;
  subject: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface ApiMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

const API_BASE = '/api';

/**
 * Check backend health and DB status
 */
export async function fetchHealth(): Promise<{ status: string; database: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error('Backend service unavailable');
  }
  return res.json();
}

/**
 * Fetch all conversations
 */
export async function fetchConversations(): Promise<ApiConversation[]> {
  const res = await fetch(`${API_BASE}/conversations`);
  if (!res.ok) {
    throw new Error('Failed to load conversations from server');
  }
  const data = await res.json();
  return data.conversations || [];
}

/**
 * Create a new conversation session
 */
export async function createConversation(
  title?: string,
  subject?: string,
  initial_message?: string
): Promise<ApiConversation> {
  const res = await fetch(`${API_BASE}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, subject, initial_message })
  });

  if (!res.ok) {
    throw new Error('Failed to create new conversation');
  }
  const data = await res.json();
  return data.conversation;
}

/**
 * Fetch single conversation with messages
 */
export async function fetchConversationDetails(
  id: string
): Promise<{ conversation: ApiConversation; messages: ApiMessage[] }> {
  const res = await fetch(`${API_BASE}/conversations/${id}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Conversation not found');
    }
    throw new Error('Failed to load conversation details');
  }
  return res.json();
}

/**
 * Send and store a message in the conversation
 */
export async function sendConversationMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<ApiMessage> {
  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, content })
  });

  if (!res.ok) {
    throw new Error('Failed to send message');
  }
  const data = await res.json();
  return data.message;
}

/**
 * Rename conversation
 */
export async function renameConversation(
  id: string,
  title: string
): Promise<ApiConversation> {
  const res = await fetch(`${API_BASE}/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });

  if (!res.ok) {
    throw new Error('Failed to rename conversation');
  }
  const data = await res.json();
  return data.conversation;
}

/**
 * Delete a conversation
 */
export async function deleteConversation(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/conversations/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    throw new Error('Failed to delete conversation');
  }
  return true;
}
