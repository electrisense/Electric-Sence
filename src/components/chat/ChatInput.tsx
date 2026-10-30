import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 40), 160)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without shift sends the message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <div className="border-t border-slate-200 bg-white p-3 md:p-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-lg border border-slate-300 bg-white focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-colors shadow-2xs">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask an electrical engineering question, describe a circuit problem, or request project guidance..."
            disabled={isLoading}
            className="w-full resize-none bg-transparent py-2.5 pl-3.5 pr-11 text-sm text-slate-900 placeholder-slate-400 focus:outline-none max-h-40 overflow-y-auto leading-relaxed block"
          />

          <div className="absolute right-1.5 bottom-1.5">
            <button
              onClick={handleSubmit}
              disabled={!canSend}
              className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${
                canSend
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs cursor-pointer'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
              title={canSend ? 'Send message (Enter)' : 'Type a query to send'}
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1.5 px-0.5 text-[11px] text-slate-400">
          <span>
            Press <kbd className="px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono text-[10px]">Shift + Enter</kbd> for new line
          </span>
          <span className="hidden sm:inline font-medium text-slate-400">
            Electric Sence
          </span>
        </div>
      </div>
    </div>
  );
};
