import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Filter, BookOpen } from 'lucide-react';
import type { UploadedDocument } from '../../types';
import { fetchUploadedDocuments } from '../../services/api';

const EEE_SUBJECTS = [
  'All Subjects',
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

export const StudyMaterialsView: React.FC = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');

  useEffect(() => {
    fetchUploadedDocuments({ visibility: 'public' })
      .then(setDocuments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'All Subjects' || doc.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Banner */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Library & Authorized Materials</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
            Study Materials & Reference Documents
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Access authorized electrical engineering lecture notes, PDF reference textbooks, and formula compendiums indexed in the Electric Sence repository.
          </p>

          {/* Search & Subject Filters */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search notes, textbooks, and syllabus topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {EEE_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Materials List */}
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Loading authorized study materials...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-200 rounded-xl">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-700">No matching study materials found</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Faculty administrators can upload authorized PDF notes in the Document Management panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-blue-300 hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {doc.subject}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs mb-1.5 leading-snug">
                    {doc.title}
                  </h3>

                  {doc.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                      {doc.description}
                    </p>
                  )}

                  <div className="text-[10px] text-slate-400 font-mono space-y-0.5 mb-3">
                    <p className="truncate">File: {doc.file_name} ({(doc.file_size / (1024 * 1024)).toFixed(2)} MB)</p>
                    <p>Indexed into {doc.chunk_count} RAG vectors</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Uploaded by {doc.uploaded_by}
                  </span>
                  <a
                    href={`/api/documents/${doc.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View / Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
