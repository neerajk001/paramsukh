import Assessment from '../models/assessment.models.js';
import { User } from '../models/user.models.js';

/**
 * Middleware to check if user has completed assessment
 * Redirects or returns error if assessment not completed
 */
export const assessmentRequired = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check if assessment exists for user
    const assessment = await Assessment.findOne({ user: userId });

    if (!assessment) {
      return res.status(403).json({
        success: false,
        message: 'Please complete your assessment to access this feature',
        requiresAssessment: true
      });
    }

    // Attach assessment to request for use in controllers
    req.assessment = assessment;
    next();
  } catch (error) {
    console.error('Assessment Required Middleware Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify assessment status'
    });
  }
};
