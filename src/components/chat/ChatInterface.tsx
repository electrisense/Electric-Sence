import React, { useRef, useEffect, useState } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import type { ChatMessage, LmsCourse } from '../../types';
import { Trash2, GraduationCap, X, Sparkles } from 'lucide-react';
import { fetchLmsCourses } from '../../services/api';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, subject?: string, courseId?: string) => void;
  onClearChat: () => void;
  isLoading: boolean;
  aiStatus?: 'checking' | 'online' | 'offline' | 'unconfigured';
  selectedCourseId: string | null;
  selectedSubject: string | null;
  onSelectCourseFocus: (courseId: string | null, subject: string | null) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  aiStatus,
  selectedCourseId,
  selectedSubject,
  onSelectCourseFocus,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [courses, setCourses] = useState<LmsCourse[]>([]);

  useEffect(() => {
    fetchLmsCourses()
      .then(setCourses)
      .catch((err) => console.error('Failed to load courses for chat selector:', err));
  }, []);

  const currentCourse = courses.find((c) => c.id === selectedCourseId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  const handleSend = (text: string, subjectOverride?: string, courseIdOverride?: string) => {
    const finalSubject = subjectOverride ?? selectedSubject ?? undefined;
    const finalCourseId = courseIdOverride ?? selectedCourseId ?? undefined;
    onSendMessage(text, finalSubject, finalCourseId);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
      {/* Course Context & Targeted RAG Focus Selector (Phase 10 LMS Chat Integration) */}
      <div className="bg-slate-50/80 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold text-slate-700 shrink-0">Course Context:</span>
          <select
            value={selectedCourseId || ''}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                onSelectCourseFocus(null, null);
              } else {
                const found = courses.find((item) => item.id === val);
                onSelectCourseFocus(val, found?.subject || null);
              }
            }}
            className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 truncate max-w-[260px] sm:max-w-md shadow-2xs"
          >
            <option value="">General Electrical Assistant (All Subjects & Materials)</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} · {c.title}
              </option>
            ))}
          </select>
        </div>

        {selectedCourseId && currentCourse && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              RAG Grounding: {currentCourse.code}
            </span>
            <button
              onClick={() => onSelectCourseFocus(null, null)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/60 transition-colors"
              title="Reset to general assistant"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 md:px-8"
      >
        {messages.length === 0 ? (
          <WelcomeScreen
            onSelectPrompt={(prompt, subj, cId) => {
              if (cId || subj) {
                onSelectCourseFocus(cId || null, subj || null);
              }
              handleSend(prompt, subj, cId);
            }}
            aiStatus={aiStatus}
          />
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Top Bar inside active chat */}
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Conversation ({messages.length} {messages.length === 1 ? 'message' : 'messages'})
                </span>
                {selectedCourseId && currentCourse && (
                  <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {currentCourse.code}
                  </span>
                )}
              </div>
              <button
                onClick={onClearChat}
                className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-50 border border-slate-200 transition-colors"
                title="Reset conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Chat</span>
              </button>
            </div>

            {/* Message Stream */}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Loading Indicator — Gemini is thinking */}
            {isLoading && (
              <div className="flex gap-3 max-w-3xl mr-auto mb-6">
                <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 shadow-2xs">
                  <p className="text-xs text-slate-500 mb-2">
                    {selectedCourseId && currentCourse
                      ? `Electric Sence AI is searching ${currentCourse.code} study materials and thinking…`
                      : 'Electric Sence AI is searching study materials and thinking…'}
                  </p>
                  <div className="flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <ChatInput onSendMessage={handleSend} isLoading={isLoading} />
    </div>
  );
};
