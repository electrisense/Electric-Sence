import { db } from '../db';
import { randomUUID } from 'node:crypto';

/**
 * All 10 Core Electrical Engineering Subjects specified in Phase 1
 */
export const CORE_EEE_SUBJECTS = [
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
] as const;

export type EeeSubject = typeof CORE_EEE_SUBJECTS[number];

/**
 * Initialize all Phase 1-12 LMS, Document Management, and Vector Database Tables
 */
export function initLmsAndRagSchema() {
  db.exec(`
    -- 1. COURSES
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      instructor TEXT NOT NULL,
      level TEXT NOT NULL CHECK(level IN ('Introductory', 'Intermediate', 'Advanced')),
      duration_weeks INTEGER NOT NULL DEFAULT 4,
      thumbnail_icon TEXT DEFAULT 'BookOpen',
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    -- 2. LESSONS
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT NOT NULL,
      lesson_order INTEGER NOT NULL,
      duration_mins INTEGER NOT NULL DEFAULT 20,
      document_reference_id TEXT,
      key_takeaways TEXT NOT NULL,
      practice_problem TEXT,
      created_at TEXT NOT NULL
    );

    -- 3. ENROLLMENTS
    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      enrolled_at TEXT NOT NULL,
      UNIQUE(user_id, course_id)
    );

    -- 4. LESSON_PROGRESS
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      completed INTEGER NOT NULL DEFAULT 1,
      completed_at TEXT NOT NULL,
      UNIQUE(user_id, lesson_id)
    );

    -- 5. QUIZZES
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      passing_score INTEGER NOT NULL DEFAULT 75,
      created_at TEXT NOT NULL
    );

    -- 6. QUESTIONS
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      question_order INTEGER NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL, -- JSON array of strings
      correct_answer INTEGER NOT NULL, -- 0-based index
      explanation TEXT NOT NULL
    );

    -- 7. QUIZ_ATTEMPTS
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      submitted_at TEXT NOT NULL
    );

    -- 8. DOCUMENTS (Uploaded Reference Books, Lab Manuals, Notes)
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
      description TEXT,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      page_count INTEGER NOT NULL DEFAULT 1,
      processing_status TEXT NOT NULL CHECK(processing_status IN ('pending', 'processing', 'indexed', 'failed')),
      error_message TEXT,
      visibility TEXT NOT NULL DEFAULT 'public' CHECK(visibility IN ('public', 'course_only', 'admin_only')),
      uploaded_by TEXT NOT NULL DEFAULT 'Admin (Faculty)',
      created_at TEXT NOT NULL
    );

    -- 9. DOCUMENT_CHUNKS (Vector Storage with Float32Array binary embeddings)
    CREATE TABLE IF NOT EXISTS document_chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      chunk_index INTEGER NOT NULL,
      page_number INTEGER,
      subject TEXT NOT NULL,
      course_id TEXT,
      chunk_text TEXT NOT NULL,
      embedding BLOB, -- 3072 floats * 4 bytes = 12,288 bytes binary
      metadata TEXT, -- JSON
      created_at TEXT NOT NULL
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id, lesson_order);
    CREATE INDEX IF NOT EXISTS idx_progress_user ON lesson_progress(user_id, course_id);
    CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id, question_order);
    CREATE INDEX IF NOT EXISTS idx_docs_subject ON documents(subject);
    CREATE INDEX IF NOT EXISTS idx_docs_course ON documents(course_id);
    CREATE INDEX IF NOT EXISTS idx_chunks_doc ON document_chunks(document_id);
    CREATE INDEX IF NOT EXISTS idx_chunks_subject ON document_chunks(subject);
  `);
}
