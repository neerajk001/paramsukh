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
import {
  getAllUsers,
  getUserById,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  updateUserMembership,
  getUserEnrollments,
  getUserPayments,
  getUserActivity
} from '../../controller/user/admin.controller.js';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';
import { adminAuth } from '../../middleware/adminAuth.js';

const router = express.Router();

// ========================================
// Admin Routes (Requires X-Admin-API-Key header)
// ========================================

// Get all users (Admin only)
// GET /api/user/all
router.get('/all', adminAuth, getAllUsers);

// Get user by ID (Admin only)
// GET /api/user/:id
router.get('/:id', adminAuth, getUserById);

// Create user (Admin only)
// POST /api/user/create
router.post('/create', adminAuth, createUserAdmin);

// Update user details (Admin only)
// PATCH /api/user/:id
router.patch('/:id', adminAuth, updateUserAdmin);

// Delete user (Admin only)
// DELETE /api/user/:id
router.delete('/:id', adminAuth, deleteUserAdmin);

// Update user membership (Admin only)
// PATCH /api/user/:id/membership
router.patch('/:id/membership', adminAuth, updateUserMembership);

// Get user enrollments (Admin only)
// GET /api/user/:userId/enrollments
router.get('/:userId/enrollments', adminAuth, getUserEnrollments);

// Get user payments (Admin only)
// GET /api/user/:userId/payments
router.get('/:userId/payments', adminAuth, getUserPayments);

// Get user activity (Admin only)
// GET /api/user/:userId/activity
router.get('/:userId/activity', adminAuth, getUserActivity);

// ========================================
// User Routes (Requires authentication)
// ========================================

// All remaining user routes require authentication
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

