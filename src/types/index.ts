export type NavigationTab = 
  | 'chat'
  | 'lms'
  | 'rag-docs'
  | 'admin-docs'
  | 'subjects'
  | 'study-materials'
  | 'tools'
  | 'projects'
  | 'settings';

export interface RagCitation {
  chunk_id: string;
  chunk_title?: string;
  document_id?: string;
  document_title: string;
  document_author?: string;
  source_type?: string;
  score: number;
  excerpt: string;
  content?: string;
  page_number?: number | null;
  file_name?: string;
}

export interface UploadedDocument {
  id: string;
  title: string;
  subject: string;
  course_id: string | null;
  course_title?: string | null;
  course_code?: string | null;
  description: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  page_count: number;
  processing_status: 'pending' | 'processing' | 'indexed' | 'failed';
  error_message?: string | null;
  visibility: 'public' | 'course_only' | 'admin_only';
  uploaded_by: string;
  chunk_count: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  sources?: RagCitation[];
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: ChatMessage[];
}

export interface ElectricalSubject {
  id: string;
  code: string;
  title: string;
  description: string;
  courseId?: string;
  topics: string[];
  coreConcepts: string[];
  recommendedFormulas: string[];
}

export interface EngineeringTool {
  id: string;
  title: string;
  description: string;
  category: 'DC Circuits' | 'AC Circuits' | 'Machines' | 'Electronics';
}

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  type: 'Formula Sheet' | 'Lecture Notes' | 'Exam Guide' | 'Lab Manual';
  topicsCovered: string[];
  downloadsCount: number;
}

export interface EEEProject {
  id: string;
  title: string;
  level: 'Undergraduate' | 'Intermediate' | 'Advanced Capstone';
  domain: 'Power Electronics' | 'Renewable Energy' | 'Embedded Systems / IoT' | 'Electric Vehicles';
  description: string;
  keyComponents: string[];
  simulationTools: string[];
}

// ── LMS Types ────────────────────────────────────────────────────────────────
export interface LmsCourse {
  id: string;
  code: string;
  title: string;
  subject: string;
  category: string;
  description: string;
  level: 'Introductory' | 'Intermediate' | 'Advanced';
  duration_weeks: number;
  instructor: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percent: number;
  is_completed: boolean;
  quiz_id?: string;
  quiz_passed?: boolean;
  quiz_highest_score?: number | null;
}

export interface LmsLessonSummary {
  id: string;
  order_index: number;
  title: string;
  duration_mins: number;
  practice_problem?: string;
  completed: boolean;
}

export interface LmsLessonDetail {
  id: string;
  course_id: string;
  course_title: string;
  course_code: string;
  subject?: string;
  order_index: number;
  title: string;
  duration_mins: number;
  content: string;
  key_takeaways: string[];
  practice_problem?: string;
  completed: boolean;
  completed_at?: string;
  prev_lesson?: { id: string; title: string } | null;
  next_lesson?: { id: string; title: string } | null;
}

export interface LmsQuizQuestion {
  question_index: number;
  question: string;
  options: string[];
  student_choice?: number;
  correct_index?: number;
  is_correct?: boolean;
  explanation?: string;
}

export interface LmsQuizDetail {
  id: string;
  title: string;
  question_count: number;
  best_score: number | null;
  total_questions: number;
  passed: boolean;
  questions?: Array<{
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
  }>;
}

export interface LmsCourseWithLessons extends LmsCourse {
  lessons: LmsLessonSummary[];
  quiz?: LmsQuizDetail | null;
}

export interface LmsStudentStats {
  total_courses: number;
  total_lessons: number;
  completed_lessons: number;
  overall_progress_percent: number;
  quizzes_passed: number;
  average_quiz_score: number;
}

// ── RAG Types ────────────────────────────────────────────────────────────────
export interface RagDocumentItem {
  id: string;
  title: string;
  subject: string;
  source_type: string;
  author: string;
  created_at: string;
  chunk_count: number;
}
