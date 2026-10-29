import React, { useRef, useEffect } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import type { ChatMessage } from '../../types';
import { Trash2 } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  isLoading: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  isLoading
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 md:px-8"
      >
        {messages.length === 0 ? (
          <WelcomeScreen onSelectPrompt={onSendMessage} />
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Top Bar inside active chat */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Session ({messages.length} {messages.length === 1 ? 'item' : 'items'})
              </span>
              <button
                onClick={onClearChat}
                className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
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

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 max-w-3xl mr-auto mb-6 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-ping" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-2xs w-64">
                  <div className="h-3 bg-slate-200 rounded w-28 mb-2" />
                  <div className="h-2.5 bg-slate-100 rounded w-44" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};
