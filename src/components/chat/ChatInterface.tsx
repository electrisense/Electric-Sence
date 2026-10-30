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
    <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
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
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Conversation ({messages.length} {messages.length === 1 ? 'message' : 'messages'})
              </span>
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

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 max-w-3xl mr-auto mb-6">
                <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 w-64 shadow-2xs">
                  <div className="h-2.5 bg-slate-200 rounded w-24 mb-2 animate-pulse" />
                  <div className="h-2 bg-slate-100 rounded w-40 animate-pulse" />
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
