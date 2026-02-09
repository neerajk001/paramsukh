import Booking from '../../models/booking.models.js';
import { User } from '../../models/user.models.js';
import { sendNotification } from '../notifications/notifications.controller.js';

// @desc    Get available time slots
// @route   GET /api/counseling/availability
// @access  Private
export const getAvailability = async (req, res) => {
  try {
    const { date, counselorType } = req.query;

    if (!date || !counselorType) {
      return res.status(400).json({
        success: false,
        message: 'Date and counselor type are required'
      });
    }

    const availableSlots = await Booking.getAvailableSlots(date, counselorType);

    res.status(200).json({
      success: true,
      data: {
        date,
        counselorType,
        availableSlots,
        totalSlots: availableSlots.length
      }
    });
  } catch (error) {
    console.error('Get Availability Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get availability',
      error: error.message
    });
  }
};

// @desc    Book a counseling session
// @route   POST /api/counseling/book
// @access  Private
export const bookCounseling = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      counselorType,
      counselorName,
      bookingType,
      bookingTitle,
      bookingDate,
      bookingTime,
      userNotes,
      amount
    } = req.body;

    // Validate required fields
    if (!counselorType || !counselorName || !bookingType || !bookingTitle || !bookingDate || !bookingTime) {
      return res.status(400).json({
        success: false,
        message: 'All booking details are required'
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if slot is available
    const existingBooking = await Booking.findOne({
      bookingDate: new Date(bookingDate),
      bookingTime,
      counselorType,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please select another time.'
      });
    }

    // Determine if booking is free or paid
    const isFree = counselorType === 'team' || amount === 0;
    const bookingAmount = isFree ? 0 : (amount || 999);

    // Create booking
    const booking = new Booking({
      user: userId,
      counselorType,
      counselorName,
      bookingType,
      bookingTitle,
      bookingDate: new Date(bookingDate),
      bookingTime,
      userNotes: userNotes || '',
      userPhone: user.phoneNumber,
      userEmail: user.email || '',
      isFree,
      amount: bookingAmount,
      paymentStatus: isFree ? 'not_required' : 'pending',
      status: isFree ? 'confirmed' : 'pending'
    });

    await booking.save();

    // Send notification to user
    await sendNotification(userId, {
      type: 'counseling_booked',
      title: 'Counseling Session Booked',
      message: `Your ${bookingTitle} session is scheduled for ${new Date(bookingDate).toLocaleDateString()} at ${bookingTime}`,
      icon: '📅',
      priority: 'high',
      relatedId: booking._id,
      relatedType: 'booking',
      actionUrl: `/counseling/${booking._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Counseling session booked successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Book Counseling Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book counseling session',
      error: error.message
    });
  }
};

// @desc    Get user's bookings
// @route   GET /api/counseling/my-bookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, upcoming = false } = req.query;

    let query = { user: userId };

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.bookingDate = { $gte: new Date() };
      query.status = { $in: ['pending', 'confirmed'] };
    }

    const bookings = await Booking.find(query)
      .sort({ bookingDate: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        bookings,
        total: bookings.length
      }
    });
  } catch (error) {
    console.error('Get My Bookings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings',
      error: error.message
    });
  }
};

// @desc    Get booking details
// @route   GET /api/counseling/:bookingId
// @access  Private
export const getBookingDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId
    }).populate('user', 'fullName email phoneNumber');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    console.error('Get Booking Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking details',
      error: error.message
    });
  }
};

// @desc    Cancel a booking
// @route   PATCH /api/counseling/:bookingId/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }

    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Bookings can only be cancelled at least 24 hours in advance'
      });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = Date.now();
    booking.cancellationReason = reason || 'User requested cancellation';
    booking.cancelledBy = 'user';

    await booking.save();

    // Send notification
    await sendNotification(userId, {
      type: 'system',
      title: 'Booking Cancelled',
      message: `Your counseling session scheduled for ${booking.bookingDate.toLocaleDateString()} has been cancelled`,
      icon: '❌',
      priority: 'medium'
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Cancel Booking Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};

// @desc    Reschedule a booking
// @route   PATCH /api/counseling/:bookingId/reschedule
// @access  Private
export const rescheduleBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookingId } = req.params;
    const { newDate, newTime, reason } = req.body;

    if (!newDate || !newTime) {
      return res.status(400).json({
        success: false,
        message: 'New date and time are required'
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!booking.canBeRescheduled()) {
      return res.status(400).json({
        success: false,
        message: 'Bookings can only be rescheduled at least 48 hours in advance'
      });
    }

    // Check if new slot is available
    const existingBooking = await Booking.findOne({
      bookingDate: new Date(newDate),
      bookingTime: newTime,
      counselorType: booking.counselorType,
      status: { $in: ['pending', 'confirmed'] },
      _id: { $ne: bookingId }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'The new time slot is already booked. Please select another time.'
      });
    }

    // Update booking
    booking.rescheduledFrom = booking.bookingDate;
    booking.bookingDate = new Date(newDate);
    booking.bookingTime = newTime;
    booking.rescheduledReason = reason || 'User requested reschedule';
    booking.rescheduledBy = 'user';
    booking.status = 'confirmed';

    await booking.save();

    // Send notification
    await sendNotification(userId, {
      type: 'system',
      title: 'Booking Rescheduled',
      message: `Your counseling session has been rescheduled to ${new Date(newDate).toLocaleDateString()} at ${newTime}`,
      icon: '📅',
      priority: 'high',
      relatedId: booking._id,
      relatedType: 'booking'
    });

    res.status(200).json({
      success: true,
      message: 'Booking rescheduled successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Reschedule Booking Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule booking',
      error: error.message
    });
  }
};

// @desc    Update payment status
// @route   POST /api/counseling/:bookingId/payment
// @access  Private
export const updatePaymentStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookingId } = req.params;
    const { paymentId, paymentMethod, paymentStatus } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.isFree) {
      return res.status(400).json({
        success: false,
        message: 'This is a free booking, no payment required'
      });
    }

    booking.paymentId = paymentId;
    booking.paymentMethod = paymentMethod;
    booking.paymentStatus = paymentStatus || 'paid';
    booking.paidAt = Date.now();
    
    if (paymentStatus === 'paid') {
      booking.status = 'confirmed';
    }

    await booking.save();

    // Send notification
    await sendNotification(userId, {
      type: 'system',
      title: 'Payment Confirmed',
      message: `Payment of ₹${booking.amount} received. Your counseling session is confirmed for ${booking.bookingDate.toLocaleDateString()}`,
      icon: '✅',
      priority: 'high',
      relatedId: booking._id,
      relatedType: 'booking'
    });

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Update Payment Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

// @desc    Submit feedback for completed booking
// @route   POST /api/counseling/:bookingId/feedback
// @access  Private
export const submitFeedback = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookingId } = req.params;
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Valid rating (1-5) is required'
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted for completed sessions'
      });
    }

    booking.userRating = rating;
    booking.userFeedback = feedback || '';
    booking.feedbackSubmittedAt = Date.now();

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Submit Feedback Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
};
