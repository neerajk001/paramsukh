import Notification from '../../models/notification.models.js';
import { User } from '../../models/user.models.js';

// @desc    Get all notifications (Admin only)
// @route   GET /api/notifications/all
// @access  Admin
export const getAllNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, search } = req.query;

        const query = {};
        if (type) query.type = type;

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        const notifications = await Notification.find(query)
            .populate('user', 'displayName email phoneNumber')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await Notification.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                notifications,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total
                }
            }
        });
    } catch (error) {
        console.error('Get All Notifications Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve notifications',
            error: error.message
        });
    }
};

// @desc    Send broadcast notification to all users (Admin only)
// @route   POST /api/notifications/broadcast
// @access  Admin
export const sendBroadcastNotification = async (req, res) => {
    try {
        const { title, message, type = 'general', icon = '📢', priority = 'medium' } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Title and message are required'
            });
        }

        // Get all active users
        const users = await User.find({ isActive: true }).select('_id');
        const userIds = users.map(user => user._id);

        if (userIds.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active users found'
            });
        }

        // Create notifications for all users
        const notifications = userIds.map(userId => ({
            user: userId,
            type,
            title,
            message,
            icon,
            priority,
            isRead: false
        }));

        await Notification.insertMany(notifications);

        console.log(`📢 Admin sent broadcast notification to ${userIds.length} users`);

        res.status(201).json({
            success: true,
            message: `Notification sent to ${userIds.length} users`,
            data: {
                recipientCount: userIds.length
            }
        });
    } catch (error) {
        console.error('Send Broadcast Notification Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send broadcast notification',
            error: error.message
        });
    }
};

// @desc    Delete a notification (Admin only)
// @route   DELETE /api/notifications/:id
// @access  Admin
export const deleteNotificationAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByIdAndDelete(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        console.log(`🗑️ Admin deleted notification ${id}`);

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Delete Notification Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: error.message
        });
    }
};

// @desc    Mark notification as read (Admin only)
// @route   PATCH /api/notifications/:id/read
// @access  Admin
export const markNotificationReadAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        notification.isRead = true;
        notification.readAt = Date.now();
        await notification.save();

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: { notification }
        });
    } catch (error) {
        console.error('Mark Notification Read Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
};
