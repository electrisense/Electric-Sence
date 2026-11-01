import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CheckCircle,
  BookOpen,
  Award,
  Clock,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  RotateCcw,
  Check,
  AlertCircle,
  HelpCircle,
  Layers,
  Search
} from 'lucide-react';
import type {
  LmsCourse,
  LmsCourseWithLessons,
  LmsLessonDetail,
  LmsStudentStats,
} from '../../types';
import {
  fetchLmsCourses,
  fetchLmsCourseDetails,
  fetchLmsLesson,
  updateLessonProgress,
  submitQuizAnswers,
  fetchLmsStats
} from '../../services/api';

interface LmsViewProps {
  onAskInChat: (query: string, subject?: string, courseId?: string) => void;
  initialCourseId?: string | null;
}

export const LmsView: React.FC<LmsViewProps> = ({ onAskInChat, initialCourseId }) => {
  const [courses, setCourses] = useState<LmsCourse[]>([]);
  const [stats, setStats] = useState<LmsStudentStats | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseDetail, setCourseDetail] = useState<LmsCourseWithLessons | null>(null);
  const [activeLesson, setActiveLesson] = useState<LmsLessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Quiz state
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResults, setQuizResults] = useState<any | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Load courses and stats on mount
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [coursesData, statsData] = await Promise.all([
        fetchLmsCourses(),
        fetchLmsStats().catch(() => null)
      ]);
      setCourses(coursesData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to load LMS data:', err);
      setError('Could not connect to the LMS service. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialCourseId) {
      handleSelectCourse(initialCourseId);
    }
  }, [initialCourseId]);

  // When a course is selected, load its detailed syllabus and lessons
  const handleSelectCourse = async (courseId: string) => {
    try {
      setLoading(true);
      setError(null);
      setIsTakingQuiz(false);
      setQuizResults(null);
      const details = await fetchLmsCourseDetails(courseId);
      setSelectedCourseId(courseId);
      setCourseDetail(details);

      // Auto-open first lesson if available
      if (details.lessons && details.lessons.length > 0) {
        const firstLesson = await fetchLmsLesson(details.lessons[0].id);
        setActiveLesson(firstLesson);
      } else {
        setActiveLesson(null);
      }
    } catch (err: any) {
      console.error('Failed to load course details:', err);
      setError('Failed to load course outline.');
    } finally {
      setLoading(false);
    }
  };

  // Open specific lesson
  const handleOpenLesson = async (lessonId: string) => {
    try {
      setLoading(true);
      setIsTakingQuiz(false);
      const lesson = await fetchLmsLesson(lessonId);
      setActiveLesson(lesson);
    } catch (err) {
      console.error('Failed to load lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle lesson complete
  const handleToggleLessonComplete = async () => {
    if (!activeLesson || !selectedCourseId) return;
    const newStatus = !activeLesson.completed;
    try {
      await updateLessonProgress(selectedCourseId, activeLesson.id, newStatus);
      setActiveLesson((prev) => prev ? { ...prev, completed: newStatus } : null);

      // Refresh course list and outline metrics
      const updatedDetails = await fetchLmsCourseDetails(selectedCourseId);
      setCourseDetail(updatedDetails);
      const updatedCourses = await fetchLmsCourses();
      setCourses(updatedCourses);
      const updatedStats = await fetchLmsStats().catch(() => null);
      setStats(updatedStats);
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  // Start course quiz
  const handleStartQuiz = () => {
    if (!courseDetail?.quiz) return;
    setIsTakingQuiz(true);
    setQuizAnswers([]);
    setQuizResults(null);
  };

  // Select quiz option
  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    setQuizAnswers((prev) => {
      const copy = [...prev];
      copy[qIdx] = optIdx;
      return copy;
    });
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    if (!courseDetail?.quiz) return;
    try {
      setIsSubmittingQuiz(true);
      const results = await submitQuizAnswers(courseDetail.quiz.id, quizAnswers);
      setQuizResults(results);

      // Refresh course and overall stats
      const updatedDetails = await fetchLmsCourseDetails(courseDetail.id);
      setCourseDetail(updatedDetails);
      const updatedCourses = await fetchLmsCourses();
      setCourses(updatedCourses);
      const updatedStats = await fetchLmsStats().catch(() => null);
      setStats(updatedStats);
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || c.level.toLowerCase() === selectedLevel.toLowerCase();
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* ── Top Metric Banner ──────────────────────────────────────────────── */}
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
              <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">EEE Learning Management System (LMS)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Structured Electrical Engineering curriculum with interactive lesson modules, progress tracking, and mastery assessments.
            </p>
          </div>

          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Courses</span>
                <span className="text-base font-bold text-slate-800">{stats.total_courses}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Completed</span>
                <span className="text-base font-bold text-emerald-600">
                  {stats.completed_lessons}/{stats.total_lessons}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Quizzes Passed</span>
                <span className="text-base font-bold text-blue-600">{stats.quizzes_passed}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Avg Score</span>
                <span className="text-base font-bold text-purple-600">{stats.average_quiz_score}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main LMS Workspace ─────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Courses list or Course Outline */}
        <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden">
          {!selectedCourseId ? (
            // Course Catalog View
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              <div className="mb-3 space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search courses or codes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-1">
                  {['all', 'introductory', 'intermediate', 'advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`text-[11px] px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                        selectedLevel === lvl
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {loading && (
                  <div className="text-center py-6 text-xs text-slate-400">Loading curriculum courses...</div>
                )}
                {filteredCourses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCourse(c.id)}
                    className="p-3.5 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs rounded-xl cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {c.code}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{c.level}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {c.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex-1 mr-3">
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${c.progress_percent}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600 shrink-0">
                        {c.progress_percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Course Lessons Syllabus Sidebar
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedCourseId(null);
                    setCourseDetail(null);
                    setActiveLesson(null);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  All Courses
                </button>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {courseDetail?.code}
                </span>
              </div>

              <div className="p-3.5 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 line-clamp-2">{courseDetail?.title}</h3>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{courseDetail?.completed_lessons} of {courseDetail?.total_lessons} completed</span>
                  <span className="font-semibold text-emerald-600">{courseDetail?.progress_percent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${courseDetail?.progress_percent || 0}%` }}
                  />
                </div>
              </div>

              {/* Lessons List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                  Course Modules
                </span>
                {courseDetail?.lessons.map((les) => {
                  const isSelected = activeLesson?.id === les.id && !isTakingQuiz;
                  return (
                    <div
                      key={les.id}
                      onClick={() => handleOpenLesson(les.id)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 text-blue-900 font-medium'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenLesson(les.id);
                        }}
                        className={`mt-0.5 shrink-0 ${
                          les.completed ? 'text-emerald-600' : 'text-slate-300'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-snug line-clamp-2">{les.title}</p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {les.duration_mins} mins
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Course Quiz Entry */}
                {courseDetail?.quiz && (
                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                      Assessment
                    </span>
                    <div
                      onClick={handleStartQuiz}
                      className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                        isTakingQuiz
                          ? 'bg-purple-50 text-purple-900 border border-purple-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Award className={`w-4 h-4 ${courseDetail.quiz.passed ? 'text-emerald-500' : 'text-purple-500'}`} />
                        <div>
                          <p className="text-xs font-semibold">{courseDetail.quiz.title}</p>
                          <span className="text-[10px] text-slate-400">
                            {courseDetail.quiz.passed
                              ? `Passed with ${courseDetail.quiz.best_score}/${courseDetail.quiz.total_questions}`
                              : `${courseDetail.quiz.question_count} questions (75% to pass)`}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Main Content: Lesson Reader OR Quiz Runner */}
        <div className="flex-1 overflow-y-auto bg-white p-6">
          {isTakingQuiz && courseDetail?.quiz ? (
            // Quiz Assessment Runner
            <div className="max-w-2xl mx-auto py-2">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Course Examination
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">{courseDetail.quiz.title}</h2>
                  <p className="text-xs text-slate-500">
                    Answer the following {courseDetail.quiz.question_count} questions to test your engineering mastery.
                  </p>
                </div>
                {quizResults && (
                  <div className="text-right">
                    <span className={`text-xl font-extrabold ${quizResults.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {quizResults.percentage}%
                    </span>
                    <span className="text-xs block text-slate-500 font-medium">
                      {quizResults.passed ? 'PASSED ✅' : 'TRY AGAIN ❌'}
                    </span>
                  </div>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {(quizResults?.detailedResults || courseDetail.quiz.questions || []).map((q: any, qIdx: number) => {
                  const selectedOpt = quizAnswers[qIdx];
                  const hasResult = !!quizResults;

                  return (
                    <div
                      key={qIdx}
                      className={`p-4 rounded-xl border transition-all ${
                        hasResult
                          ? q.is_correct
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-rose-50/50 border-rose-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-start gap-2">
                        <span className="text-slate-400">Q{qIdx + 1}.</span>
                        <span>{q.question}</span>
                      </h4>

                      <div className="space-y-2">
                        {q.options.map((opt: string, optIdx: number) => {
                          const isPicked = selectedOpt === optIdx;
                          let optionClasses = 'bg-white border-slate-200 text-slate-700 hover:border-slate-300';

                          if (hasResult) {
                            if (optIdx === q.correct_index) {
                              optionClasses = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-semibold';
                            } else if (isPicked && !q.is_correct) {
                              optionClasses = 'bg-rose-100 border-rose-400 text-rose-900 font-semibold';
                            }
                          } else if (isPicked) {
                            optionClasses = 'bg-blue-50 border-blue-500 text-blue-900 font-medium';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={hasResult}
                              onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                              className={`w-full text-left px-3 py-2 text-xs rounded-lg border transition-colors flex items-center justify-between ${optionClasses}`}
                            >
                              <span>{opt}</span>
                              {hasResult && optIdx === q.correct_index && (
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {hasResult && q.explanation && (
                        <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-start gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span><strong>Explanation:</strong> {q.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit / Retake Bar */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                {!quizResults ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={isSubmittingQuiz || quizAnswers.length < (courseDetail.quiz.questions?.length || 4)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                  >
                    {isSubmittingQuiz ? 'Grading Assessment...' : 'Submit Answers & View Grade'}
                  </button>
                ) : (
                  <button
                    onClick={handleStartQuiz}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                  </button>
                )}

                <button
                  onClick={() => setIsTakingQuiz(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Back to Lessons
                </button>
              </div>
            </div>
          ) : activeLesson ? (
            // Interactive Lesson Reader
            <div className="max-w-3xl mx-auto py-2">
              {/* Lesson Header */}
              <div className="border-b border-slate-200 pb-4 mb-6">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {activeLesson.course_code} · Module {activeLesson.order_index}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleLessonComplete}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeLesson.completed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {activeLesson.completed ? 'Completed' : 'Mark Complete'}
                    </button>
                  </div>
                </div>

                <h1 className="text-xl font-bold text-slate-900">{activeLesson.title}</h1>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {activeLesson.duration_mins} min read</span>
                  <span>·</span>
                  <span>{activeLesson.course_title}</span>
                </div>
              </div>

              {/* Lesson Body */}
              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed space-y-4">
                <div className="whitespace-pre-wrap font-sans">{activeLesson.content}</div>
              </div>

              {/* Key Formulas & Engineering Takeaways Callout */}
              {activeLesson.key_takeaways && activeLesson.key_takeaways.length > 0 && (
                <div className="mt-8 bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-700" />
                    Key Engineering Formulas & Core Takeaways
                  </h4>
                  <ul className="space-y-1.5 text-xs text-blue-950 pl-2">
                    {activeLesson.key_takeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Practice Problem */}
              {activeLesson.practice_problem && (
                <div className="mt-6 bg-amber-50/70 border border-amber-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-700" />
                    Numerical Practice Problem
                  </h4>
                  <p className="text-xs text-amber-950 leading-relaxed mb-3">
                    {activeLesson.practice_problem}
                  </p>
                  <button
                    onClick={() => onAskInChat(
                      `I am solving this problem from lesson "${activeLesson.title}": "${activeLesson.practice_problem}". Can you show me the step-by-step mathematical derivation?`,
                      activeLesson.subject,
                      activeLesson.course_id
                    )}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ask AI Assistant for Step-by-Step Solution
                  </button>
                </div>
              )}

              {/* RAG-Powered AI Tutor Prompt */}
              <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Have a question about this module?</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ask Electric Sence AI. It will retrieve references from the textbook knowledge base using RAG.
                  </p>
                </div>
                <button
                  onClick={() => onAskInChat(
                    `Explain the concepts in lesson "${activeLesson.title}" from ${activeLesson.course_title} with practical engineering examples.`,
                    activeLesson.subject,
                    activeLesson.course_id
                  )}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask AI Tutor
                </button>
              </div>

              {/* Next/Previous Lesson Navigation */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
                {activeLesson.prev_lesson ? (
                  <button
                    onClick={() => handleOpenLesson(activeLesson.prev_lesson!.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous: {activeLesson.prev_lesson.title}
                  </button>
                ) : <div />}

                {activeLesson.next_lesson ? (
                  <button
                    onClick={() => handleOpenLesson(activeLesson.next_lesson!.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Next: {activeLesson.next_lesson.title}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  courseDetail?.quiz && (
                    <button
                      onClick={handleStartQuiz}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Award className="w-4 h-4" />
                      Take Course Quiz
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            // Empty placeholder
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">Select a course to begin learning</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Choose from Circuit Theory, Electrical Machines, Power Systems, or Power Electronics to view syllabus and interactive lessons.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
