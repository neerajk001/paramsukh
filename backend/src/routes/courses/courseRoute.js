import express from 'express';
import { createCourse, deleteCourse, updateCourse, getAllCourses, getCourseById, getCourseBySlug } from '../../controller/courses/courses.controller.js';
import { addPdfToCourse, getCoursePdfs, updatePdf, deletePdf, getPdfById } from '../../controller/courses/pdf.controller.js';
import { addVideoToCourse, getCourseVideos, updateVideo, deleteVideo, getVideoById } from '../../controller/courses/videos.controller.js';
import {
  addLiveSessionToCourse,
  getCourseLiveSessions,
  getLiveSessionById,
  updateLiveSession,
  deleteLiveSession,
  addSessionRecording
} from '../../controller/courses/session.controller.js';
import {
  markVideoComplete,
  markPdfComplete,
  getEnrollmentProgress
} from '../../controller/courses/progress.controller.js';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';

const router = express.Router();

router.post('/create', createCourse);
router.delete('/delete/:id', deleteCourse);
router.put('/update/:id', updateCourse);
router.get('/all', getAllCourses);
router.get('/:id', getCourseById);
router.get('/:slug', getCourseBySlug);


router.post('/:courseId/videos', addVideoToCourse);
router.get('/:courseId/videos', getCourseVideos);
router.get('/:courseId/videos/:videoId', getVideoById); // Specific video route must come before update/delete
router.put('/:courseId/videos/:videoId', updateVideo);
router.delete('/:courseId/videos/:videoId', deleteVideo);

//pdf routes
router.post('/:courseId/pdfs', addPdfToCourse);
router.get('/:courseId/pdfs', getCoursePdfs);
router.get('/:courseId/pdfs/:pdfId', getPdfById); // Specific pdf route must come before update/delete
router.put('/:courseId/pdfs/:pdfId', updatePdf);
router.delete('/:courseId/pdfs/:pdfId', deletePdf);

// livesession routes
router.post('/:courseId/livesessions', addLiveSessionToCourse);
router.get('/:courseId/livesessions', getCourseLiveSessions);
router.get('/:courseId/livesessions/:liveSessionId', getLiveSessionById);
router.put('/:courseId/livesessions/:liveSessionId', updateLiveSession);
router.delete('/:courseId/livesessions/:liveSessionId', deleteLiveSession);
router.patch('/:courseId/livesessions/:liveSessionId/recording', addSessionRecording);

// Progress tracking routes (require authentication)
router.get('/:courseId/progress', protectedRoutes, getEnrollmentProgress);
router.post('/:courseId/progress/video/:videoId', protectedRoutes, markVideoComplete);
router.post('/:courseId/progress/pdf/:pdfId', protectedRoutes, markPdfComplete);

export default router;