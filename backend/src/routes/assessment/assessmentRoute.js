import express from 'express';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';
import {
  submitAssessment,
  getAssessment,
  getRecommendations,
  deleteAssessment,
  checkAssessmentStatus
} from '../../controller/assessment/assessment.controller.js';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protectedRoutes);

// ========================================
// Assessment Routes
// ========================================

// Submit or update assessment
router.post('/submit', submitAssessment);

// Get user's assessment
router.get('/', getAssessment);

// Get personalized recommendations
router.get('/recommendations', getRecommendations);

// Check assessment completion status
router.get('/status', checkAssessmentStatus);

// Delete assessment
router.delete('/', deleteAssessment);

export default router;
