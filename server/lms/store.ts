import { db } from '../db';
import { randomUUID } from 'node:crypto';
import { SEED_COURSES, SeedCourse } from '../seedData';

/**
 * Initialize LMS tables in SQLite and seed initial EEE curriculum
 */
export function initLmsTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS lms_courses (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      level TEXT NOT NULL,
      duration_weeks INTEGER NOT NULL,
      instructor TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lms_lessons (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      title TEXT NOT NULL,
      duration_mins INTEGER NOT NULL,
      content TEXT NOT NULL,
      key_takeaways TEXT NOT NULL,
      practice_problem TEXT,
      FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lms_quizzes (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      questions TEXT NOT NULL,
      FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lms_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 1,
      completed_at TEXT NOT NULL,
      UNIQUE(user_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS lms_quiz_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_lms_lessons_course ON lms_lessons(course_id, order_index);
    CREATE INDEX IF NOT EXISTS idx_lms_progress_user ON lms_progress(user_id, course_id);
  `);

  // Seed default LMS courses if table is empty
  const countStmt = db.prepare('SELECT count(*) as count FROM lms_courses');
  const res = countStmt.get() as { count: number };

  if (res.count === 0) {
    console.log('🎓 Seeding LMS EEE Courses and Curriculum...');
    const now = new Date().toISOString();

    const insertCourse = db.prepare(`
      INSERT INTO lms_courses (id, code, title, category, description, level, duration_weeks, instructor, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertLesson = db.prepare(`
      INSERT INTO lms_lessons (id, course_id, order_index, title, duration_mins, content, key_takeaways, practice_problem)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertQuiz = db.prepare(`
      INSERT INTO lms_quizzes (id, course_id, title, questions)
      VALUES (?, ?, ?, ?)
    `);

    for (const c of SEED_COURSES) {
      insertCourse.run(c.id, c.code, c.title, c.category, c.description, c.level, c.duration_weeks, c.instructor, now);

      for (const les of c.lessons) {
        insertLesson.run(
          les.id,
          c.id,
          les.order_index,
          les.title,
          les.duration_mins,
          les.content,
          JSON.stringify(les.key_takeaways),
          les.practice_problem
        );
      }

      insertQuiz.run(
        c.quiz.id,
        c.id,
        c.quiz.title,
        JSON.stringify(c.quiz.questions)
      );
    }

    console.log(`✅ Seeded ${SEED_COURSES.length} interactive EEE courses into LMS.`);
  }
}

/**
 * Get all courses with student progress metrics
 */
export function getCoursesWithProgress(userId = 'usr_default_student') {
  const coursesStmt = db.prepare(`
    SELECT 
      c.*,
      COUNT(DISTINCT l.id) as total_lessons
    FROM lms_courses c
    LEFT JOIN lms_lessons l ON l.course_id = c.id
    GROUP BY c.id
    ORDER BY c.code ASC
  `);
  const courses = coursesStmt.all() as any[];

  return courses.map((course) => {
    // Count completed lessons for this user
    const completedStmt = db.prepare(`
      SELECT count(*) as completed_count
      FROM lms_progress
      WHERE user_id = ? AND course_id = ? AND completed = 1
    `);
    const { completed_count } = completedStmt.get(userId, course.id) as { completed_count: number };

    // Check if quiz was passed
    const quizStmt = db.prepare(`
      SELECT q.id as quiz_id, MAX(qa.passed) as passed, MAX(qa.score) as highest_score, qa.total
      FROM lms_quizzes q
      LEFT JOIN lms_quiz_attempts qa ON qa.quiz_id = q.id AND qa.user_id = ?
      WHERE q.course_id = ?
      GROUP BY q.id
    `);
    const quizData = quizStmt.get(userId, course.id) as any;

    const total = course.total_lessons || 1;
    const progressPercent = Math.min(Math.round((completed_count / total) * 100), 100);

    return {
      id: course.id,
      code: course.code,
      title: course.title,
      category: course.category,
      description: course.description,
      level: course.level,
      duration_weeks: course.duration_weeks,
      instructor: course.instructor,
      total_lessons: course.total_lessons,
      completed_lessons: completed_count,
      progress_percent: progressPercent,
      is_completed: progressPercent === 100 && (quizData ? !!quizData.passed : true),
      quiz_id: quizData?.quiz_id || null,
      quiz_passed: !!quizData?.passed,
      quiz_highest_score: quizData?.highest_score ?? null,
    };
  });
}

/**
 * Get full course details, including ordered lessons and completion status
 */
export function getCourseDetails(courseId: string, userId = 'usr_default_student') {
  const courseStmt = db.prepare('SELECT * FROM lms_courses WHERE id = ?');
  const course = courseStmt.get(courseId) as any;
  if (!course) return null;

  const lessonsStmt = db.prepare(`
    SELECT 
      l.id, l.order_index, l.title, l.duration_mins, l.practice_problem,
      p.completed, p.completed_at
    FROM lms_lessons l
    LEFT JOIN lms_progress p ON p.lesson_id = l.id AND p.user_id = ?
    WHERE l.course_id = ?
    ORDER BY l.order_index ASC
  `);
  const lessons = lessonsStmt.all(userId, courseId) as any[];

  const quizStmt = db.prepare('SELECT id, title, questions FROM lms_quizzes WHERE course_id = ?');
  const quizRow = quizStmt.get(courseId) as any;

  let quiz = null;
  if (quizRow) {
    const attemptStmt = db.prepare(`
      SELECT score, total, passed, created_at
      FROM lms_quiz_attempts
      WHERE quiz_id = ? AND user_id = ?
      ORDER BY score DESC LIMIT 1
    `);
    const bestAttempt = attemptStmt.get(quizRow.id, userId) as any;

    const questions = JSON.parse(quizRow.questions);
    quiz = {
      id: quizRow.id,
      title: quizRow.title,
      question_count: questions.length,
      best_score: bestAttempt?.score ?? null,
      total_questions: bestAttempt?.total ?? questions.length,
      passed: !!bestAttempt?.passed,
    };
  }

  const completedCount = lessons.filter(l => l.completed === 1).length;
  const progressPercent = Math.round((completedCount / (lessons.length || 1)) * 100);

  return {
    ...course,
    lessons: lessons.map(l => ({
      ...l,
      completed: !!l.completed,
    })),
    completed_lessons: completedCount,
    total_lessons: lessons.length,
    progress_percent: progressPercent,
    quiz,
  };
}

/**
 * Get single lesson with full content, formula takeaways, and adjacent navigation
 */
export function getLessonDetails(lessonId: string, userId = 'usr_default_student') {
  const lessonStmt = db.prepare(`
    SELECT l.*, c.title as course_title, c.code as course_code
    FROM lms_lessons l
    JOIN lms_courses c ON c.id = l.course_id
    WHERE l.id = ?
  `);
  const lesson = lessonStmt.get(lessonId) as any;
  if (!lesson) return null;

  const progressStmt = db.prepare('SELECT completed, completed_at FROM lms_progress WHERE user_id = ? AND lesson_id = ?');
  const progress = progressStmt.get(userId, lessonId) as any;

  // Adjacent lessons
  const prevLessonStmt = db.prepare('SELECT id, title FROM lms_lessons WHERE course_id = ? AND order_index < ? ORDER BY order_index DESC LIMIT 1');
  const nextLessonStmt = db.prepare('SELECT id, title FROM lms_lessons WHERE course_id = ? AND order_index > ? ORDER BY order_index ASC LIMIT 1');

  const prev = prevLessonStmt.get(lesson.course_id, lesson.order_index) as any;
  const next = nextLessonStmt.get(lesson.course_id, lesson.order_index) as any;

  return {
    id: lesson.id,
    course_id: lesson.course_id,
    course_title: lesson.course_title,
    course_code: lesson.course_code,
    order_index: lesson.order_index,
    title: lesson.title,
    duration_mins: lesson.duration_mins,
    content: lesson.content,
    key_takeaways: JSON.parse(lesson.key_takeaways || '[]'),
    practice_problem: lesson.practice_problem,
    completed: !!progress?.completed,
    completed_at: progress?.completed_at || null,
    prev_lesson: prev || null,
    next_lesson: next || null,
  };
}

/**
 * Mark a lesson as completed or incomplete
 */
export function setLessonProgress(userId = 'usr_default_student', courseId: string, lessonId: string, completed: boolean) {
  const id = `prog_${userId}_${lessonId}`;
  const now = new Date().toISOString();

  const upsert = db.prepare(`
    INSERT INTO lms_progress (id, user_id, course_id, lesson_id, completed, completed_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, lesson_id) DO UPDATE SET
      completed = excluded.completed,
      completed_at = excluded.completed_at
  `);
  upsert.run(id, userId, courseId, lessonId, completed ? 1 : 0, now);

  return { lessonId, courseId, completed, updatedAt: now };
}

/**
 * Submit and grade a quiz
 */
export function gradeAndRecordQuiz(userId = 'usr_default_student', quizId: string, submittedAnswers: number[]) {
  const quizStmt = db.prepare('SELECT * FROM lms_quizzes WHERE id = ?');
  const quiz = quizStmt.get(quizId) as any;
  if (!quiz) return null;

  const questions = JSON.parse(quiz.questions) as Array<{
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
  }>;

  let score = 0;
  const detailedResults = questions.map((q, idx) => {
    const studentChoice = submittedAnswers[idx];
    const isCorrect = studentChoice === q.correct_index;
    if (isCorrect) score += 1;

    return {
      question_index: idx,
      question: q.question,
      options: q.options,
      student_choice: studentChoice,
      correct_index: q.correct_index,
      is_correct: isCorrect,
      explanation: q.explanation,
    };
  });

  const total = questions.length;
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 75 ? 1 : 0;
  const now = new Date().toISOString();

  const insertAttempt = db.prepare(`
    INSERT INTO lms_quiz_attempts (id, user_id, quiz_id, score, total, passed, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertAttempt.run(`qa_${randomUUID()}`, userId, quizId, score, total, passed, now);

  return {
    quiz_id: quizId,
    title: quiz.title,
    score,
    total,
    percentage,
    passed: !!passed,
    detailedResults,
    submitted_at: now,
  };
}

/**
 * Get student overall learning metrics & earned achievements
 */
export function getStudentLmsStats(userId = 'usr_default_student') {
  const coursesStmt = db.prepare('SELECT count(*) as count FROM lms_courses');
  const totalCourses = (coursesStmt.get() as { count: number }).count;

  const lessonsStmt = db.prepare('SELECT count(*) as count FROM lms_lessons');
  const totalLessons = (lessonsStmt.get() as { count: number }).count;

  const completedLessonsStmt = db.prepare('SELECT count(*) as count FROM lms_progress WHERE user_id = ? AND completed = 1');
  const completedLessons = (completedLessonsStmt.get(userId) as { count: number }).count;

  const passedQuizzesStmt = db.prepare('SELECT count(DISTINCT quiz_id) as count FROM lms_quiz_attempts WHERE user_id = ? AND passed = 1');
  const passedQuizzes = (passedQuizzesStmt.get(userId) as { count: number }).count;

  const avgScoreStmt = db.prepare('SELECT AVG(score * 1.0 / total) * 100 as avg_pct FROM lms_quiz_attempts WHERE user_id = ?');
  const avgScore = (avgScoreStmt.get(userId) as { avg_pct: number | null })?.avg_pct ?? 0;

  return {
    total_courses: totalCourses,
    total_lessons: totalLessons,
    completed_lessons: completedLessons,
    overall_progress_percent: Math.min(Math.round((completedLessons / (totalLessons || 1)) * 100), 100),
    quizzes_passed: passedQuizzes,
    average_quiz_score: Math.round(avgScore),
  };
}

