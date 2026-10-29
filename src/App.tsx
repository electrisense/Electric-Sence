import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ChatInterface } from './components/chat/ChatInterface';
import { SubjectsView } from './components/subjects/SubjectsView';
import { ToolsView } from './components/tools/ToolsView';
import { StudyMaterialsView } from './components/study/StudyMaterialsView';
import { ProjectsView } from './components/projects/ProjectsView';
import { SettingsView } from './components/settings/SettingsView';
import type { NavigationTab, ChatSession, ChatMessage } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initial demo sessions or loaded from localStorage
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('electric_sence_sessions');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load sessions from storage', e);
    }
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Active messages based on current session
  const currentSession = sessions.find((s) => s.id === activeSessionId);
  const messages = currentSession ? currentSession.messages : [];

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem('electric_sence_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to persist sessions', e);
    }
  }, [sessions]);

  const handleNewChat = () => {
    setActiveSessionId(null);
    setCurrentTab('chat');
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setCurrentTab('chat');
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your chat history?')) {
      setSessions([]);
      setActiveSessionId(null);
    }
  };

  const handleClearCurrentChat = () => {
    if (!activeSessionId) return;
    setSessions((prev) => prev.filter((s) => s.id !== activeSessionId));
    setActiveSessionId(null);
  };

  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date()
    };

    let targetSessionId = activeSessionId;

    if (!targetSessionId) {
      // Create new session
      const newSessionTitle = text.length > 32 ? text.substring(0, 32) + '...' : text;
      const newSession: ChatSession = {
        id: `sess_${Date.now()}`,
        title: newSessionTitle,
        timestamp: new Date(),
        messages: [userMsg]
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      targetSessionId = newSession.id;
    } else {
      // Append to active session
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, messages: [...s.messages, userMsg] }
            : s
        )
      );
    }

    // Simulate realistic loading state, then respond with authentic offline notice
    setIsLoading(true);
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        content: text,
        timestamp: new Date()
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, messages: [...s.messages, assistantMsg] }
            : s
        )
      );
      setIsLoading(false);
    }, 650);
  };

  const handleAskInChat = (prompt: string) => {
    setCurrentTab('chat');
    handleSendMessage(prompt);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onNewChat={handleNewChat}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onClearHistory={handleClearHistory}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          activeSessionTitle={currentSession?.title}
        />

        {/* View Switcher */}
        <main className="flex-1 flex flex-col min-h-0 relative">
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
