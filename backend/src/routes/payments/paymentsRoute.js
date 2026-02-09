import express from 'express';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';
import { paymentLimiter } from '../../middleware/rateLimiter.js';
import { validateCreateOrder, validateVerifyPayment } from '../../middleware/validators.js';
import {
  createMembershipOrder,
  verifyMembershipPayment,
  createBookingOrder,
  handleWebhook,
  getPaymentHistory
} from '../../controller/payments/payments.controller.js';

const router = express.Router();

// ========================================
// Payment Order Creation Routes
// ========================================

// Create payment order for membership
// POST /api/payments/create-order
router.post('/create-order', protectedRoutes, createMembershipOrder);

// Create payment order for booking/counseling
// POST /api/payments/create-booking-order
router.post('/create-booking-order', protectedRoutes, createBookingOrder);

// ========================================
// Payment Verification Routes
// ========================================

// Verify membership payment and activate
// POST /api/payments/verify-membership
router.post('/verify-membership', protectedRoutes, verifyMembershipPayment);

// ========================================
// Payment History
// ========================================

// Get user's payment history
// GET /api/payments/history
router.get('/history', protectedRoutes, getPaymentHistory);

// ========================================
// Webhook (No Auth)
// ========================================

// Razorpay webhook endpoint
// POST /api/payments/webhook
router.post('/webhook', handleWebhook);

export default router;
