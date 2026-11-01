import React, { useState } from 'react';
import { ELECTRICAL_SUBJECTS } from '../../data/subjectsData';
import type { ElectricalSubject } from '../../types';
import { BookOpen, CheckCircle2, ChevronRight, MessageSquare, Search, GraduationCap } from 'lucide-react';

interface SubjectsViewProps {
  onAskInChat: (prompt: string, subject?: string, courseId?: string) => void;
  onOpenCourse?: (courseId: string) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({ onAskInChat, onOpenCourse }) => {
  const [selectedSubject, setSelectedSubject] = useState<ElectricalSubject>(ELECTRICAL_SUBJECTS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubjects = ELECTRICAL_SUBJECTS.filter((sub) =>
    sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto bg-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header Banner */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Undergraduate Curriculum</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                Electrical Engineering Subjects
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Explore foundational principles, analysis techniques, and syllabus topics across major EEE domains.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search topics or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Two-Column Grid: List on Left, Detailed Syllabus on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Subject Selector List */}
          <div className="lg:col-span-5 space-y-2">
            {filteredSubjects.map((sub) => {
              const isSelected = selectedSubject.id === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-white border-blue-600 shadow-2xs ring-1 ring-blue-600'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="pr-3">
                    <span className="text-[11px] font-mono font-semibold text-blue-700 uppercase tracking-wider block mb-0.5">
                      {sub.code}
                    </span>
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug">
                      {sub.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {sub.description}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>

          {/* Detailed Syllabus Card */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                    {selectedSubject.code}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                    {selectedSubject.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  {selectedSubject.courseId && onOpenCourse && (
                    <button
                      onClick={() => onOpenCourse(selectedSubject.courseId!)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Open LMS Course</span>
                    </button>
                  )}
                  <button
                    onClick={() => onAskInChat(`Explain key concepts and derivations for ${selectedSubject.title} (${selectedSubject.code})`, selectedSubject.title, selectedSubject.courseId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Discuss in Chat</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Course Overview
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedSubject.description}
                </p>
              </div>

              {/* Core Concepts */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Fundamental Competencies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSubject.coreConcepts.map((concept, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Topics Breakdown */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Key Curriculum Topics
                </h4>
                <ul className="space-y-2">
                  {selectedSubject.topics.map((topic, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Formulas */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Essential Analytical Formulas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedSubject.recommendedFormulas.map((formula, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-md font-mono text-xs text-slate-800 flex items-center justify-between"
                    >
                      <span>{formula}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
