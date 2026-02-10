import Booking from '../../models/booking.models.js';

// @desc    Get all bookings (Admin only)
// @route   GET /api/counseling/all
// @access  Admin
export const getAllBookings = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;

        const query = {};
        if (status) query.status = status;

        if (search) {
            query.$or = [
                { bookingTitle: { $regex: search, $options: 'i' } },
                { counselorName: { $regex: search, $options: 'i' } },
                { userPhone: { $regex: search, $options: 'i' } }
            ];
        }

        const bookings = await Booking.find(query)
            .populate('user', 'displayName email phoneNumber')
            .sort({ bookingDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await Booking.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                bookings,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total
                }
            }
        });
    } catch (error) {
        console.error('Get All Bookings Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve bookings',
            error: error.message
        });
    }
};
