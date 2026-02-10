import express from 'express';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';
import { adminAuth } from '../../middleware/adminAuth.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createTestNotification
} from '../../controller/notifications/notifications.controller.js';
import {
  getAllNotifications,
  sendBroadcastNotification,
  deleteNotificationAdmin,
  markNotificationReadAdmin
} from '../../controller/notifications/admin.notifications.controller.js';

const router = express.Router();

// Admin routes
router.get('/all', adminAuth, getAllNotifications);
router.post('/broadcast', adminAuth, sendBroadcastNotification);
router.delete('/:id/admin', adminAuth, deleteNotificationAdmin);
router.patch('/:id/read/admin', adminAuth, markNotificationReadAdmin);

// All other routes are protected (require authentication)
router.use(protectedRoutes);

// ========================================
// Notification Routes
// ========================================

// Get all notifications (with pagination and filters)
router.get('/', getNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

// Delete all notifications
router.delete('/all', deleteAllNotifications);

// Create test notification (for development)
router.post('/test', createTestNotification);

// Mark specific notification as read
router.patch('/:id/read', markAsRead);

// Delete specific notification
router.delete('/:id', deleteNotification);

export default router;
