import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  Layers,
  ArrowRight,
  Upload,
  X
} from 'lucide-react';
import type { RagDocumentItem, RagCitation } from '../../types';
import { fetchRagDocuments, ingestRagDocument, testRagSearch } from '../../services/api';

interface RagKnowledgeViewProps {
  onAskInChat: (query: string) => void;
}

export const RagKnowledgeView: React.FC<RagKnowledgeViewProps> = ({ onAskInChat }) => {
  const [documents, setDocuments] = useState<RagDocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search Test state
  const [testQuery, setTestQuery] = useState('equivalent circuit of single phase transformer');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RagCitation[]>([]);

  // Ingestion Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ingestTitle, setIngestTitle] = useState('');
  const [ingestSubject, setIngestSubject] = useState('Electrical Machines');
  const [ingestSourceType, setIngestSourceType] = useState('textbook');
  const [ingestAuthor, setIngestAuthor] = useState('');
  const [ingestContent, setIngestContent] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await fetchRagDocuments();
      setDocuments(docs);
    } catch (err: any) {
      console.error('Failed to load RAG documents:', err);
      setError('Could not connect to the RAG knowledge repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleTestSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testQuery.trim()) return;

    try {
      setIsSearching(true);
      const res = await testRagSearch(testQuery.trim(), 3);
      setSearchResults(res.results || []);
    } catch (err) {
      console.error('Search test failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleIngestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestTitle.trim() || !ingestContent.trim()) return;

    try {
      setIsIngesting(true);
      await ingestRagDocument({
        title: ingestTitle.trim(),
        subject: ingestSubject.trim(),
        source_type: ingestSourceType,
        author: ingestAuthor.trim() || 'Department of EEE',
        content: ingestContent.trim(),
      });

      setIngestSuccess(`"${ingestTitle}" was successfully chunked and indexed into the RAG repository!`);
      setIngestTitle('');
      setIngestAuthor('');
      setIngestContent('');
      await loadDocuments();
      setTimeout(() => {
        setIsModalOpen(false);
        setIngestSuccess(null);
      }, 1500);
    } catch (err: any) {
      console.error('Ingestion failed:', err);
      setError(err?.message || 'Failed to ingest document.');
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* ── Top Header Bar ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        {error && (
          <div className="mb-3 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
                <Database className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">RAG Knowledge Base & Reference Repository</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Authoritative electrical engineering corpus indexed for semantic retrieval and grounded AI generation.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Custom Notes / Syllabus
          </button>
        </div>
      </div>

      {/* ── Workspace Split: Left (Document Index) / Right (Semantic Tester) ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Indexed Knowledge Documents */}
        <div className="lg:w-1/2 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900">Indexed Engineering Documents ({documents.length})</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">SQLite Repository</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading && (
              <div className="text-center py-6 text-xs text-slate-400">Loading indexed knowledge documents...</div>
            )}
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {doc.source_type}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {doc.chunk_count} text chunks
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 mb-1 leading-snug">
                  {doc.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                  <span className="truncate max-w-[200px]">By: {doc.author}</span>
                  <span className="text-slate-400">Subject: {doc.subject}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Live RAG Semantic Search & Prompt Tester */}
        <div className="lg:w-1/2 flex flex-col bg-slate-50 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h3 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-blue-600" />
              Test Semantic RAG Retrieval
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              See what passages the AI retrieves from the knowledge base before synthesizing an answer.
            </p>

            <form onSubmit={handleTestSearch} className="flex gap-2">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Ask about induction motor slip, Thévenin theorem, ABCD constants..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
              >
                {isSearching ? 'Retrieving...' : 'Search RAG'}
              </button>
            </form>
          </div>

          {/* Retrieved Chunks Display */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {searchResults.length > 0 ? (
              searchResults.map((res, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-700">
                      Rank #{idx + 1} · {res.chunk_title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      {Math.round(res.score * 100)}% match
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    Source: {res.document_title} ({res.document_author})
                  </p>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 font-mono text-[11px] text-slate-700 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {res.content || res.excerpt}
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => onAskInChat(`Based on this reference: "${res.chunk_title}", explain the principles and derive relevant equations for: "${testQuery}".`)}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                    >
                      Ask AI about this excerpt <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Database className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-medium">
                  Enter an electrical engineering question above to inspect retrieved passages.
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  The RAG engine scores text matches using exact phrase, keyword metadata, and TF-IDF term weights.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Document Ingestion Modal ───────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                Ingest Document into EEE Knowledge Base
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIngestDocument} className="p-6 space-y-4">
              {ingestSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  {ingestSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document / Syllabus Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electric Power Transmission & Fault Handbook"
                  value={ingestTitle}
                  onChange={(e) => setIngestTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Area</label>
                  <select
                    value={ingestSubject}
                    onChange={(e) => setIngestSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Circuit Theory">Circuit Theory</option>
                    <option value="Electrical Machines">Electrical Machines</option>
                    <option value="Power Systems">Power Systems</option>
                    <option value="Power Electronics">Power Electronics</option>
                    <option value="Control Systems">Control Systems</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Source Type</label>
                  <select
                    value={ingestSourceType}
                    onChange={(e) => setIngestSourceType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="textbook">Textbook Reference</option>
                    <option value="syllabus">University Syllabus</option>
                    <option value="lab_manual">Lab Manual</option>
                    <option value="student_notes">Student / Faculty Notes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Author / Faculty</label>
                <input
                  type="text"
                  placeholder="e.g. Prof. R. Ramanathan, EEE Dept"
                  value={ingestAuthor}
                  onChange={(e) => setIngestAuthor(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Content (Raw Text / Markdown / Equations)
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Paste textbook excerpts, lecture notes, formula derivations..."
                  value={ingestContent}
                  onChange={(e) => setIngestContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isIngesting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                >
                  {isIngesting ? 'Chunking & Indexing...' : 'Index Document into RAG'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
