import { User } from "../models/user.models.js";
import { sendOTP, verifyOTP } from "../services/twilioService.js";
import { generateTokens } from "../lib/generateTokens.js";

/**
 * Send OTP (Works for new and existing users)
 * POST /api/auth/send-otp
 */
export const sendPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone format
    if (!phone || !/^\+[1-9]\d{1,14}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Valid phone number required (e.g., +919876543210)"
      });
    }

    // Check if user exists
    let user = await User.findOne({ phone });
    let isNewUser = !user;

    // Create temporary user for rate limiting if new
    if (!user) {
      user = new User({
        phone,
        displayName: `User${Date.now()}`, // Temporary name
        authProvider: 'phone',
        phoneOTPAttempts: 0
      });
    }

    // Check rate limiting
    if (!user.canRequestOTP()) {
      return res.status(429).json({
        success: false,
        message: "Too many OTP requests. Try again in 15 minutes."
      });
    }

    // Send OTP via Twilio
    const result = await sendOTP(phone);

    // Update attempts
    user.phoneOTPAttempts += 1;
    user.phoneOTPLastAttempt = new Date();
    await user.save();

    console.log(`📱 OTP sent to ${phone} (${isNewUser ? 'New' : 'Existing'} user)`);

    return res.json({
      success: true,
      message: "OTP sent successfully",
      isNewUser
    });

  } catch (error) {
    console.error("❌ Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP"
    });
  }
};

/**
 * Verify OTP (Auto creates account if new user)
 * POST /api/auth/verify-otp
 */
export const verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp, displayName } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP code required"
      });
    }

    // Verify OTP with Twilio
    const verification = await verifyOTP(phone, otp);

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Find or create user
    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (!user) {
      // Create new user
      user = new User({
        phone,
        displayName: displayName || `User${Date.now()}`,
        authProvider: 'phone',
        loginCount: 1
      });
      isNewUser = true;
      console.log("✅ New user created via Phone:", phone);
    } else if (displayName && user.displayName.startsWith('User')) {
      // Update name if it was auto-generated
      user.displayName = displayName;
    }

    // Reset OTP attempts and update login
    user.phoneOTPAttempts = 0;
    user.phoneOTPLastAttempt = null;

    if (!isNewUser) {
      await user.updateLastLogin();
      console.log("✅ User logged in via Phone:", phone);
    }

    await user.save();

    // Generate JWT (returns token for API clients like Postman)
    const token = generateTokens(user._id, res);

    return res.json({
      success: true,
      message: "Signed in successfully",
      isNewUser,
      token, // Include token in response for Postman/API clients
      user: {
        _id: user._id,
        phone: user.phone,
        displayName: user.displayName,
        photoURL: user.photoURL,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        authProvider: user.authProvider
      }
    });

  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify OTP"
    });
  }
};

/**
 * Logout
 * POST /api/auth/logout
 */
export const logout = (req, res) => {
  try {
    res.clearCookie('token');
    return res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user; // From protectedRoutes middleware

    return res.json({
      success: true,
      user: {
        _id: user._id,
        displayName: user.displayName,
        email: user.email || null,
        phone: user.phone || null,
        photoURL: user.photoURL,
        authProvider: user.authProvider,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        trialEndsAt: user.trialEndsAt,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
