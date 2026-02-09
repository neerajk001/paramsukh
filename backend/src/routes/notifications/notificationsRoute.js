import express from 'express';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createTestNotification
} from '../../controller/notifications/notifications.controller.js';

const router = express.Router();

// All routes are protected (require authentication)
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
