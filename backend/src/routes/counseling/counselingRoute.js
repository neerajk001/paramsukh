import express from 'express';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';
import { adminAuth } from '../../middleware/adminAuth.js';
import {
  getAvailability,
  bookCounseling,
  getMyBookings,
  getBookingDetails,
  cancelBooking,
  rescheduleBooking,
  updatePaymentStatus,
  submitFeedback
} from '../../controller/counseling/counseling.controller.js';
import {
  getAllBookings,
  getBookingDetailsAdmin,
  updateBookingStatusAdmin,
  deleteBookingAdmin
} from '../../controller/counseling/admin.counseling.controller.js';

const router = express.Router();

// Admin routes
router.get('/all', adminAuth, getAllBookings);
router.get('/admin/:id', adminAuth, getBookingDetailsAdmin);
router.patch('/admin/:id/status', adminAuth, updateBookingStatusAdmin);
router.delete('/admin/:id', adminAuth, deleteBookingAdmin);

// All other routes are protected (require authentication)
router.use(protectedRoutes);

// ========================================
// Counseling/Booking Routes
// ========================================

// Get available time slots
router.get('/availability', getAvailability);

// Book a counseling session
router.post('/book', bookCounseling);

// Get user's bookings
router.get('/my-bookings', getMyBookings);

// Get booking details
router.get('/:bookingId', getBookingDetails);

// Cancel a booking
router.patch('/:bookingId/cancel', cancelBooking);

// Reschedule a booking
router.patch('/:bookingId/reschedule', rescheduleBooking);

// Update payment status
router.post('/:bookingId/payment', updatePaymentStatus);

// Submit feedback for completed session
router.post('/:bookingId/feedback', submitFeedback);

export default router;
