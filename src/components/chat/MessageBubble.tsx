import React, { useState } from 'react';
import { User, Zap, Copy, Check, Info, Database, ChevronDown, ChevronUp } from 'lucide-react';
import type { ChatMessage } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

/**
 * Lightweight markdown-to-HTML renderer for Gemini AI responses.
 * Handles: bold, italic, inline code, code blocks, headers, bullet lists, numbered lists.
 */
function renderMarkdown(text: string): string {
  let html = text;

  // Code blocks (``` ... ```) — must process before inline `code`
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_match, _lang, code) => {
    const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre class="my-3 bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto text-xs font-mono leading-relaxed whitespace-pre-wrap"><code>${escaped.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-blue-700 px-1 py-0.5 rounded text-xs font-mono">$1</code>');

  // Bold **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong class="font-semibold text-slate-900">$1</strong>');

  // Italic *text* or _text_
  html = html.replace(/\*([^*\n]+)\*/g, '<em class="italic text-slate-700">$1</em>');
  html = html.replace(/_([^_\n]+)_/g, '<em class="italic text-slate-700">$1</em>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold text-slate-900 mt-4 mb-1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-sm font-bold text-blue-800 mt-4 mb-1 border-b border-slate-200 pb-1">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-base font-bold text-blue-900 mt-4 mb-2">$1</h1>');

  // Bullet lists — group consecutive - lines
  html = html.replace(/(^[ \t]*[-*] .+$\n?)+/gm, (block) => {
    const items = block.trim().split('\n').map((line) => {
      const content = line.replace(/^[ \t]*[-*] /, '');
      return `<li class="ml-4 mb-0.5 list-disc list-outside leading-snug">${content}</li>`;
    }).join('');
    return `<ul class="my-2 space-y-0.5 pl-2">${items}</ul>`;
  });

  // Numbered lists
  html = html.replace(/(^[ \t]*\d+\. .+$\n?)+/gm, (block) => {
    const items = block.trim().split('\n').map((line) => {
      const content = line.replace(/^[ \t]*\d+\. /, '');
      return `<li class="ml-4 mb-0.5 list-decimal list-outside leading-snug">${content}</li>`;
    }).join('');
    return `<ol class="my-2 space-y-0.5 pl-2">${items}</ol>`;
  });

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-3 border-slate-200" />');

  // Paragraph breaks — double newline → paragraph spacing
  html = html.replace(/\n\n+/g, '</p><p class="mb-2">');
  html = `<p class="mb-2">${html}</p>`;

  // Single newlines within paragraphs → <br>
  html = html.replace(/([^>])\n([^<])/g, '$1<br />$2');

  return html;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // ── User Message ────────────────────────────────────────────────────────────
  if (message.sender === 'user') {
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

  // ── System / Error Notice ────────────────────────────────────────────────────
  if (message.sender === 'system') {
    return (
      <div className="flex gap-3 max-w-3xl mr-auto mb-5">
        <div className="w-7 h-7 rounded-md bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5">
            <p className="text-xs font-semibold text-amber-800 mb-1">System Notice</p>
            <p className="text-xs text-amber-700 leading-relaxed">{message.content}</p>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono pl-0.5">{formattedTime}</span>
        </div>
      </div>
    );
  }

  // ── AI Assistant Response ────────────────────────────────────────────────────
  const renderedHtml = renderMarkdown(message.content);

  return (
    <div className="flex gap-3 max-w-3xl mr-auto mb-5">
      <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
        <Zap className="w-3.5 h-3.5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-700">Electric Sence AI</span>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 transition-colors"
              title="Copy response"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Rendered AI response body */}
          <div
            className="px-4 py-3.5 text-sm text-slate-800 leading-relaxed prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />

          {/* RAG Source Citations (if response used RAG retrieval) */}
          {message.sources && message.sources.length > 0 && (
            <div className="border-t border-slate-100 bg-indigo-50/40 px-4 py-2.5">
              <button
                onClick={() => setShowSources(!showSources)}
                className="w-full flex items-center justify-between text-left text-xs font-semibold text-indigo-900 hover:text-indigo-700 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Verified References ({message.sources.length} retrieved from EEE Knowledge Base)</span>
                </div>
                {showSources ? (
                  <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                )}
              </button>

              {showSources && (
                <div className="mt-2.5 space-y-2 pt-2 border-t border-indigo-100">
                  {message.sources.map((src, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2.5 bg-white border border-indigo-100 rounded-lg shadow-2xs text-[11px]"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-indigo-950 truncate">{src.chunk_title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold shrink-0">
                          {Math.round(src.score * 100)}% match
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-1">
                        From: {src.document_title} · {src.document_author}
                      </p>
                      <p className="text-slate-600 font-mono text-[10px] bg-slate-50 p-1.5 rounded border border-slate-100 line-clamp-2">
                        {src.excerpt}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <span className="text-[10px] text-slate-400 mt-1 block font-mono pl-0.5">{formattedTime}</span>
      </div>
    </div>
  );
};
