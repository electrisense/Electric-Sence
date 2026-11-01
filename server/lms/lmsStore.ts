import { db } from '../db';
import { randomUUID } from 'node:crypto';
import { ALL_10_COURSES } from './curriculum';

/**
 * Seed all 10 core EEE courses, lessons, and quizzes into SQLite
 */
export function seedCurriculumIfEmpty() {
  const countStmt = db.prepare('SELECT count(*) as count FROM courses');
  const res = countStmt.get() as { count: number };

  if (res.count === 0) {
    console.log('🎓 Seeding complete 10-Subject Electrical Engineering LMS Curriculum...');
    const now = new Date().toISOString();

    const insertCourse = db.prepare(`
      INSERT INTO courses (
        id, code, title, subject, description, instructor, level, duration_weeks, thumbnail_icon, published, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    const insertLesson = db.prepare(`
      INSERT INTO lessons (
        id, course_id, title, description, content, lesson_order, duration_mins, key_takeaways, practice_problem, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertQuiz = db.prepare(`
      INSERT INTO quizzes (id, course_id, title, passing_score, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertQuestion = db.prepare(`
      INSERT INTO questions (id, quiz_id, question_order, question, options, correct_answer, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const c of ALL_10_COURSES) {
      insertCourse.run(
        c.id,
        c.code,
        c.title,
        c.subject,
        c.description,
        c.instructor,
        c.level,
        c.duration_weeks,
        c.thumbnail_icon,
        now
      );

      for (const les of c.lessons) {
        insertLesson.run(
          les.id,
          c.id,
          les.title,
          les.description,
          les.content,
          les.lesson_order,
          les.duration_mins,
          JSON.stringify(les.key_takeaways),
          les.practice_problem,
          now
        );
      }

      insertQuiz.run(c.quiz.id, c.id, c.quiz.title, c.quiz.passing_score, now);

      c.quiz.questions.forEach((q, qIdx) => {
        const qId = `q_${randomUUID()}`;
        insertQuestion.run(
          qId,
          c.quiz.id,
          qIdx + 1,
          q.question,
          JSON.stringify(q.options),
          q.correct_answer,
          q.explanation
        );
      });
    }

    console.log(`✅ Seeded ${ALL_10_COURSES.length} Electrical Engineering courses with full lessons & quizzes.`);
  }
}

/**
 * List all courses with real student enrollment & progress tracking
 */
export function listCourses(userId = 'usr_default_student', subjectFilter?: string) {
  let sql = `
    SELECT 
      c.*,
      COUNT(DISTINCT l.id) as total_lessons
    FROM courses c
    LEFT JOIN lessons l ON l.course_id = c.id
    WHERE c.published = 1
  `;
  const params: any[] = [];

  if (subjectFilter && subjectFilter !== 'all') {
    sql += ` AND c.subject = ?`;
    params.push(subjectFilter);
  }

  sql += ` GROUP BY c.id ORDER BY c.code ASC`;

  const rows = db.prepare(sql).all(...params) as any[];

  return rows.map((c) => {
    // Check enrollment
    const enrollRow = db.prepare('SELECT id, enrolled_at FROM enrollments WHERE user_id = ? AND course_id = ?').get(userId, c.id) as any;

    // Completed lessons count
    const completedRow = db.prepare(`
      SELECT count(*) as count 
      FROM lesson_progress 
      WHERE user_id = ? AND course_id = ? AND completed = 1
    `).get(userId, c.id) as { count: number };

    // Quiz status
    const quizRow = db.prepare(`
      SELECT q.id as quiz_id, MAX(qa.passed) as passed, MAX(qa.score) as highest_score, qa.total
      FROM quizzes q
      LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.user_id = ?
      WHERE q.course_id = ?
      GROUP BY q.id
    `).get(userId, c.id) as any;

    const total = c.total_lessons || 1;
    const progressPercent = Math.min(Math.round((completedRow.count / total) * 100), 100);

    return {
      id: c.id,
      code: c.code,
      title: c.title,
      subject: c.subject,
      description: c.description,
      instructor: c.instructor,
      level: c.level,
      duration_weeks: c.duration_weeks,
      thumbnail_icon: c.thumbnail_icon,
      total_lessons: c.total_lessons,
      completed_lessons: completedRow.count,
      progress_percent: progressPercent,
      is_enrolled: !!enrollRow,
      enrolled_at: enrollRow?.enrolled_at || null,
      is_completed: progressPercent === 100 && (quizRow ? !!quizRow.passed : true),
      quiz_id: quizRow?.quiz_id || null,
      quiz_passed: !!quizRow?.passed,
      quiz_highest_score: quizRow?.highest_score ?? null,
    };
  });
}

/**
 * Get detailed course outline, lessons, and exam
 */
export function getCourseDetails(courseId: string, userId = 'usr_default_student') {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as any;
  if (!course) return null;

  const lessons = db.prepare(`
    SELECT 
      l.id, l.title, l.description, l.lesson_order, l.duration_mins,
      p.completed, p.completed_at
    FROM lessons l
    LEFT JOIN lesson_progress p ON p.lesson_id = l.id AND p.user_id = ?
    WHERE l.course_id = ?
    ORDER BY l.lesson_order ASC
  `).all(userId, courseId) as any[];

  const quizRow = db.prepare('SELECT id, title, passing_score FROM quizzes WHERE course_id = ?').get(courseId) as any;

  let quiz = null;
  if (quizRow) {
    const qCount = (db.prepare('SELECT count(*) as count FROM questions WHERE quiz_id = ?').get(quizRow.id) as any).count;
    const bestAttempt = db.prepare(`
      SELECT score, total, passed, submitted_at
      FROM quiz_attempts
      WHERE quiz_id = ? AND user_id = ?
      ORDER BY score DESC LIMIT 1
    `).get(quizRow.id, userId) as any;

    quiz = {
      id: quizRow.id,
      title: quizRow.title,
      passing_score: quizRow.passing_score,
      question_count: qCount,
      best_score: bestAttempt?.score ?? null,
      total_questions: bestAttempt?.total ?? qCount,
      passed: !!bestAttempt?.passed,
    };
  }

  const completedCount = lessons.filter(l => l.completed === 1).length;
  const progressPercent = Math.round((completedCount / (lessons.length || 1)) * 100);

  const isEnrolled = !!db.prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?').get(userId, courseId);

  return {
    ...course,
    is_enrolled: isEnrolled,
    completed_lessons: completedCount,
    total_lessons: lessons.length,
    progress_percent: progressPercent,
    lessons: lessons.map(l => ({
      ...l,
      completed: !!l.completed,
    })),
    quiz,
  };
}

/**
 * Get single lesson with content, takeaways, problem, and adjacent navigation
 */
export function getLessonDetails(lessonId: string, userId = 'usr_default_student') {
  const lesson = db.prepare(`
    SELECT l.*, c.title as course_title, c.code as course_code, c.subject as course_subject
    FROM lessons l
    JOIN courses c ON c.id = l.course_id
    WHERE l.id = ?
  `).get(lessonId) as any;

  if (!lesson) return null;

  const progress = db.prepare('SELECT completed, completed_at FROM lesson_progress WHERE user_id = ? AND lesson_id = ?').get(userId, lessonId) as any;

  const prev = db.prepare('SELECT id, title FROM lessons WHERE course_id = ? AND lesson_order < ? ORDER BY lesson_order DESC LIMIT 1').get(lesson.course_id, lesson.lesson_order) as any;
  const next = db.prepare('SELECT id, title FROM lessons WHERE course_id = ? AND lesson_order > ? ORDER BY lesson_order ASC LIMIT 1').get(lesson.course_id, lesson.lesson_order) as any;

  return {
    id: lesson.id,
    course_id: lesson.course_id,
    course_title: lesson.course_title,
    course_code: lesson.course_code,
    course_subject: lesson.course_subject,
    lesson_order: lesson.lesson_order,
    title: lesson.title,
    description: lesson.description,
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
 * Enroll student in a course
 */
export function enrollStudent(userId = 'usr_default_student', courseId: string) {
  const id = `enr_${userId}_${courseId}`;
  const now = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO enrollments (id, user_id, course_id, enrolled_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, course_id) DO NOTHING
  `);
  insert.run(id, userId, courseId, now);

  return { enrolled: true, enrolled_at: now };
}

/**
 * Mark lesson as completed / toggle progress
 */
export function updateLessonProgress(userId = 'usr_default_student', courseId: string, lessonId: string, completed: boolean) {
  // Ensure student is enrolled
  enrollStudent(userId, courseId);

  const id = `prog_${userId}_${lessonId}`;
  const now = new Date().toISOString();

  const upsert = db.prepare(`
    INSERT INTO lesson_progress (id, user_id, course_id, lesson_id, completed, completed_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, lesson_id) DO UPDATE SET
      completed = excluded.completed,
      completed_at = excluded.completed_at
  `);
  upsert.run(id, userId, courseId, lessonId, completed ? 1 : 0, now);

  return { lessonId, courseId, completed, updatedAt: now };
}

/**
 * Submit and grade a course quiz
 */
export function gradeQuizSubmission(userId = 'usr_default_student', quizId: string, answers: number[]) {
  const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(quizId) as any;
  if (!quiz) return null;

  const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ? ORDER BY question_order ASC').all(quizId) as any[];

  let correctCount = 0;
  const detailedResults = questions.map((q, idx) => {
    const studentAnswer = answers[idx];
    const isCorrect = studentAnswer === q.correct_answer;
    if (isCorrect) correctCount++;

    return {
      question_id: q.id,
      question_order: q.question_order,
      question: q.question,
      options: JSON.parse(q.options),
      student_choice: studentAnswer,
      correct_answer: q.correct_answer,
      is_correct: isCorrect,
      explanation: q.explanation,
    };
  });

  const total = questions.length;
  const percentage = Math.round((correctCount / (total || 1)) * 100);
  const passed = percentage >= quiz.passing_score ? 1 : 0;
  const now = new Date().toISOString();

  const attemptId = `att_${randomUUID()}`;
  db.prepare(`
    INSERT INTO quiz_attempts (id, user_id, quiz_id, score, total, passed, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(attemptId, userId, quizId, correctCount, total, passed, now);

  return {
    attempt_id: attemptId,
    quiz_id: quizId,
    title: quiz.title,
    score: correctCount,
    total,
    percentage,
    passing_score: quiz.passing_score,
    passed: !!passed,
    detailed_results: detailedResults,
    submitted_at: now,
  };
}

/**
 * Get student overall metrics
 */
export function getStudentLearningStats(userId = 'usr_default_student') {
  const totalCourses = (db.prepare('SELECT count(*) as count FROM courses WHERE published = 1').get() as any).count;
  const enrolledCourses = (db.prepare('SELECT count(*) as count FROM enrollments WHERE user_id = ?').get(userId) as any).count;
  const totalLessons = (db.prepare('SELECT count(*) as count FROM lessons').get() as any).count;
  const completedLessons = (db.prepare('SELECT count(*) as count FROM lesson_progress WHERE user_id = ? AND completed = 1').get(userId) as any).count;
  const quizzesPassed = (db.prepare('SELECT count(DISTINCT quiz_id) as count FROM quiz_attempts WHERE user_id = ? AND passed = 1').get(userId) as any).count;
  const avgScoreRow = db.prepare('SELECT AVG(score * 1.0 / total) * 100 as avg FROM quiz_attempts WHERE user_id = ?').get(userId) as any;

  return {
    total_courses: totalCourses,
    enrolled_courses: enrolledCourses,
    total_lessons: totalLessons,
    completed_lessons: completedLessons,
    overall_progress_percent: Math.min(Math.round((completedLessons / (totalLessons || 1)) * 100), 100),
    quizzes_passed: quizzesPassed,
    average_quiz_score: Math.round(avgScoreRow?.avg || 0),
    user_id: userId,
    student_profile: {
      name: 'Electrical Engineering Student',
      email: 'student@electricsence.edu',
      is_development_profile: true,
      note: 'Development-only Student Profile. Production multi-tenant auth can be plugged in seamlessly.'
    }
  };
}

