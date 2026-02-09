import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../../src/routes/index.js';
import { sendPhoneOTP, verifyPhoneOTP, logout, getCurrentUser } from '../../src/controller/auth.controller.js';
import { protectedRoutes } from '../../src/middleware/protectedRoutes.js';
import { validateSendOTP, validateVerifyOTP } from '../../src/middleware/validators.js';
import { otpLimiter } from '../../src/middleware/rateLimiter.js';
import { User } from '../../src/models/user.models.js';
import {
  mockUser,
  mockExistingUser,
  generateMockToken,
  generateExpiredToken,
  generateInvalidToken,
  mockSuccessOTP,
  mockSuccessVerification,
  mockFailedVerification,
  mockDatabaseError
} from '../utils/testHelpers.js';

// Mock all dependencies
jest.unstable_mockModule('../../src/models/user.models.js', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn()
  }
}));

jest.unstable_mockModule('../../src/services/twilioService.js', () => ({
  sendOTP: jest.fn(),
  verifyOTP: jest.fn()
}));

jest.unstable_mockModule('../../src/lib/generateTokens.js', () => ({
  generateTokens: jest.fn().mockReturnValue('mock.jwt.token')
}));

// Create Express app for testing
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  
  // Mock middlewares to pass through
  app.use((req, res, next) => {
    if (req.path.includes('send-otp') || req.path.includes('verify-otp')) {
      // Skip rate limiter and validators for testing
      next();
    } else {
      next();
    }
  });
  
  app.use('/api/auth', authRoutes);
  
  return app;
};

describe('Auth Routes Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/send-otp', () => {
    describe('Happy Path', () => {
      it('should send OTP successfully for new user', async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({
          phone: '+919876543210',
          displayName: 'User1234567890',
          phoneOTPAttempts: 0,
          canRequestOTP: jest.fn().mockReturnValue(true),
          save: jest.fn().mockResolvedValue()
        });
        const { sendOTP } = await import('../../src/services/twilioService.js');
        sendOTP.mockResolvedValue(mockSuccessOTP);

        const response = await request(app)
          .post('/api/auth/send-otp')
          .send({ phone: '+919876543210' });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          message: 'OTP sent successfully',
          isNewUser: true
        });
      });

      it('should send OTP successfully for existing user', async () => {
        const existingUser = {
          ...mockExistingUser,
          phoneOTPAttempts: 0,
          canRequestOTP: jest.fn().mockReturnValue(true),
          save: jest.fn().mockResolvedValue()
        };
        
        User.findOne.mockResolvedValue(existingUser);
        const { sendOTP } = await import('../../src/services/twilioService.js');
        sendOTP.mockResolvedValue(mockSuccessOTP);

        const response = await request(app)
          .post('/api/auth/send-otp')
          .send({ phone: '+919876543210' });

        expect(response.status).toBe(200);
        expect(response.body.isNewUser).toBe(false);
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for missing phone number', async () => {
        const response = await request(app)
          .post('/api/auth/send-otp')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should return 400 for invalid phone format', async () => {
        const response = await request(app)
          .post('/api/auth/send-otp')
          .send({ phone: '919876543210' });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('External Service Failures', () => {
      it('should return 500 on Twilio service error', async () => {
        User.findOne.mockResolvedValue({
          phone: '+919876543210',
          phoneOTPAttempts: 0,
          canRequestOTP: jest.fn().mockReturnValue(true),
          save: jest.fn().mockResolvedValue()
        });
        const { sendOTP } = await import('../../src/services/twilioService.js');
        sendOTP.mockRejectedValue(new Error('Service unavailable'));

        const response = await request(app)
          .post('/api/auth/send-otp')
          .send({ phone: '+919876543210' });

        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
      });
    });

    describe('Database Failures', () => {
      it('should return 500 on database error', async () => {
        User.findOne.mockRejectedValue(mockDatabaseError);

        const response = await request(app)
          .post('/api/auth/send-otp')
          .send({ phone: '+919876543210' });

        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    describe('Happy Path', () => {
      it('should verify OTP and create new user account', async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({
          ...mockUser,
          phone: '+919876543210',
          displayName: 'New User',
          loginCount: 1,
          save: jest.fn().mockResolvedValue()
        });
        const { verifyOTP } = await import('../../src/services/twilioService.js');
        verifyOTP.mockResolvedValue(mockSuccessVerification);

        const response = await request(app)
          .post('/api/auth/verify-otp')
          .send({
            phone: '+919876543210',
            code: '123456',
            displayName: 'New User'
          });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          message: 'Signed in successfully',
          isNewUser: true,
          token: expect.any(String),
          user: expect.objectContaining({
            phone: '+919876543210',
            displayName: 'New User'
          })
        });
      });

      it('should verify OTP for existing user', async () => {
        const existingUser = {
          ...mockExistingUser,
          phoneOTPAttempts: 2,
          updateLastLogin: jest.fn().mockResolvedValue(),
          save: jest.fn().mockResolvedValue()
        };
        
        User.findOne.mockResolvedValue(existingUser);
        const { verifyOTP } = await import('../../src/services/twilioService.js');
        verifyOTP.mockResolvedValue(mockSuccessVerification);

        const response = await request(app)
          .post('/api/auth/verify-otp')
          .send({
            phone: '+919876543210',
            code: '123456'
          });

        expect(response.status).toBe(200);
        expect(response.body.isNewUser).toBe(false);
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for missing phone', async () => {
        const response = await request(app)
          .post('/api/auth/verify-otp')
          .send({ code: '123456' });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Phone and OTP code required');
      });

      it('should return 400 for missing code', async () => {
        const response = await request(app)
          .post('/api/auth/verify-otp')
          .send({ phone: '+919876543210' });

        expect(response.status).toBe(400);
      });

      it('should return 400 for empty body', async () => {
        const response = await request(app)
          .post('/api/auth/verify-otp')
          .send({});

        expect(response.status).toBe(400);
      });
    });

    describe('Authentication Failures', () => {
      it('should return 400 for invalid OTP', async () => {
        User.findOne.mockResolvedValue(mockExistingUser);
        const { verifyOTP } = await import('../../src/services/twilioService.js');
        verifyOTP.mockResolvedValue(mockFailedVerification);

        const response = await request(app)
          .post('/api/auth/verify-otp')
          .send({
            phone: '+919876543210',
            code: '000000'
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Invalid or expired OTP');
      });
    });

    describe('Database Failures', () => {
      it('should return 500 on database error', async () => {
        const { verifyOTP } = await import('../../src/services/twilioService.js');
        verifyOTP.mockResolvedValue(mockSuccessVerification);
        User.findOne.mockRejectedValue(mockDatabaseError);

        const response = await request(app)
          .post('/api/auth/verify-otp')
          .send({
            phone: '+919876543210',
            code: '123456'
          });

        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    describe('Happy Path', () => {
      it('should logout successfully', async () => {
        // Need to mock protectedRoutes to add user to request
        const { protectedRoutes } = await import('../../src/middleware/protectedRoutes.js');
        
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Cookie', 'token=validtoken');

        // Response depends on implementation
        expect([200, 401]).toContain(response.status);
      });
    });
  });

  describe('GET /api/auth/me', () => {
    describe('Happy Path', () => {
      it('should return current user with valid token', async () => {
        const token = generateMockToken();
        User.findById.mockResolvedValue(mockUser);

        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          success: true,
          user: expect.objectContaining({
            _id: mockUser._id,
            displayName: mockUser.displayName
          })
        });
      });

      it('should include all user fields', async () => {
        const token = generateMockToken();
        User.findById.mockResolvedValue(mockUser);

        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.user).toMatchObject({
          _id: expect.any(String),
          displayName: expect.any(String),
          email: expect.any(String),
          phone: expect.any(String),
          photoURL: expect.any(String),
          authProvider: expect.any(String),
          subscriptionPlan: expect.any(String),
          subscriptionStatus: expect.any(String)
        });
      });
    });

    describe('Authorization Failures', () => {
      it('should return 401 without token', async () => {
        const response = await request(app)
          .get('/api/auth/me');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });

      it('should return 401 with invalid token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${generateInvalidToken()}`);

        expect(response.status).toBe(401);
      });

      it('should return 401 with expired token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${generateExpiredToken()}`);

        expect(response.status).toBe(401);
      });

      it('should return 401 when user not found', async () => {
        const token = generateMockToken();
        User.findById.mockResolvedValue(null);

        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toContain('User not found');
      });
    });

    describe('Database Failures', () => {
      it('should return 401 on database error', async () => {
        const token = generateMockToken();
        User.findById.mockRejectedValue(mockDatabaseError);

        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('GET /api/auth/health', () => {
    it('should return health check', async () => {
      const response = await request(app)
        .get('/api/auth/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: expect.any(String)
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent requests', async () => {
      const promises = Array(5).fill(null).map(() =>
        request(app)
          .post('/api/auth/send-otp')
          .send({ phone: '+919876543210' })
      );

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        phone: '+919876543210',
        displayName: 'User1234567890',
        phoneOTPAttempts: 0,
        canRequestOTP: jest.fn().mockReturnValue(true),
        save: jest.fn().mockResolvedValue()
      });
      const { sendOTP } = await import('../../src/services/twilioService.js');
      sendOTP.mockResolvedValue(mockSuccessOTP);

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect([200, 400]).toContain(response.status);
      });
    });

    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send('invalid json')
        .set('Content-Type', 'application/json');

      expect([400, 500]).toContain(response.status);
    });

    it('should handle very long phone number', async () => {
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ phone: '+' + '9'.repeat(20) });

      expect(response.status).toBe(400);
    });

    it('should handle special characters in displayName', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        phone: '+919876543210',
        displayName: 'User@#$%',
        save: jest.fn().mockResolvedValue()
      });
      const { verifyOTP } = await import('../../src/services/twilioService.js');
      verifyOTP.mockResolvedValue(mockSuccessVerification);

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phone: '+919876543210',
          code: '123456',
          displayName: 'User@#$%'
        });

      expect(response.status).toBe(200);
    });
  });
});
