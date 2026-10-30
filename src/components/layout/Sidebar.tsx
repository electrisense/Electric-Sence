import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  BookOpen, 
  Calculator, 
  FileText, 
  FolderGit2, 
  Settings, 
  Zap, 
  X,
  History,
  Trash2,
  Edit2,
  Check
} from 'lucide-react';
import type { NavigationTab, ChatSession } from '../../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onNewChat: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onClearHistory: () => void;
  onDeleteSession?: (id: string) => void;
  onRenameSession?: (id: string, newTitle: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onNewChat,
  sessions,
  activeSessionId,
  onSelectSession,
  onClearHistory,
  onDeleteSession,
  onRenameSession,
  isOpenMobile,
  onCloseMobile
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const navItems = [
    { id: 'chat' as NavigationTab, label: 'Chat Assistant', icon: MessageSquare },
    { id: 'subjects' as NavigationTab, label: 'EE Subjects', icon: BookOpen },
    { id: 'tools' as NavigationTab, label: 'Engineering Tools', icon: Calculator },
    { id: 'study-materials' as NavigationTab, label: 'Study Materials', icon: FileText },
    { id: 'projects' as NavigationTab, label: 'My Projects', icon: FolderGit2 },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
  ];

  const uniqueSessions = sessions.filter(
    (sess, index, self) => index === self.findIndex((s) => s.id === sess.id)
  );

  const startRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (id: string, e: React.FormEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim() && onRenameSession) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteSession) {
      onDeleteSession(id);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/30 z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container (Light Grey Theme) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-50 border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          isOpenMobile ? 'translate-x-0 shadow-lg' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center">
              <Zap className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <span className="font-semibold text-slate-900 text-sm tracking-tight block leading-none">
                Electric Sence
              </span>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                EEE Educational Platform
              </span>
            </div>
          </div>
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button: New Chat */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-medium text-xs transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Primary Navigation */}
        <div className="px-3 py-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
            Navigation
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600 rounded-l-none'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Conversation History Section */}
        <div className="flex-1 flex flex-col min-h-0 px-3 pt-3 pb-2 border-t border-slate-200 mt-2">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <History className="w-3 h-3" />
              Recent Sessions
            </span>
            {uniqueSessions.length > 0 && (
              <button
                onClick={onClearHistory}
                title="Clear all chat history"
                className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-0.5 pr-0.5">
            {uniqueSessions.length === 0 ? (
              <div className="px-2 py-3 text-[11px] text-slate-400 text-center italic">
                No past conversations
              </div>
            ) : (
              uniqueSessions.map((sess) => {
                const isSelected = currentTab === 'chat' && activeSessionId === sess.id;
                const isEditing = editingId === sess.id;

                if (isEditing) {
                  return (
                    <div 
                      key={sess.id}
                      className="px-2 py-1 bg-white border border-blue-400 rounded-md flex items-center gap-1"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(sess.id, e);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
                      />
                      <button
                        onClick={(e) => handleSaveRename(sess.id, e)}
                        className="text-blue-600 hover:text-blue-800 p-0.5"
                        title="Save rename"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={sess.id}
                    onClick={() => {
                      onSelectSession(sess.id);
                      onSelectTab('chat');
                      onCloseMobile();
                    }}
                    className={`group w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className="w-3 h-3 shrink-0 opacity-50" />
                      <span className="truncate">{sess.title}</span>
                    </div>

                    <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-1">
                      <button
                        onClick={(e) => startRename(sess.id, sess.title, e)}
                        className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                        title="Rename conversation"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(sess.id, e)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer / System Info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="font-mono text-[10px]">v0.2.0-db</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              AI Offline
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
