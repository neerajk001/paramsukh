import express from 'express';
import {
  getProfile,
  updateProfile,
  updateProfilePhoto,
  removeProfilePhoto,
  updatePreferences,
  getSubscription,
  getUserStats,
  deactivateAccount,
  deleteAccount,
  purchaseMembership
} from '../../controller/user/profile.controller.js';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';

const router = express.Router();

// All user routes require authentication
router.use(protectedRoutes);

// ========================================
// Profile Routes
// ========================================

// Get user profile
// GET /api/user/profile
router.get('/profile', getProfile);

// Update user profile
// PUT /api/user/profile
router.put('/profile', updateProfile);

// Update profile photo
// PUT /api/user/profile/photo
router.put('/profile/photo', updateProfilePhoto);

// Remove profile photo
// DELETE /api/user/profile/photo
router.delete('/profile/photo', removeProfilePhoto);

// ========================================
// Preferences Routes
// ========================================

// Update preferences (theme, notifications)
// PUT /api/user/preferences
router.put('/preferences', updatePreferences);

// ========================================
// Subscription & Stats Routes
// ========================================

// Get subscription details
// GET /api/user/subscription
router.get('/subscription', getSubscription);

// Purchase membership (auto-enrolls in courses)
// POST /api/user/membership/purchase
router.post('/membership/purchase', purchaseMembership);

// Get user statistics
// GET /api/user/stats
router.get('/stats', getUserStats);

// ========================================
// Account Management Routes
// ========================================

// Deactivate account
// POST /api/user/deactivate
router.post('/deactivate', deactivateAccount);

// Delete account permanently
// DELETE /api/user/account
router.delete('/account', deleteAccount);

export default router;

