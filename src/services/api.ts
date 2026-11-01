import type {
  RagCitation,
  LmsCourse,
  LmsCourseWithLessons,
  LmsLessonDetail,
  LmsStudentStats,
  RagDocumentItem,
  UploadedDocument,
} from '../types';

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

export interface GeminiStatusResponse {
  status: 'configured' | 'unconfigured';
  message: string;
}

export interface GeminiChatResponse {
  message: ApiMessage;
  sources?: RagCitation[];
  usage: object | null;
}

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

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
 * Check if Gemini API key is configured
 */
export async function fetchGeminiStatus(): Promise<GeminiStatusResponse> {
  const res = await fetch(`${API_BASE}/gemini/status`);
  if (!res.ok) {
    throw new Error('Failed to check Gemini status');
  }
  return res.json();
}

/**
 * Send a message to Gemini AI and get an EEE-expert response (with RAG retrieval)
 */
export async function sendGeminiChat(
  conversationId: string,
  message: string,
  history?: Array<{ role: string; parts: Array<{ text: string }> }>,
  useRag = true,
  subject?: string,
  courseId?: string
): Promise<GeminiChatResponse> {
  const res = await fetch(`${API_BASE}/gemini/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversation_id: conversationId,
      message,
      history,
      use_rag: useRag,
      subject,
      course_id: courseId,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data.error || 'AI request failed'), { code: data.code });
  }
  return data;
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

// ─────────────────────────────────────────────────────────────────────────────
// LMS (Learning Management System) Client APIs
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchLmsCourses(userId?: string): Promise<LmsCourse[]> {
  const url = userId ? `${API_BASE}/lms/courses?user_id=${encodeURIComponent(userId)}` : `${API_BASE}/lms/courses`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load LMS courses');
  const data = await res.json();
  return data.courses || [];
}

export async function fetchLmsCourseDetails(courseId: string, userId?: string): Promise<LmsCourseWithLessons> {
  const url = userId ? `${API_BASE}/lms/courses/${courseId}?user_id=${encodeURIComponent(userId)}` : `${API_BASE}/lms/courses/${courseId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load course details');
  const data = await res.json();
  return data.course;
}

export async function fetchLmsLesson(lessonId: string, userId?: string): Promise<LmsLessonDetail> {
  const url = userId ? `${API_BASE}/lms/lessons/${lessonId}?user_id=${encodeURIComponent(userId)}` : `${API_BASE}/lms/lessons/${lessonId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load lesson content');
  const data = await res.json();
  return data.lesson;
}

export async function updateLessonProgress(courseId: string, lessonId: string, completed: boolean, userId?: string) {
  const res = await fetch(`${API_BASE}/lms/lessons/${lessonId}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ course_id: courseId, completed, user_id: userId }),
  });
  if (!res.ok) throw new Error('Failed to update lesson progress');
  return res.json();
}

export async function submitQuizAnswers(quizId: string, answers: number[], userId?: string) {
  const res = await fetch(`${API_BASE}/lms/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, user_id: userId }),
  });
  if (!res.ok) throw new Error('Failed to submit quiz');
  const data = await res.json();
  return data.results;
}

export async function fetchLmsStats(userId?: string): Promise<LmsStudentStats> {
  const url = userId ? `${API_BASE}/lms/stats?user_id=${encodeURIComponent(userId)}` : `${API_BASE}/lms/stats`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load LMS stats');
  const data = await res.json();
  return data.stats;
}

// ─────────────────────────────────────────────────────────────────────────────
// RAG (Retrieval-Augmented Generation) Client APIs
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchRagDocuments(): Promise<RagDocumentItem[]> {
  const res = await fetch(`${API_BASE}/rag/documents`);
  if (!res.ok) throw new Error('Failed to load RAG documents');
  const data = await res.json();
  return data.documents || [];
}

export async function ingestRagDocument(doc: {
  title: string;
  subject: string;
  source_type: string;
  author: string;
  content: string;
}) {
  const res = await fetch(`${API_BASE}/rag/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to ingest RAG document');
  }
  return res.json();
}

export async function testRagSearch(query: string, topK = 3): Promise<{ count: number; results: RagCitation[] }> {
  const res = await fetch(`${API_BASE}/rag/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k: topK }),
  });
  if (!res.ok) throw new Error('RAG search test failed');
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// Document Management & Ingestion Client APIs (Phases 4, 5, 11)
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchLmsSubjects(): Promise<Array<{ name: string; courses_count: number; documents_count: number }>> {
  const res = await fetch(`${API_BASE}/lms/subjects`);
  if (!res.ok) throw new Error('Failed to load subjects');
  const data = await res.json();
  return data.subjects || [];
}

export async function fetchUploadedDocuments(params?: {
  subject?: string;
  course_id?: string;
  visibility?: string;
}): Promise<UploadedDocument[]> {
  const queryParams = new URLSearchParams();
  if (params?.subject && params.subject !== 'all') queryParams.append('subject', params.subject);
  if (params?.course_id) queryParams.append('course_id', params.course_id);
  if (params?.visibility) queryParams.append('visibility', params.visibility);

  const url = `${API_BASE}/documents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch documents');
  const data = await res.json();
  return data.documents || [];
}

export async function fetchAdminStatus(): Promise<{ auth_required: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/documents/admin-status`);
    if (!res.ok) return { auth_required: false, message: 'Admin auth status check failed' };
    return res.json();
  } catch {
    return { auth_required: false, message: 'Admin auth status check failed' };
  }
}

export async function verifyAdminPasscode(passcode: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/documents/verify-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.valid;
  } catch {
    return false;
  }
}

export async function uploadDocument(formData: FormData, adminKey?: string): Promise<{ success: boolean; document: any }> {
  const headers: Record<string, string> = {};
  if (adminKey) {
    headers['x-admin-key'] = adminKey;
  }

  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload document');
  }
  return data;
}

export async function deleteUploadedDocument(documentId: string, adminKey?: string): Promise<boolean> {
  const headers: Record<string, string> = {};
  if (adminKey) {
    headers['x-admin-key'] = adminKey;
  }

  const res = await fetch(`${API_BASE}/documents/${documentId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete document');
  }
  return true;
}

export async function retryDocumentProcessing(documentId: string, adminKey?: string): Promise<boolean> {
  const headers: Record<string, string> = {};
  if (adminKey) {
    headers['x-admin-key'] = adminKey;
  }

  const res = await fetch(`${API_BASE}/documents/${documentId}/retry`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to retry document processing');
  }
  return true;
}
