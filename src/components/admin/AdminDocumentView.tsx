import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  RotateCcw,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Filter,
  Search,
  Sparkles,
  Lock,
  Unlock,
  Key
} from 'lucide-react';
import type { UploadedDocument, LmsCourse } from '../../types';
import {
  fetchUploadedDocuments,
  uploadDocument,
  deleteUploadedDocument,
  retryDocumentProcessing,
  fetchLmsCourses,
  fetchAdminStatus,
  verifyAdminPasscode
} from '../../services/api';

const EEE_SUBJECTS = [
  'Electrical Circuits',
  'Electrical Machines',
  'Power Systems',
  'Power Electronics',
  'Control Systems',
  'Electrical Measurements',
  'Renewable Energy',
  'High Voltage Engineering',
  'Electrical Protection',
  'Electric Vehicles'
];

export const AdminDocumentView: React.FC = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [courses, setCourses] = useState<LmsCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Admin Protection State
  const [authRequired, setAuthRequired] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [passcodePrompt, setPasscodePrompt] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Upload Form State
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(EEE_SUBJECTS[0]);
  const [courseId, setCourseId] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'course_only' | 'admin_only'>('public');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchAdminStatus().then(async (status) => {
      setAuthRequired(status.auth_required);
      if (!status.auth_required) {
        setIsUnlocked(true);
      } else {
        const saved = sessionStorage.getItem('electric_sence_admin_passcode');
        if (saved) {
          const isValid = await verifyAdminPasscode(saved);
          if (isValid) {
            setAdminPasscode(saved);
            setIsUnlocked(true);
          }
        }
      }
    });
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcodePrompt.trim()) return;
    setIsVerifyingAuth(true);
    setAuthError(null);
    try {
      const isValid = await verifyAdminPasscode(passcodePrompt.trim());
      if (isValid) {
        setAdminPasscode(passcodePrompt.trim());
        sessionStorage.setItem('electric_sence_admin_passcode', passcodePrompt.trim());
        setIsUnlocked(true);
        setPasscodePrompt('');
      } else {
        setAuthError('Invalid administrator passcode. Access denied.');
      }
    } catch {
      setAuthError('Failed to verify passcode with the server.');
    } finally {
      setIsVerifyingAuth(false);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('electric_sence_admin_passcode');
    setAdminPasscode('');
    setIsUnlocked(false);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [docsData, coursesData] = await Promise.all([
        fetchUploadedDocuments(),
        fetchLmsCourses().catch(() => [])
      ]);
      setDocuments(docsData);
      setCourses(coursesData);
    } catch (err: any) {
      console.error('Failed to load admin documents:', err);
      setError('Could not load documents from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Poll every 5s if any document is processing
    const interval = setInterval(() => {
      setDocuments(prev => {
        const hasProcessing = prev.some(d => d.processing_status === 'processing');
        if (hasProcessing) {
          fetchUploadedDocuments().then(setDocuments).catch(() => {});
        }
        return prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    try {
      setIsUploading(true);
      setError(null);
      setSuccessMsg(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('subject', subject);
      if (courseId) formData.append('course_id', courseId);
      if (description) formData.append('description', description.trim());
      formData.append('visibility', visibility);
      formData.append('uploaded_by', 'Faculty Administrator (Dev Mode)');

      await uploadDocument(formData, adminPasscode || undefined);
      setSuccessMsg(`"${title}" uploaded. PDF text extraction & 3072-dim vector generation running in background.`);
      setFile(null);
      setTitle('');
      setDescription('');
      await loadData();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err?.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string, docTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${docTitle}"? All associated vector embeddings will be permanently removed from SQLite.`)) {
      return;
    }
    try {
      await deleteUploadedDocument(docId, adminPasscode || undefined);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      setSuccessMsg(`Deleted "${docTitle}" and removed vector embeddings.`);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete document.');
    }
  };

  const handleRetry = async (docId: string) => {
    try {
      await retryDocumentProcessing(docId, adminPasscode || undefined);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to retry indexing.');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || doc.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const totalChunks = documents.reduce((sum, d) => sum + (d.chunk_count || 0), 0);
  const indexedCount = documents.filter(d => d.processing_status === 'indexed').length;

  // ── Protection Screen: If Admin Key is configured on server and console is locked ──
  if (authRequired && !isUnlocked) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center text-blue-600 mb-4 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 text-center">Faculty Console Protected</h3>
          <p className="text-xs text-slate-500 text-center mt-1 mb-6 leading-relaxed">
            This deployment requires an administrator passcode to upload study materials, modify course assignments, or manage RAG vectors.
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Administrator Passcode
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passcodePrompt}
                  onChange={(e) => setPasscodePrompt(e.target.value)}
                  placeholder="Enter passcode..."
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {authError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifyingAuth || !passcodePrompt.trim()}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVerifyingAuth ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Faculty Console</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Configured via <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">ADMIN_KEY</code> in environment variables.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* ── Top Header Bar with Dev Profile Notice ─────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
                <Shield className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">Document Management & RAG Administration</h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                authRequired
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {authRequired ? 'Admin Protected' : 'Faculty / Dev Mode'}
              </span>
              {authRequired && (
                <button
                  onClick={handleLock}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 border border-slate-200 transition-colors"
                  title="Lock console"
                >
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Lock</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Upload PDF textbooks, lecture notes, and lab manuals. The pipeline extracts text, tags pages, and creates 3072-dim embeddings for RAG retrieval.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Documents</span>
              <span className="text-sm font-bold text-slate-800">{documents.length}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Indexed</span>
              <span className="text-sm font-bold text-emerald-600">{indexedCount}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Vector Chunks</span>
              <span className="text-sm font-bold text-indigo-600">{totalChunks}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* ── Main Workspace ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Upload Form */}
        <div className="lg:w-88 border-r border-slate-200 bg-white p-5 overflow-y-auto shrink-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-indigo-600" /> Upload Study Material
          </h3>

          <form onSubmit={handleUploadSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select File (PDF, TXT, MD · Max 15MB)
              </label>
              <input
                type="file"
                required
                accept=".pdf,.txt,.md"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              {file && (
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Electric Power Transmission & Fault Analysis Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Area</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {EEE_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Associated Course (Optional)</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">-- General Reference (No specific course) --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} · {c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Access Visibility</label>
              <select
                value={visibility}
                onChange={(e: any) => setVisibility(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="public">Public (All EEE Students)</option>
                <option value="course_only">Course Enrolled Only</option>
                <option value="admin_only">Faculty / Admin Only (Private RAG)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Syllabus Scope</label>
              <textarea
                rows={3}
                placeholder="Brief summary of topics covered in this reference..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading || !file || !title.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading & Extracting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Upload & Index Document</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Pane: Document Repository Table */}
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
          {/* Filter Bar */}
          <div className="p-3.5 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search uploaded materials by title or filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Subjects ({documents.length})</option>
                {EEE_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Documents Table */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center py-12 text-xs text-slate-400">Loading document repository...</div>
            ) : filteredDocuments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <FileText className="w-10 h-10 text-slate-300 mb-2" />
                <h4 className="text-xs font-bold text-slate-700">No documents found</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                  Upload PDF course notes, reference literature, or past question papers using the form on the left.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-indigo-300 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {doc.subject}
                        </span>
                        {doc.course_code && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {doc.course_code}
                          </span>
                        )}
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          doc.visibility === 'public'
                            ? 'bg-emerald-50 text-emerald-700'
                            : doc.visibility === 'course_only'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}>
                          {doc.visibility}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        {doc.processing_status === 'indexed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" /> Indexed ({doc.chunk_count} chunks)
                          </span>
                        ) : doc.processing_status === 'processing' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                            <Clock className="w-3.5 h-3.5 animate-spin" /> Processing Vectors...
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200" title={doc.error_message || ''}>
                            <AlertCircle className="w-3.5 h-3.5" /> Failed
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{doc.title}</h4>
                    {doc.description && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{doc.description}</p>
                    )}

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-500">{doc.file_name}</span>
                        <span>{(doc.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                        <span>{doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/documents/${doc.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-md transition-colors inline-flex items-center gap-1 font-medium text-[11px]"
                          title="Open original document"
                        >
                          <Download className="w-3 h-3" /> View / Download
                        </a>

                        {doc.processing_status === 'failed' && (
                          <button
                            onClick={() => handleRetry(doc.id)}
                            className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md transition-colors inline-flex items-center gap-1 text-[11px]"
                            title="Retry vector extraction"
                          >
                            <RotateCcw className="w-3 h-3" /> Retry
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Delete document and vector embeddings"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
