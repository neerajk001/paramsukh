import Notification from '../../models/notification.models.js';

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
