import { Router, Request, Response } from 'express';
import {
  listCourses,
  getCourseDetails,
  getLessonDetails,
  enrollStudent,
  updateLessonProgress,
  gradeQuizSubmission,
  getStudentLearningStats
} from '../lms/lmsStore';
import { CORE_EEE_SUBJECTS } from '../lms/schema';
import { db } from '../db';

const router = Router();

// GET /api/lms/subjects — List all 10 core EEE subjects with course counts
router.get('/lms/subjects', (_req: Request, res: Response) => {
  try {
    const subjects = CORE_EEE_SUBJECTS.map((sub) => {
      const countRow = db.prepare('SELECT count(*) as count FROM courses WHERE subject = ? AND published = 1').get(sub) as { count: number };
      const docCountRow = db.prepare('SELECT count(*) as count FROM documents WHERE subject = ?').get(sub) as { count: number };
      return {
        name: sub,
        courses_count: countRow.count,
        documents_count: docCountRow.count,
      };
    });
    res.json({ subjects });
  } catch (error: any) {
    console.error('Error fetching LMS subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// GET /api/lms/courses — List courses with subject filter & progress
router.get('/lms/courses', (req: Request, res: Response) => {
  try {
    const userId = (req.query.user_id as string) || 'usr_default_student';
    const subject = req.query.subject as string | undefined;
    const courses = listCourses(userId, subject);
    res.json({ courses });
  } catch (error: any) {
    console.error('Error fetching LMS courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/lms/courses/:id — Full course syllabus & lessons
router.get('/lms/courses/:id', (req: Request, res: Response) => {
  try {
    const userId = (req.query.user_id as string) || 'usr_default_student';
    const course = getCourseDetails(req.params.id, userId);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }
    res.json({ course });
  } catch (error: any) {
    console.error('Error fetching course outline:', error);
    res.status(500).json({ error: 'Failed to fetch course outline' });
  }
});

// POST /api/lms/courses/:id/enroll — Student enrollment
router.post('/lms/courses/:id/enroll', (req: Request, res: Response) => {
  try {
    const userId = req.body?.user_id || 'usr_default_student';
    const result = enrollStudent(userId, req.params.id);
    res.json({ success: true, enrollment: result });
  } catch (error: any) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: 'Failed to enroll in course' });
  }
});

// GET /api/lms/lessons/:id — Lesson content and formulas
router.get('/lms/lessons/:id', (req: Request, res: Response) => {
  try {
    const userId = (req.query.user_id as string) || 'usr_default_student';
    const lesson = getLessonDetails(req.params.id, userId);
    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }
    res.json({ lesson });
  } catch (error: any) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// POST /api/lms/lessons/:id/progress — Toggle lesson completion
router.post('/lms/lessons/:id/progress', (req: Request, res: Response) => {
  try {
    const { user_id, course_id, completed } = req.body || {};
    if (!course_id) {
      res.status(400).json({ error: 'course_id is required' });
      return;
    }
    const userId = user_id || 'usr_default_student';
    const isCompleted = typeof completed === 'boolean' ? completed : true;

    const result = updateLessonProgress(userId, course_id, req.params.id, isCompleted);
    res.json({ success: true, progress: result });
  } catch (error: any) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// GET /api/lms/quizzes/:id — Get quiz questions and user best attempt
router.get('/lms/quizzes/:id', (req: Request, res: Response) => {
  try {
    const userId = (req.query.user_id as string) || 'usr_default_student';
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(req.params.id) as any;
    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    const questions = db.prepare('SELECT id, question_order, question, options FROM questions WHERE quiz_id = ? ORDER BY question_order ASC').all(quiz.id) as any[];

    const bestAttempt = db.prepare(`
      SELECT score, total, passed, submitted_at
      FROM quiz_attempts
      WHERE quiz_id = ? AND user_id = ?
      ORDER BY score DESC LIMIT 1
    `).get(quiz.id, userId) as any;

    res.json({
      quiz: {
        id: quiz.id,
        course_id: quiz.course_id,
        title: quiz.title,
        passing_score: quiz.passing_score,
        questions: questions.map(q => ({
          id: q.id,
          question_order: q.question_order,
          question: q.question,
          options: JSON.parse(q.options),
        })),
        best_attempt: bestAttempt || null,
      }
    });
  } catch (error: any) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// POST /api/lms/quizzes/:id/submit — Submit and grade quiz
router.post('/lms/quizzes/:id/submit', (req: Request, res: Response) => {
  try {
    const { user_id, answers } = req.body || {};
    if (!Array.isArray(answers)) {
      res.status(400).json({ error: 'answers must be an array of selected option indices' });
      return;
    }

    const userId = user_id || 'usr_default_student';
    const result = gradeQuizSubmission(userId, req.params.id, answers);
    if (!result) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    res.json({ results: result });
  } catch (error: any) {
    console.error('Quiz grading error:', error);
    res.status(500).json({ error: 'Failed to grade quiz' });
  }
});

// GET /api/lms/stats — Student learning metrics
router.get('/lms/stats', (req: Request, res: Response) => {
  try {
    const userId = (req.query.user_id as string) || 'usr_default_student';
    const stats = getStudentLearningStats(userId);
    res.json({ stats });
  } catch (error: any) {
    console.error('Error fetching LMS stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
