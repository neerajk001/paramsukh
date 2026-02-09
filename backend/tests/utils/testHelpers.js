import jwt from 'jsonwebtoken';

// Mock user data
export const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  phone: '+919876543210',
  displayName: 'Test User',
  email: 'test@example.com',
  photoURL: 'https://example.com/photo.jpg',
  authProvider: 'phone',
  subscriptionPlan: 'free',
  subscriptionStatus: 'trial',
  trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  isActive: true,
  lastLoginAt: new Date(),
  loginCount: 1,
  phoneOTPAttempts: 0,
  phoneOTPLastAttempt: null
};

export const mockExistingUser = {
  _id: '507f1f77bcf86cd799439012',
  phone: '+919876543211',
  displayName: 'Existing User',
  email: 'existing@example.com',
  photoURL: 'https://example.com/photo2.jpg',
  authProvider: 'phone',
  subscriptionPlan: 'silver',
  subscriptionStatus: 'active',
  isActive: true,
  lastLoginAt: new Date(),
  loginCount: 5,
  phoneOTPAttempts: 0,
  phoneOTPLastAttempt: null
};

// Generate mock JWT token
export const generateMockToken = (userId = mockUser._id) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret-key', { expiresIn: '15d' });
};

// Generate expired token
export const generateExpiredToken = (userId = mockUser._id) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret-key', { expiresIn: '-1h' });
};

// Generate invalid token
export const generateInvalidToken = () => {
  return 'invalid.token.signature';
};

// Mock successful OTP response
export const mockSuccessOTP = {
  success: true,
  status: 'pending',
  to: '+919876543210'
};

// Mock successful verification response
export const mockSuccessVerification = {
  success: true,
  status: 'approved',
  valid: true
};

// Mock failed verification response
export const mockFailedVerification = {
  success: false,
  status: 'rejected',
  valid: false
};

// Database error mock
export const mockDatabaseError = new Error('Database connection failed');
mockDatabaseError.name = 'MongoError';
mockDatabaseError.code = 11000; // Duplicate key error

// Twilio error mocks
export const mockTwilioRateLimitError = new Error('Max send attempts reached');
mockTwilioRateLimitError.code = 60202;

export const mockTwilioAuthError = new Error('Twilio authentication failed');
mockTwilioAuthError.code = 20003;

export const mockTwilioInvalidPhoneError = new Error('Invalid phone number format');
mockTwilioInvalidPhoneError.code = 60200;

export const mockTwilioInvalidOTPError = new Error('Invalid OTP code');
mockTwilioInvalidOTPError.code = 60212;

// Helper to create mock model instance
export const createMockModelInstance = (data) => ({
  _id: data._id || '507f1f77bcf86cd799439011',
  ...data,
  save: jest.fn().mockResolvedValue({ ...data, _id: data._id || '507f1f77bcf86cd799439011' }),
  updateLastLogin: jest.fn().mockResolvedValue({
    ...data,
    lastLoginAt: new Date(),
    loginCount: (data.loginCount || 0) + 1
  }),
  canRequestOTP: jest.fn().mockReturnValue(true),
  exec: jest.fn().mockResolvedValue({ ...data })
});

// Helper to reset all mock implementations
export const resetAllMocks = () => {
  jest.clearAllMocks();
};
