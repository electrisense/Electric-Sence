import React, { useState } from 'react';
import { User, Zap, AlertCircle, Copy, Check } from 'lucide-react';
import type { ChatMessage } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
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
      <div className="flex justify-end gap-3 max-w-3xl ml-auto mb-5">
        <div className="flex flex-col items-end">
          <div className="bg-blue-600 text-white px-3.5 py-2.5 rounded-lg text-sm leading-relaxed max-w-xl break-words shadow-2xs">
            {message.content}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">{formattedTime}</span>
        </div>
        <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
          <User className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  }

  // AI Assistant Response Component
  return (
    <div className="flex gap-3 max-w-3xl mr-auto mb-5">
      <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
        <Zap className="w-3.5 h-3.5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          {/* Header indicator */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2.5">
            <span className="text-xs font-semibold text-slate-800">Electric Sence Engine</span>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 transition-colors"
              title="Copy query text"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Genuine Notice Banner */}
          <div className="rounded-md bg-amber-50 border border-amber-200 p-2.5 mb-2.5 text-amber-900 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 mb-0.5">
                  AI Integration Status: Not Connected
                </p>
                <p className="text-amber-800 leading-relaxed text-[11px]">
                  The frontend chat pipeline is active, but the backend language model is not connected yet. No simulated or fabricated AI answers are generated.
                </p>
              </div>
            </div>
          </div>

          {/* Query echo and explanation */}
          <div className="text-xs text-slate-700 leading-relaxed space-y-1.5">
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Received Query:</p>
            <div className="p-2 bg-white rounded border border-slate-200 text-slate-800 font-mono text-xs">
              "{message.content}"
            </div>
            <p className="text-[11px] text-slate-500 pt-0.5">
              Backend endpoint integration (electrical engineering RAG pipeline or model API) will connect in the next phase.
            </p>
          </div>
        </div>

        <span className="text-[10px] text-slate-400 mt-1 block font-mono pl-0.5">{formattedTime}</span>
      </div>
    </div>
  );
};
