import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import app from '../setup/app.js';
import { sendPhoneOTP, verifyPhoneOTP, logout, getCurrentUser } from '../../src/controller/auth.controller.js';
import { User } from '../../src/models/user.models.js';
import { sendOTP, verifyOTP } from '../../src/services/twilioService.js';
import {
  mockUser,
  mockExistingUser,
  generateMockToken,
  generateExpiredToken,
  generateInvalidToken,
  mockSuccessOTP,
  mockSuccessVerification,
  mockFailedVerification,
  mockDatabaseError,
  mockTwilioRateLimitError,
  mockTwilioAuthError,
  createMockModelInstance
} from '../utils/testHelpers.js';

// Mock the models and services
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

describe('Auth Controller Tests', () => {
  describe('POST /api/auth/send-otp - Send Phone OTP', () => {
    let req, res, next;

    beforeEach(() => {
      req = { body: {} };
      res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis()
      };
      next = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('Happy Path - Success Scenarios', () => {
      it('should send OTP for new user successfully', async () => {
        req.body = { phone: '+919876543210' };
        
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({
          phone: '+919876543210',
          displayName: 'User1234567890',
          authProvider: 'phone',
          phoneOTPAttempts: 0,
          canRequestOTP: jest.fn().mockReturnValue(true),
          save: jest.fn().mockResolvedValue()
        });
        sendOTP.mockResolvedValue(mockSuccessOTP);

        await sendPhoneOTP(req, res);

        expect(sendOTP).toHaveBeenCalledWith('+919876543210');
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            message: 'OTP sent successfully',
            isNewUser: true
          })
        );
      });

      it('should send OTP for existing user successfully', async () => {
        req.body = { phone: '+919876543210' };
        
        const existingUser = {
          ...mockExistingUser,
          phoneOTPAttempts: 0,
          phoneOTPLastAttempt: null,
          canRequestOTP: jest.fn().mockReturnValue(true),
          save: jest.fn().mockResolvedValue()
        };
        
        User.findOne.mockResolvedValue(existingUser);
        sendOTP.mockResolvedValue(mockSuccessOTP);

        await sendPhoneOTP(req, res);

        expect(sendOTP).toHaveBeenCalledWith('+919876543210');
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            message: 'OTP sent successfully',
            isNewUser: false
          })
        );
      });

      it('should handle phone number with country code correctly', async () => {
        req.body = { phone: '+1234567890' };
        
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({
          phone: '+1234567890',
          displayName: 'User1234567890',
          authProvider: 'phone',
          phoneOTPAttempts: 0,
          canRequestOTP: jest.fn().mockReturnValue(true),
          save: jest.fn().mockResolvedValue()
        });
        sendOTP.mockResolvedValue(mockSuccessOTP);

        await sendPhoneOTP(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true
          })
        );
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for missing phone number', async () => {
        req.body = {};

        await sendPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: expect.stringContaining('Valid phone number required')
          })
        );
      });

      it('should return 400 for invalid phone format - no plus sign', async () => {
        req.body = { phone: '919876543210' };

        await sendPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: expect.stringContaining('Valid phone number required')
          })
        );
      });

      it('should return 400 for invalid phone format - wrong country code', async () => {
        req.body = { phone: '00919876543210' };

        await sendPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should return 400 for phone with letters', async () => {
        req.body = { phone: '+91abcd12345' };

        await sendPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should return 400 for empty phone string', async () => {
        req.body = { phone: '' };

        await sendPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should return 400 for phone that is too short', async () => {
        req.body = { phone: '+123' };

        await sendPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should return 400 for phone that is too long', async () => {
        req.body = { phone: '+12345678901234567890' };

        await sendPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });
    });

    describe('Rate Limiting', () => {
      it('should return 429 when rate limit exceeded', async () => {
        req.body = { phone: '+919876543210' };
        
        const rateLimitedUser = {
          phone: '+919876543210',
          phoneOTPAttempts: 5,
          phoneOTPLastAttempt: new Date(),
          canRequestOTP: jest.fn().mockReturnValue(false)
        };
        
        User.findOne.mockResolvedValue(rateLimitedUser);

        await sendPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: expect.stringContaining('Too many OTP requests')
          })
        );
      });

      it('should reset rate limit after 15 minutes', async () => {
        req.body = { phone: '+919876543210' };
        
        const userWithOldAttempts = {
          phone: '+919876543210',
          phoneOTPAttempts: 5,
          phoneOTPLastAttempt: new Date(Date.now() - 16 * 60 * 1000),
          canRequestOTP: jest.fn().mockReturnValue(true),
          save: jest.fn().mockResolvedValue()
        };
        
        User.findOne.mockResolvedValue(userWithOldAttempts);
        sendOTP.mockResolvedValue(mockSuccessOTP);

        await sendPhoneOTP(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true
          })
        );
      });
    });

    describe('External Service Failures', () => {
      it('should return 500 on Twilio authentication failure', async () => {
        req.body = { phone: '+919876543210' };
        
        const user = {
          phone: '+919876543210',
          phoneOTPAttempts: 0,
          canRequestOTP: jest.fn().mockReturnValue(true),
          save: jest.fn().mockResolvedValue()
        };
        
        User.findOne.mockResolvedValue(user);
        User.create.mockResolvedValue(user);
        sendOTP.mockRejectedValue(mockTwilioAuthError);

        await sendPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: expect.stringContaining('authentication')
          })
        );
      });

      it('should return 500 on Twilio rate limit error', async () => {
        req.body = { phone: '+919876543210' };
        
        const user = {
          phone: '+919876543210',
          phoneOTPAttempts: 0,
          canRequestOTP: jest.fn().mockReturnValue(true),
          save: jest.fn().mockResolvedValue()
        };
        
        User.findOne.mockResolvedValue(user);
        User.create.mockResolvedValue(user);
        sendOTP.mockRejectedValue(mockTwilioRateLimitError);

        await sendPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should return 500 on Twilio network error', async () => {
        req.body = { phone: '+919876543210' };
        
        const user = {
          phone: '+919876543210',
          phoneOTPAttempts: 0,
          canRequestOTP: jest.fn().mockReturnValue(true),
          save: jest.fn().mockResolvedValue()
        };
        
        User.findOne.mockResolvedValue(user);
        User.create.mockResolvedValue(user);
        sendOTP.mockRejectedValue(new Error('Network timeout'));

        await sendPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('Database Failure Scenarios', () => {
      it('should return 500 when User.findOne fails', async () => {
        req.body = { phone: '+919876543210' };
        
        User.findOne.mockRejectedValue(mockDatabaseError);

        await sendPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false
          })
        );
      });

      it('should return 500 when User.create fails', async () => {
        req.body = { phone: '+919876543210' };
        
        User.findOne.mockResolvedValue(null);
        User.create.mockRejectedValue(mockDatabaseError);

        await sendPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should return 500 when user.save fails', async () => {
        req.body = { phone: '+919876543210' };
        
        const user = {
          phone: '+919876543210',
          phoneOTPAttempts: 0,
          canRequestOTP: jest.fn().mockReturnValue(true),
          save: jest.fn().mockRejectedValue(mockDatabaseError)
        };
        
        User.findOne.mockResolvedValue(user);
        User.create.mockResolvedValue(user);
        sendOTP.mockResolvedValue(mockSuccessOTP);

        await sendPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should return 500 on duplicate key error', async () => {
        req.body = { phone: '+919876543210' };
        
        const duplicateError = new Error('Duplicate key error');
        duplicateError.code = 11000;
        
        User.findOne.mockResolvedValue(null);
        User.create.mockRejectedValue(duplicateError);

        await sendPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should return 500 on connection timeout', async () => {
        req.body = { phone: '+919876543210' };
        
        User.findOne.mockRejectedValue(new Error('Connection timeout'));

        await sendPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('Edge Cases', () => {
      it('should handle very long display name generation', async () => {
        req.body = { phone: '+919876543210' };
        
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({
          phone: '+919876543210',
          displayName: `User${Date.now()}`,
          authProvider: 'phone',
          phoneOTPAttempts: 0,
          canRequestOTP: jest.fn().mockReturnValue(true),
          save: jest.fn().mockResolvedValue()
        });
        sendOTP.mockResolvedValue(mockSuccessOTP);

        await sendPhoneOTP(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true
          })
        );
      });

      it('should handle concurrent OTP requests', async () => {
        const phone = '+919876543210';
        
        const user = {
          phone,
          phoneOTPAttempts: 2,
          canRequestOTP: jest.fn().mockReturnValue(true),
          save: jest.fn().mockResolvedValue()
        };
        
        User.findOne.mockResolvedValue(user);
        sendOTP.mockResolvedValue(mockSuccessOTP);

        // Simulate concurrent requests
        const requests = [
          sendPhoneOTP({ body: { phone } }, res),
          sendPhoneOTP({ body: { phone } }, res),
          sendPhoneOTP({ body: { phone } }, res)
        ];

        await Promise.all(requests);

        expect(sendOTP).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('POST /api/auth/verify-otp - Verify Phone OTP', () => {
    let req, res;

    beforeEach(() => {
      req = { body: {} };
      res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        clearCookie: jest.fn(),
        cookie: jest.fn()
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('Happy Path - Success Scenarios', () => {
      it('should verify OTP for new user and create account', async () => {
        req.body = { 
          phone: '+919876543210', 
          code: '123456',
          displayName: 'New User'
        };
        
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({
          ...mockUser,
          phone: '+919876543210',
          displayName: 'New User',
          loginCount: 1,
          save: jest.fn().mockResolvedValue()
        });
        verifyOTP.mockResolvedValue(mockSuccessVerification);

        await verifyPhoneOTP(req, res);

        expect(verifyOTP).toHaveBeenCalledWith('+919876543210', '123456');
        expect(User.create).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            message: 'Signed in successfully',
            isNewUser: true,
            token: expect.any(String),
            user: expect.objectContaining({
              phone: '+919876543210',
              displayName: 'New User'
            })
          })
        );
      });

      it('should verify OTP for existing user', async () => {
        req.body = { phone: '+919876543210', code: '123456' };
        
        const existingUser = {
          ...mockExistingUser,
          phoneOTPAttempts: 2,
          phoneOTPLastAttempt: new Date(),
          updateLastLogin: jest.fn().mockResolvedValue(),
          save: jest.fn().mockResolvedValue()
        };
        
        User.findOne.mockResolvedValue(existingUser);
        verifyOTP.mockResolvedValue(mockSuccessVerification);

        await verifyPhoneOTP(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            message: 'Signed in successfully',
            isNewUser: false
          })
        );
      });

      it('should update auto-generated display name if provided', async () => {
        req.body = { 
          phone: '+919876543210', 
          code: '123456',
          displayName: 'Custom Name'
        };
        
        const existingUser = {
          ...mockExistingUser,
          displayName: 'User1234567890',
          phoneOTPAttempts: 0,
          save: jest.fn().mockResolvedValue()
        };
        
        User.findOne.mockResolvedValue(existingUser);
        verifyOTP.mockResolvedValue(mockSuccessVerification);

        await verifyPhoneOTP(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            user: expect.objectContaining({
              displayName: 'Custom Name'
            })
          })
        );
      });

      it('should reset OTP attempts after successful verification', async () => {
        req.body = { phone: '+919876543210', code: '123456' };
        
        const userWithAttempts = {
          ...mockExistingUser,
          phoneOTPAttempts: 5,
          phoneOTPLastAttempt: new Date(),
          save: jest.fn().mockResolvedValue()
        };
        
        User.findOne.mockResolvedValue(userWithAttempts);
        verifyOTP.mockResolvedValue(mockSuccessVerification);

        await verifyPhoneOTP(req, res);

        const savedUser = userWithAttempts.save.mock.calls[0]?.[0] || userWithAttempts;
        expect(savedUser.phoneOTPAttempts).toBe(0);
        expect(savedUser.phoneOTPLastAttempt).toBeNull();
      });

      it('should increment login count for returning users', async () => {
        req.body = { phone: '+919876543210', code: '123456' };
        
        const existingUser = {
          ...mockExistingUser,
          loginCount: 5,
          updateLastLogin: jest.fn().mockResolvedValue(),
          save: jest.fn().mockResolvedValue()
        };
        
        User.findOne.mockResolvedValue(existingUser);
        verifyOTP.mockResolvedValue(mockSuccessVerification);

        await verifyPhoneOTP(req, res);

        expect(existingUser.updateLastLogin).toHaveBeenCalled();
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for missing phone number', async () => {
        req.body = { code: '123456' };

        await verifyPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'Phone and OTP code required'
          })
        );
      });

      it('should return 400 for missing OTP code', async () => {
        req.body = { phone: '+919876543210' };

        await verifyPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'Phone and OTP code required'
          })
        );
      });

      it('should return 400 for empty request body', async () => {
        req.body = {};

        await verifyPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should return 400 for null values', async () => {
        req.body = { phone: null, code: null };

        await verifyPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });
    });

    describe('Authentication Failures', () => {
      it('should return 400 for invalid OTP code', async () => {
        req.body = { phone: '+919876543210', code: '000000' };
        
        User.findOne.mockResolvedValue(mockExistingUser);
        verifyOTP.mockResolvedValue(mockFailedVerification);

        await verifyPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'Invalid or expired OTP'
          })
        );
      });

      it('should return 400 for expired OTP', async () => {
        req.body = { phone: '+919876543210', code: '123456' };
        
        User.findOne.mockResolvedValue(mockExistingUser);
        verifyOTP.mockResolvedValue({
          success: false,
          status: 'expired',
          valid: false
        });

        await verifyPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should return 400 for OTP with wrong format', async () => {
        req.body = { phone: '+919876543210', code: 'abc123' };
        
        User.findOne.mockResolvedValue(mockExistingUser);
        verifyOTP.mockRejectedValue(new Error('Invalid OTP format'));

        await verifyPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should return 400 for OTP code with special characters', async () => {
        req.body = { phone: '+919876543210', code: '12@45#' };
        
        User.findOne.mockResolvedValue(mockExistingUser);
        verifyOTP.mockRejectedValue(new Error('Invalid characters'));

        await verifyPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('Database Failure Scenarios', () => {
      it('should return 500 when User.findOne fails', async () => {
        req.body = { phone: '+919876543210', code: '123456' };
        
        verifyOTP.mockResolvedValue(mockSuccessVerification);
        User.findOne.mockRejectedValue(mockDatabaseError);

        await verifyPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should return 500 when User.create fails', async () => {
        req.body = { phone: '+919876543210', code: '123456', displayName: 'Test' };
        
        verifyOTP.mockResolvedValue(mockSuccessVerification);
        User.findOne.mockResolvedValue(null);
        User.create.mockRejectedValue(mockDatabaseError);

        await verifyPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should return 500 when user.save fails after verification', async () => {
        req.body = { phone: '+919876543210', code: '123456' };
        
        const userWithSaveError = {
          ...mockExistingUser,
          save: jest.fn().mockRejectedValue(mockDatabaseError)
        };
        
        verifyOTP.mockResolvedValue(mockSuccessVerification);
        User.findOne.mockResolvedValue(userWithSaveError);

        await verifyPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should return 500 when updateLastLogin fails', async () => {
        req.body = { phone: '+919876543210', code: '123456' };
        
        const userWithLoginError = {
          ...mockExistingUser,
          save: jest.fn().mockResolvedValue(),
          updateLastLogin: jest.fn().mockRejectedValue(new Error('Login update failed'))
        };
        
        verifyOTP.mockResolvedValue(mockSuccessVerification);
        User.findOne.mockResolvedValue(userWithLoginError);

        await verifyPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should return 500 on MongoDB connection error', async () => {
        req.body = { phone: '+919876543210', code: '123456' };
        
        verifyOTP.mockResolvedValue(mockSuccessVerification);
        User.findOne.mockRejectedValue(new Error('MongoDB connection failed'));

        await verifyPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('External Service Failures', () => {
      it('should return 500 when Twilio service is unavailable', async () => {
        req.body = { phone: '+919876543210', code: '123456' };
        
        verifyOTP.mockRejectedValue(new Error('Service unavailable'));
        User.findOne.mockResolvedValue(mockExistingUser);

        await verifyPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should return 500 on Twilio timeout', async () => {
        req.body = { phone: '+919876543210', code: '123456' };
        
        verifyOTP.mockRejectedValue(new Error('Request timeout'));
        User.findOne.mockResolvedValue(mockExistingUser);

        await verifyPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should return 500 on Twilio API error', async () => {
        req.body = { phone: '+919876543210', code: '123456' };
        
        verifyOTP.mockRejectedValue(new Error('API Error: 500'));
        User.findOne.mockResolvedValue(mockExistingUser);

        await verifyPhoneOTP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('Edge Cases', () => {
      it('should handle OTP verification with auto-generated display name', async () => {
        req.body = { phone: '+919876543210', code: '123456' };
        
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({
          ...mockUser,
          phone: '+919876543210',
          displayName: `User${Date.now()}`,
          loginCount: 1,
          save: jest.fn().mockResolvedValue()
        });
        verifyOTP.mockResolvedValue(mockSuccessVerification);

        await verifyPhoneOTP(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            user: expect.objectContaining({
              displayName: expect.any(String)
            })
          })
        );
      });

      it('should handle very long display name', async () => {
        const longName = 'A'.repeat(100);
        req.body = { phone: '+919876543210', code: '123456', displayName: longName };
        
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({
          ...mockUser,
          displayName: longName,
          save: jest.fn().mockResolvedValue()
        });
        verifyOTP.mockResolvedValue(mockSuccessVerification);

        await verifyPhoneOTP(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true
          })
        );
      });

      it('should handle special characters in display name', async () => {
        const specialName = 'John D\'oe-Smith';
        req.body = { phone: '+919876543210', code: '123456', displayName: specialName };
        
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({
          ...mockUser,
          displayName: specialName,
          save: jest.fn().mockResolvedValue()
        });
        verifyOTP.mockResolvedValue(mockSuccessVerification);

        await verifyPhoneOTP(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true
          })
        );
      });

      it('should handle concurrent verification requests', async () => {
        const phone = '+919876543210';
        
        User.findOne.mockResolvedValue(mockExistingUser);
        verifyOTP.mockResolvedValue(mockSuccessVerification);

        const requests = [
          verifyPhoneOTP({ body: { phone, code: '123456' } }, res),
          verifyPhoneOTP({ body: { phone, code: '123456' } }, res)
        ];

        await Promise.all(requests);

        expect(verifyOTP).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    let req, res;

    beforeEach(() => {
      req = { user: mockUser };
      res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        clearCookie: jest.fn()
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('Happy Path - Success Scenarios', () => {
      it('should logout successfully and clear token', async () => {
        await logout(req, res);

        expect(res.clearCookie).toHaveBeenCalledWith('token');
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            message: 'Logged out successfully'
          })
        );
      });

      it('should return success even without token in cookie', async () => {
        req.user = mockUser;

        await logout(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true
          })
        );
      });
    });

    describe('Edge Cases', () => {
      it('should handle logout with no user object', async () => {
        req.user = null;

        await logout(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true
          })
        );
      });

      it('should handle clearCookie error gracefully', async () => {
        res.clearCookie.mockImplementation(() => {
          throw new Error('Cookie error');
        });

        await logout(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe('GET /api/auth/me - Get Current User', () => {
    let req, res;

    beforeEach(() => {
      req = { user: mockUser };
      res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis()
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('Happy Path - Success Scenarios', () => {
      it('should return current user data successfully', async () => {
        await getCurrentUser(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            user: expect.objectContaining({
              _id: mockUser._id,
              displayName: mockUser.displayName,
              email: mockUser.email,
              phone: mockUser.phone,
              authProvider: mockUser.authProvider
            })
          })
        );
      });

      it('should return user with null email if not set', async () => {
        req.user = { ...mockUser, email: null };

        await getCurrentUser(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            user: expect.objectContaining({
              email: null
            })
          })
        );
      });

      it('should return user with null phone if not set', async () => {
        req.user = { ...mockUser, phone: null };

        await getCurrentUser(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            user: expect.objectContaining({
              phone: null
            })
          })
        );
      });

      it('should include subscription details', async () => {
        req.user = {
          ...mockUser,
          subscriptionPlan: 'gold1',
          subscriptionStatus: 'active',
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };

        await getCurrentUser(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            user: expect.objectContaining({
              subscriptionPlan: 'gold1',
              subscriptionStatus: 'active',
              trialEndsAt: expect.any(Date)
            })
          })
        );
      });

      it('should include login analytics', async () => {
        req.user = {
          ...mockUser,
          lastLoginAt: new Date(),
          loginCount: 10
        };

        await getCurrentUser(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            user: expect.objectContaining({
              lastLoginAt: expect.any(Date),
              loginCount: 10
            })
          })
        );
      });
    });

    describe('Authorization Failures', () => {
      it('should handle request without user object', async () => {
        req.user = undefined;

        try {
          await getCurrentUser(req, res);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });

    describe('Edge Cases', () => {
      it('should handle user with missing photoURL', async () => {
        req.user = { ...mockUser, photoURL: null };

        await getCurrentUser(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            user: expect.objectContaining({
              photoURL: null
            })
          })
        );
      });

      it('should handle user with invalid date fields', async () => {
        req.user = {
          ...mockUser,
          lastLoginAt: 'invalid-date',
          trialEndsAt: 'invalid-date'
        };

        await getCurrentUser(req, res);

        // Should still return user data
        expect(res.json).toHaveBeenCalled();
      });

      it('should handle user with zero login count', async () => {
        req.user = { ...mockUser, loginCount: 0 };

        await getCurrentUser(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            user: expect.objectContaining({
              loginCount: 0
            })
          })
        );
      });
    });
  });
});
