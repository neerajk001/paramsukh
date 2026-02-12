import { User } from "../../models/user.models.js";

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
    const user = req.user;

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

export const refreshToken = (req, res) => {
  res.json({ success: false, message: 'Not implemented' });
};
