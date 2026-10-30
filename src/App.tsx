import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ChatInterface } from './components/chat/ChatInterface';
import { SubjectsView } from './components/subjects/SubjectsView';
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
  fetchHealth
} from './services/api';
import { AlertCircle } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Load conversations from backend
  const loadConversationsFromBackend = useCallback(async () => {
    try {
      setApiError(null);
      const backendConvs = await fetchConversations();
      
      const mappedSessions: ChatSession[] = backendConvs.map((c) => ({
        id: c.id,
        title: c.title,
        timestamp: new Date(c.updated_at || c.created_at),
        messages: [] // loaded on demand when selected
      }));

      setSessions(mappedSessions);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setApiError('Unable to connect to Electric Sence backend service. Running in offline mode.');
      
      // Fallback to local storage if server is starting
      try {
        const saved = localStorage.getItem('electric_sence_sessions');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSessions(parsed);
        }
      } catch (e) {
        console.error('Failed to load sessions from local cache', e);
      }
    }
  }, []);

  useEffect(() => {
    // Initial health check and conversations fetch
    fetchHealth()
      .then(() => loadConversationsFromBackend())
      .catch(() => {
        loadConversationsFromBackend();
      });
  }, [loadConversationsFromBackend]);

  // Load messages whenever active session changes
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
          timestamp: new Date(m.created_at)
        }));

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, title: data.conversation.title, messages: formattedMessages }
              : s
          )
        );
      })
      .catch((err) => {
        console.error('Failed to fetch conversation details:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [activeSessionId]);

  // Active messages based on current session
  const currentSession = sessions.find((s) => s.id === activeSessionId);
  const messages = currentSession ? currentSession.messages : [];

  const handleNewChat = () => {
    setActiveSessionId(null);
    setCurrentTab('chat');
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setCurrentTab('chat');
  };

  const handleRenameSession = async (id: string, newTitle: string) => {
    try {
      setApiError(null);
      const updated = await renameConversation(id, newTitle);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, title: updated.title } : s
        )
      );
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
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setApiError('Could not delete conversation. Please try again.');
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your conversation history?')) return;
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

  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setApiError(null);

    try {
      let targetSessionId = activeSessionId;

      if (!targetSessionId) {
        // Create conversation in backend
        const newConv = await createConversation(undefined, 'General Electrical', trimmed);
        targetSessionId = newConv.id;
        
        const initialUserMsg: ChatMessage = {
          id: `usr_${Date.now()}`,
          sender: 'user',
          content: trimmed,
          timestamp: new Date()
        };

        const newSession: ChatSession = {
          id: targetSessionId,
          title: newConv.title,
          timestamp: new Date(newConv.created_at),
          messages: [initialUserMsg]
        };

        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(targetSessionId);
      } else {
        // Post message to existing conversation
        const savedMsg = await sendConversationMessage(targetSessionId, 'user', trimmed);
        const userMsg: ChatMessage = {
          id: savedMsg.id,
          sender: 'user',
          content: savedMsg.content,
          timestamp: new Date(savedMsg.created_at)
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === targetSessionId
              ? { 
                  ...s, 
                  title: s.title === 'New Electrical Chat' 
                    ? (trimmed.length > 36 ? trimmed.substring(0, 36) + '...' : trimmed) 
                    : s.title,
                  messages: [...s.messages, userMsg] 
                }
              : s
          )
        );
      }

      // Store authentic offline assistant notice in database as well
      const assistantNoticeText = "AI integration status is currently offline. Your question has been saved to the Electric Sence database, and real AI reasoning engine responses will be enabled in Phase 2.";

      setTimeout(async () => {
        try {
          if (targetSessionId) {
            const savedAssistantMsg = await sendConversationMessage(
              targetSessionId,
              'assistant',
              assistantNoticeText
            );

            const assistantMsg: ChatMessage = {
              id: savedAssistantMsg.id,
              sender: 'assistant',
              content: savedAssistantMsg.content,
              timestamp: new Date(savedAssistantMsg.created_at)
            };

            setSessions((prev) =>
              prev.map((s) =>
                s.id === targetSessionId
                  ? { ...s, messages: [...s.messages, assistantMsg] }
                  : s
              )
            );
          }
        } catch (e) {
          console.error('Error saving assistant message:', e);
        } finally {
          setIsLoading(false);
        }
      }, 500);

    } catch (err) {
      console.error('Error in handleSendMessage:', err);
      setApiError('Failed to send message to backend. Please check connection.');
      setIsLoading(false);
    }
  };

  const handleAskInChat = (prompt: string) => {
    setCurrentTab('chat');
    handleSendMessage(prompt);
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
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-white">
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          activeSessionTitle={currentSession?.title}
        />

        {/* API Error Notification Banner */}
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
            />
          )}

          {currentTab === 'subjects' && (
            <SubjectsView onAskInChat={handleAskInChat} />
          )}

          {currentTab === 'tools' && (
            <ToolsView />
          )}

          {currentTab === 'study-materials' && (
            <StudyMaterialsView />
          )}

          {currentTab === 'projects' && (
            <ProjectsView onAskInChat={handleAskInChat} />
          )}

          {currentTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
