import express from 'express';
import {
  enrollInCourse,
  getMyEnrollments,
  getEnrollmentByCourse,
  markVideoComplete,
  markPdfComplete,
  getCourseProgress,
  updateVideoPosition,
  unenrollFromCourse,
  checkEnrollmentStatus,
  getContinueLearning
} from '../../controller/enrollment/enrollment.controller.js';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';

const router = express.Router();

// All enrollment routes require authentication
router.use(protectedRoutes);

// ========================================
// Enrollment Routes
// ========================================

// Enroll in a course
// POST /api/enrollments/enroll
router.post('/enroll', enrollInCourse);

// Get user's enrollments
// GET /api/enrollments/my-courses
router.get('/my-courses', getMyEnrollments);

// Get continue learning data
// GET /api/enrollments/continue-learning
router.get('/continue-learning', getContinueLearning);

// Check enrollment status for a course
// GET /api/enrollments/check/:courseId
router.get('/check/:courseId', checkEnrollmentStatus);

// Get enrollment details for a specific course
// GET /api/enrollments/course/:courseId
router.get('/course/:courseId', getEnrollmentByCourse);

// Get course progress
// GET /api/enrollments/course/:courseId/progress
router.get('/course/:courseId/progress', getCourseProgress);

// Update current video position
// PATCH /api/enrollments/course/:courseId/position
router.patch('/course/:courseId/position', updateVideoPosition);

// Mark video as complete
// POST /api/enrollments/course/:courseId/video/:videoId/complete
router.post('/course/:courseId/video/:videoId/complete', markVideoComplete);

// Mark PDF as complete
// POST /api/enrollments/course/:courseId/pdf/:pdfId/complete
router.post('/course/:courseId/pdf/:pdfId/complete', markPdfComplete);

// Unenroll from course
// DELETE /api/enrollments/course/:courseId
router.delete('/course/:courseId', unenrollFromCourse);

export default router;

