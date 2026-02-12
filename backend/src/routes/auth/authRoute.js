import express from 'express';
import { sendOTPController, verifyOTPController } from '../../controller/auth/authOTP.controller.js';
import { logout, getCurrentUser } from '../../controller/auth/authController.js';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';
import { otpLimiter } from '../../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/auth/send-otp
 * Send OTP to phone number (rate limited: 3 per 10 minutes)
 */
router.post('/send-otp', otpLimiter, sendOTPController);

/**
 * POST /api/auth/verify-otp
 * Verify OTP and sign in/sign up (rate limited: 3 per 10 minutes)
 */
router.post('/verify-otp', otpLimiter, verifyOTPController);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', protectedRoutes, logout);

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', protectedRoutes, getCurrentUser);

export default router;
