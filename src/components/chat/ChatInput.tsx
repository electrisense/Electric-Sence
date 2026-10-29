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
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
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

  return (
    <div className="border-t border-slate-200 bg-white p-3 md:p-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-xl border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-2xs">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about electrical circuits, machines, power systems, or projects..."
            disabled={isLoading}
            className="w-full resize-none bg-transparent py-3 pl-4 pr-12 text-sm text-slate-800 placeholder-slate-400 focus:outline-none max-h-40 overflow-y-auto leading-relaxed"
          />

          <div className="absolute right-2 bottom-2">
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                input.trim() && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
              title="Send message (Enter)"
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
          <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono text-[10px]">Shift + Enter</kbd> for new line</span>
          <span className="hidden sm:inline">Electric Sence EEE Assistant</span>
        </div>
      </div>
    </div>
  );
};
