import React, { useState } from 'react';
import { STUDY_MATERIALS } from '../../data/studyMaterialsData';
import { FileText, Download, Check } from 'lucide-react';

export const StudyMaterialsView: React.FC = () => {
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredMaterials = filterType === 'all'
    ? STUDY_MATERIALS
    : STUDY_MATERIALS.filter(m => m.type === filterType);

  const handleDownload = (id: string, title: string) => {
    // Generate text reference file download for student
    const element = document.createElement("a");
    const file = new Blob([
      `ELECTRIC SENCE — STUDY MATERIAL REFERENCE\n\nTitle: ${title}\nPlatform: Electric Sence EEE Educational Portal\nGenerated: ${new Date().toLocaleDateString()}\n\nKey Concepts & Reference Outline:\n- Detailed examination notes and academic reference for EEE students.\n- Consult course syllabus for formal derivations and laboratory protocols.\n`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_reference.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    if (!downloadedIds.includes(id)) {
      setDownloadedIds([...downloadedIds, id]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Academic Library</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Study Materials & Formula Sheets
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Curated reference notes, high-yield equation sheets, and laboratory guides for electrical engineering coursework.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100">
            {['all', 'Formula Sheet', 'Lecture Notes', 'Exam Guide', 'Lab Manual'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterType === type
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'all' ? 'All Resources' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Materials List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.map((mat) => {
            const hasDownloaded = downloadedIds.includes(mat.id);
            return (
              <div
                key={mat.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {mat.subject}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {mat.type}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 text-sm mb-2 leading-snug">
                    {mat.title}
                  </h3>

                  <div className="space-y-1 mb-4">
                    <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                      Topics Included:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {mat.topicsCovered.map((topic, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {mat.downloadsCount + (hasDownloaded ? 1 : 0)} students accessed
                  </span>
                  <button
                    onClick={() => handleDownload(mat.id, mat.title)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      hasDownloaded
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200'
                    }`}
                  >
                    {hasDownloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{hasDownloaded ? 'Downloaded' : 'Download Guide'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
