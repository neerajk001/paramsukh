/**
 * Admin middleware - Simple API key authentication for admin panel
 * In production, use proper admin authentication with roles
 */
export const adminAuth = async (req, res, next) => {
  try {
    // Check for admin API key in header
    const apiKey = req.headers['x-admin-api-key'];
    const adminApiKey = process.env.ADMIN_API_KEY || 'dev-admin-key-123';

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Admin API key required. Include X-Admin-API-Key header.'
      });
    }

    if (apiKey !== adminApiKey) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin API key'
      });
    }

    // Admin authenticated
    next();
  } catch (error) {
    console.error('❌ Admin auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Admin authentication failed',
      error: error.message
    });
  }
};
