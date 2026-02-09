import express from 'express';
import { 
  sendPhoneOTP, 
  verifyPhoneOTP, 
  logout, 
  getCurrentUser 
} from '../controller/auth.controller.js';
import { protectedRoutes } from '../middleware/protectedRoutes.js';
import { validateSendOTP, validateVerifyOTP } from '../middleware/validators.js';
import { otpLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// ========================================
// Authentication Routes
// ========================================
router.post('/send-otp', otpLimiter, validateSendOTP, sendPhoneOTP);         // Send OTP (auto signup/login)
router.post('/verify-otp', otpLimiter, validateVerifyOTP, verifyPhoneOTP);     // Verify OTP (auto signup/login)
router.post('/logout', protectedRoutes, logout); // Logout

// ========================================
// User Routes
// ========================================
router.get('/me', protectedRoutes, getCurrentUser); // Get current user

// ========================================
// Health Check
// ========================================
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;




