import React from 'react';
import { User, Zap, AlertCircle, Copy, Check } from 'lucide-react';
import type { ChatMessage } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.sender === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 max-w-3xl ml-auto mb-6">
        <div className="flex flex-col items-end">
          <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-xs shadow-2xs text-sm leading-relaxed max-w-xl break-words">
            {message.content}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">{formattedTime}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 text-xs font-semibold">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // AI Assistant Response Component
  return (
    <div className="flex gap-3 max-w-3xl mr-auto mb-6">
      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
        <Zap className="w-4 h-4" />
      </div>

      <div className="flex-1">
        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-2xs">
          {/* Header indicator */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <span className="text-xs font-semibold text-slate-800">Electric Sence Engine</span>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 transition-colors"
              title="Copy response"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Genuine Notice Banner */}
          <div className="rounded-lg bg-amber-50/80 border border-amber-200/80 p-3 mb-3 text-amber-900 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 mb-0.5">
                  AI Integration Status: Not Connected
                </p>
                <p className="text-amber-800 leading-relaxed">
                  The frontend chat pipeline is functioning, but the language model backend is not yet hooked up. In this development phase, no simulated or fabricated AI answers are generated.
                </p>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="text-sm text-slate-700 leading-relaxed space-y-2">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Received Query:</p>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-800 font-mono text-xs">
              "{message.content}"
            </div>
            <p className="text-xs text-slate-500 pt-1">
              Backend endpoint integration (such as an electrical knowledge RAG pipeline or LLM API key) will be configured in the next phase.
            </p>
          </div>
        </div>

        <span className="text-[10px] text-slate-400 mt-1 block font-mono pl-1">{formattedTime}</span>
      </div>
    </div>
  );
};
