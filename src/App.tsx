import { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ChatInterface } from './components/chat/ChatInterface';
import { SubjectsView } from './components/subjects/SubjectsView';
import { LmsView } from './components/lms/LmsView';
import { RagKnowledgeView } from './components/rag/RagKnowledgeView';
import { AdminDocumentView } from './components/admin/AdminDocumentView';
import { ToolsView } from './components/tools/ToolsView';
import { StudyMaterialsView } from './components/study/StudyMaterialsView';
import { ProjectsView } from './components/projects/ProjectsView';
import { SettingsView } from './components/settings/SettingsView';
import type { NavigationTab, ChatSession, ChatMessage } from './types';
import {
  fetchConversations,
  fetchConversationDetails,
  createConversation,
  sendConversationMessage,
  renameConversation,
  deleteConversation,
  fetchHealth,
  fetchGeminiStatus,
  sendGeminiChat,
} from './services/api';
import { AlertCircle, Zap, ZapOff } from 'lucide-react';

type AiStatus = 'checking' | 'online' | 'offline' | 'unconfigured';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<AiStatus>('checking');

  // LMS & RAG Focus state
  const [selectedCourseFocus, setSelectedCourseFocus] = useState<{
    courseId: string | null;
    subject: string | null;
  }>({ courseId: null, subject: null });
  const [lmsTargetCourseId, setLmsTargetCourseId] = useState<string | null>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Keep a ref to current sessions for accessing inside async callbacks
  const sessionsRef = useRef<ChatSession[]>([]);
  sessionsRef.current = sessions;

  // ─── Backend and AI Status Check ───────────────────────────────────────────
  const checkAiStatus = useCallback(async () => {
    try {
      await fetchHealth();
      const geminiStatus = await fetchGeminiStatus();
      setAiStatus(geminiStatus.status === 'configured' ? 'online' : 'unconfigured');
    } catch {
      setAiStatus('offline');
    }
  }, []);

  // ─── Load Conversations ─────────────────────────────────────────────────────
  const loadConversationsFromBackend = useCallback(async () => {
    try {
      setApiError(null);
      const backendConvs = await fetchConversations();
      const mappedSessions: ChatSession[] = backendConvs.map((c) => ({
        id: c.id,
        title: c.title,
        timestamp: new Date(c.updated_at || c.created_at),
        messages: [],
      }));
      setSessions(mappedSessions);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setApiError('Unable to connect to Electric Sence backend. Running in offline mode.');
      try {
        const saved = localStorage.getItem('electric_sence_sessions');
        if (saved) {
          setSessions(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load sessions from local cache', e);
      }
    }
  }, []);

  useEffect(() => {
    checkAiStatus();
    fetchHealth()
      .then(() => loadConversationsFromBackend())
      .catch(() => loadConversationsFromBackend());
  }, [checkAiStatus, loadConversationsFromBackend]);

  // ─── Load messages when active session changes ──────────────────────────────
  useEffect(() => {
    if (!activeSessionId) return;
    let isMounted = true;

    fetchConversationDetails(activeSessionId)
      .then((data) => {
        if (!isMounted) return;
        const formattedMessages: ChatMessage[] = data.messages.map((m) => ({
          id: m.id,
          sender: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
          timestamp: new Date(m.created_at),
        }));
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, title: data.conversation.title, messages: formattedMessages }
              : s
          )
        );
      })
      .catch((err) => console.error('Failed to fetch conversation details:', err));

    return () => { isMounted = false; };
  }, [activeSessionId]);

  const currentSession = sessions.find((s) => s.id === activeSessionId);
  const messages = currentSession ? currentSession.messages : [];

  // ─── Build Gemini Chat History from session messages ──────────────────────
  const buildChatHistory = (msgs: ChatMessage[]) => {
    // Exclude the last message (current user msg — sent separately)
    const historyMsgs = msgs.slice(0, -1);
    return historyMsgs
      .filter((m) => m.sender === 'user' || m.sender === 'assistant')
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));
  };

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const handleNewChat = () => {
    setActiveSessionId(null);
    setCurrentTab('chat');
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setCurrentTab('chat');
  };

  // ─── Rename / Delete / Clear ────────────────────────────────────────────────
  const handleRenameSession = async (id: string, newTitle: string) => {
    try {
      setApiError(null);
      const updated = await renameConversation(id, newTitle);
      setSessions((prev) => prev.map((s) => s.id === id ? { ...s, title: updated.title } : s));
    } catch (err) {
      console.error('Failed to rename conversation:', err);
      setApiError('Could not rename conversation. Please try again.');
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    try {
      setApiError(null);
      await deleteConversation(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) setActiveSessionId(null);
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setApiError('Could not delete conversation. Please try again.');
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your entire conversation history?')) return;
    try {
      setApiError(null);
      for (const s of sessions) {
        await deleteConversation(s.id).catch(() => {});
      }
      setSessions([]);
      setActiveSessionId(null);
      localStorage.removeItem('electric_sence_sessions');
    } catch (err) {
      console.error('Failed to clear history:', err);
      setApiError('Failed to clear all conversations.');
    }
  };

  const handleClearCurrentChat = async () => {
    if (!activeSessionId) return;
    await handleDeleteSession(activeSessionId);
  };

  // ─── Send Message (with Gemini AI & Grounded RAG) ─────────────────────────
  const handleSendMessage = async (text: string, subjectOverride?: string, courseIdOverride?: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setApiError(null);

    const subjectToUse = subjectOverride ?? selectedCourseFocus.subject ?? undefined;
    const courseIdToUse = courseIdOverride ?? selectedCourseFocus.courseId ?? undefined;

    try {
      let targetSessionId = activeSessionId;
      let currentMessages: ChatMessage[] = [];

      // ── 1. Create or reuse conversation ──────────────────────────────────
      if (!targetSessionId) {
        const newConv = await createConversation(undefined, subjectToUse || 'General Electrical', trimmed);
        targetSessionId = newConv.id;

        const initialUserMsg: ChatMessage = {
          id: `usr_${Date.now()}`,
          sender: 'user',
          content: trimmed,
          timestamp: new Date(),
        };

        const newSession: ChatSession = {
          id: targetSessionId,
          title: newConv.title,
          timestamp: new Date(newConv.created_at),
          messages: [initialUserMsg],
        };

        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(targetSessionId);
        currentMessages = [initialUserMsg];
      } else {
        // ── 2. Save user message to DB ──────────────────────────────────────
        const savedMsg = await sendConversationMessage(targetSessionId, 'user', trimmed);
        const userMsg: ChatMessage = {
          id: savedMsg.id,
          sender: 'user',
          content: savedMsg.content,
          timestamp: new Date(savedMsg.created_at),
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === targetSessionId
              ? {
                  ...s,
                  title: s.title === 'New Electrical Chat'
                    ? (trimmed.length > 36 ? trimmed.substring(0, 36) + '...' : trimmed)
                    : s.title,
                  messages: [...s.messages, userMsg],
                }
              : s
          )
        );

        // Get current session messages for history
        const session = sessionsRef.current.find((s) => s.id === targetSessionId);
        currentMessages = session ? [...session.messages, userMsg] : [userMsg];
      }

      // ── 3. Call Gemini AI ─────────────────────────────────────────────────
      if (aiStatus === 'online') {
        try {
          const history = buildChatHistory(currentMessages);
          const geminiResponse = await sendGeminiChat(
            targetSessionId!,
            trimmed,
            history,
            true,
            subjectToUse,
            courseIdToUse
          );

          const assistantMsg: ChatMessage = {
            id: geminiResponse.message.id,
            sender: 'assistant',
            content: geminiResponse.message.content,
            timestamp: new Date(geminiResponse.message.created_at),
            sources: geminiResponse.sources || [],
          };

          setSessions((prev) =>
            prev.map((s) =>
              s.id === targetSessionId
                ? { ...s, messages: [...s.messages, assistantMsg] }
                : s
            )
          );
        } catch (geminiErr: any) {
          console.error('Gemini error:', geminiErr);

          let errorMsg = '⚠️ AI response failed.';
          if (geminiErr?.code === 'API_KEY_MISSING' || geminiErr?.code === 'INVALID_API_KEY') {
            setAiStatus('unconfigured');
            errorMsg = '⚠️ Gemini API key is invalid or missing. Please configure your `.env` file.';
          } else if (geminiErr?.code === 'QUOTA_EXCEEDED') {
            errorMsg = '⚠️ AI quota exceeded. Please wait a moment and try again.';
          } else {
            errorMsg = `⚠️ ${geminiErr?.message || 'AI response unavailable. Please try again.'}`;
          }

          // Save error as system message in DB
          const savedErrMsg = await sendConversationMessage(
            targetSessionId!,
            'system',
            errorMsg
          ).catch(() => null);

          const errChatMsg: ChatMessage = {
            id: savedErrMsg?.id || `err_${Date.now()}`,
            sender: 'system',
            content: errorMsg,
            timestamp: new Date(),
          };

          setSessions((prev) =>
            prev.map((s) =>
              s.id === targetSessionId
                ? { ...s, messages: [...s.messages, errChatMsg] }
                : s
            )
          );
        }
      } else {
        // ── 4. Offline / unconfigured — show helpful notice ────────────────
        const noticeText = aiStatus === 'unconfigured'
          ? '🔑 Gemini API key is not configured. Please add your `GEMINI_API_KEY` to the `.env` file in your project root, then restart the backend server (`npm run server`).'
          : '📡 The AI backend is currently offline. Please start the backend server with `npm run server` and ensure it is running on port 3001.';

        const savedNotice = await sendConversationMessage(
          targetSessionId!,
          'system',
          noticeText
        ).catch(() => null);

        const noticeMsg: ChatMessage = {
          id: savedNotice?.id || `notice_${Date.now()}`,
          sender: 'system',
          content: noticeText,
          timestamp: new Date(),
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === targetSessionId
              ? { ...s, messages: [...s.messages, noticeMsg] }
              : s
          )
        );
      }
    } catch (err) {
      console.error('Error in handleSendMessage:', err);
      setApiError('Failed to send message. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskInChat = (prompt: string, subject?: string, courseId?: string) => {
    if (courseId || subject) {
      setSelectedCourseFocus({ courseId: courseId || null, subject: subject || null });
    }
    setCurrentTab('chat');
    handleSendMessage(prompt, subject, courseId);
  };

  const handleOpenCourse = (courseId: string) => {
    setLmsTargetCourseId(courseId);
    setCurrentTab('lms');
  };

  // ─── AI Status Badge ─────────────────────────────────────────────────────
  const renderAiBadge = () => {
    if (aiStatus === 'online') {
      return (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
          <Zap className="w-3 h-3 fill-emerald-500 text-emerald-500" />
          AI Online
        </div>
      );
    }
    if (aiStatus === 'checking') {
      return (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-500 font-medium">
          <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
          Connecting...
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
        <ZapOff className="w-3 h-3 text-amber-500" />
        {aiStatus === 'unconfigured' ? 'API Key Missing' : 'AI Offline'}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onNewChat={handleNewChat}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onClearHistory={handleClearHistory}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        aiStatus={aiStatus}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-white">
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          activeSessionTitle={currentSession?.title}
          aiStatusBadge={renderAiBadge()}
        />

        {/* API Error Banner */}
        {apiError && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-rose-600 hover:text-rose-900 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Switcher */}
        <main className="flex-1 flex flex-col min-h-0 relative bg-white overflow-hidden">
          {currentTab === 'chat' && (
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearCurrentChat}
              isLoading={isLoading}
              aiStatus={aiStatus}
              selectedCourseId={selectedCourseFocus.courseId}
              selectedSubject={selectedCourseFocus.subject}
              onSelectCourseFocus={(courseId, subject) =>
                setSelectedCourseFocus({ courseId, subject })
              }
            />
          )}
          {currentTab === 'lms' && (
            <LmsView
              onAskInChat={handleAskInChat}
              initialCourseId={lmsTargetCourseId}
            />
          )}
          {currentTab === 'rag-docs' && <RagKnowledgeView onAskInChat={handleAskInChat} />}
          {currentTab === 'admin-docs' && <AdminDocumentView />}
          {currentTab === 'subjects' && (
            <SubjectsView
              onAskInChat={handleAskInChat}
              onOpenCourse={handleOpenCourse}
            />
          )}
          {currentTab === 'tools' && <ToolsView />}
          {currentTab === 'study-materials' && <StudyMaterialsView />}
          {currentTab === 'projects' && <ProjectsView onAskInChat={handleAskInChat} />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export default App;
