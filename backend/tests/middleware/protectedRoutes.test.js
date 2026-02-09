import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { protectedRoutes } from '../../src/middleware/protectedRoutes.js';
import { User } from '../../src/models/user.models.js';
import jwt from 'jsonwebtoken';
import {
  mockUser,
  generateMockToken,
  generateExpiredToken,
  generateInvalidToken,
  mockDatabaseError
} from '../utils/testHelpers.js';

// Mock User model
jest.unstable_mockModule('../../src/models/user.models.js', () => ({
  User: {
    findById: jest.fn()
  }
}));

describe('Protected Routes Middleware Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path - Success Scenarios', () => {
    it('should allow access with valid Bearer token in Authorization header', async () => {
      const token = generateMockToken();
      req.headers.authorization = `Bearer ${token}`;
      User.findById.mockResolvedValue(mockUser);

      await protectedRoutes(req, res, next);

      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow access with valid token in cookie', async () => {
      const token = generateMockToken();
      req.cookies.token = token;
      User.findById.mockResolvedValue(mockUser);

      await protectedRoutes(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should prefer Authorization header over cookie', async () => {
      const headerToken = generateMockToken();
      const cookieToken = generateExpiredToken();
      req.headers.authorization = `Bearer ${headerToken}`;
      req.cookies.token = cookieToken;
      User.findById.mockResolvedValue(mockUser);

      await protectedRoutes(req, res, next);

      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
      expect(next).toHaveBeenCalled();
    });

    it('should handle valid token with different user ID', async () => {
      const customUserId = '507f1f77bcf86cd799439099';
      const token = generateMockToken(customUserId);
      req.headers.authorization = `Bearer ${token}`;
      
      const customUser = { ...mockUser, _id: customUserId };
      User.findById.mockResolvedValue(customUser);

      await protectedRoutes(req, res, next);

      expect(req.user._id).toBe(customUserId);
      expect(next).toHaveBeenCalled();
    });

    it('should attach user object to request', async () => {
      const token = generateMockToken();
      req.headers.authorization = `Bearer ${token}`;
      User.findById.mockResolvedValue(mockUser);

      await protectedRoutes(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user._id).toBe(mockUser._id);
      expect(req.user.phone).toBe(mockUser.phone);
    });
  });

  describe('Authentication Failures - No Token', () => {
    it('should return 401 when no token provided', async () => {
      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('No token provided')
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when Authorization header is empty', async () => {
      req.headers.authorization = '';
      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when Authorization header has no Bearer prefix', async () => {
      req.headers.authorization = 'invalidtoken';
      User.findById.mockResolvedValue(mockUser);

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when cookie is empty', async () => {
      req.cookies.token = '';
      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when both header and cookie are missing', async () => {
      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Authentication Failures - Invalid Token', () => {
    it('should return 401 for invalid JWT signature', async () => {
      req.headers.authorization = `Bearer ${generateInvalidToken()}`;

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid token'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for malformed token', async () => {
      req.headers.authorization = 'Bearer malformed.token';

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for token without id', async () => {
      // Create token without id field
      const token = jwt.sign({}, process.env.JWT_SECRET || 'test-secret-key', { expiresIn: '15d' });
      req.headers.authorization = `Bearer ${token}`;

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for expired token', async () => {
      req.headers.authorization = `Bearer ${generateExpiredToken()}`;

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Token expired'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for token signed with wrong secret', async () => {
      const wrongSecretToken = jwt.sign(
        { id: mockUser._id },
        'wrong-secret-key',
        { expiresIn: '15d' }
      );
      req.headers.authorization = `Bearer ${wrongSecretToken}`;

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for token with invalid ID format', async () => {
      const token = jwt.sign(
        { id: 'invalid-id' },
        process.env.JWT_SECRET || 'test-secret-key',
        { expiresIn: '15d' }
      );
      req.headers.authorization = `Bearer ${token}`;
      User.findById.mockResolvedValue(null);

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Authorization Failures - User Not Found', () => {
    it('should return 401 when user not found in database', async () => {
      const token = generateMockToken();
      req.headers.authorization = `Bearer ${token}`;
      User.findById.mockResolvedValue(null);

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'User not found'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when user has been deleted', async () => {
      const token = generateMockToken();
      req.headers.authorization = `Bearer ${token}`;
      User.findById.mockResolvedValue(null);

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Database Failure Scenarios', () => {
    it('should return 401 on database connection error', async () => {
      const token = generateMockToken();
      req.headers.authorization = `Bearer ${token}`;
      User.findById.mockRejectedValue(new Error('Database connection failed'));

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 on MongoDB timeout', async () => {
      const token = generateMockToken();
      req.headers.authorization = `Bearer ${token}`;
      User.findById.mockRejectedValue(new Error('MongoDB timeout'));

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 on duplicate key error', async () => {
      const token = generateMockToken();
      req.headers.authorization = `Bearer ${token}`;
      const duplicateError = new Error('Duplicate key');
      duplicateError.code = 11000;
      User.findById.mockRejectedValue(duplicateError);

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 on network error', async () => {
      const token = generateMockToken();
      req.headers.authorization = `Bearer ${token}`;
      User.findById.mockRejectedValue(new Error('Network error'));

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 on unexpected error', async () => {
      const token = generateMockToken();
      req.headers.authorization = `Bearer ${token}`;
      User.findById.mockRejectedValue(new Error('Unexpected error'));

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple spaces in Authorization header', async () => {
      const token = generateMockToken();
      req.headers.authorization = `Bearer   ${token}`;
      User.findById.mockResolvedValue(mockUser);

      await protectedRoutes(req, res, next);

      // The token will be extracted after "Bearer " with spaces
      // It might fail due to extra spaces being part of token
      expect(User.findById).not.toHaveBeenCalledWith(mockUser._id);
    });

    it('should handle lowercase "bearer" prefix', async () => {
      const token = generateMockToken();
      req.headers.authorization = `bearer ${token}`;

      await protectedRoutes(req, res, next);

      // Should fail due to case sensitivity
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle token with leading/trailing whitespace', async () => {
      const token = ` ${generateMockToken()} `;
      req.headers.authorization = `Bearer ${token}`;

      await protectedRoutes(req, res, next);

      // Should fail due to whitespace
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle non-string token', async () => {
      req.headers.authorization = 'Bearer 12345';

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle missing JWT_SECRET environment variable', async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      try {
        const token = jwt.sign({ id: mockUser._id }, 'fallback-secret', { expiresIn: '15d' });
        req.headers.authorization = `Bearer ${token}`;
        User.findById.mockResolvedValue(mockUser);

        await protectedRoutes(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
      } finally {
        process.env.JWT_SECRET = originalSecret;
      }
    });

    it('should handle undefined headers object', async () => {
      req.headers = undefined;

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle undefined cookies object', async () => {
      const token = generateMockToken();
      req.headers.authorization = `Bearer ${token}`;
      req.cookies = undefined;
      User.findById.mockResolvedValue(mockUser);

      await protectedRoutes(req, res, next);

      // Should work with just header
      expect(next).toHaveBeenCalled();
    });

    it('should handle very long token', async () => {
      const longToken = 'a'.repeat(1000);
      req.headers.authorization = `Bearer ${longToken}`;

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle special characters in token', async () => {
      const specialToken = 'Bearer token-with-special-chars!@#$%^&*()';
      req.headers.authorization = specialToken;

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('JWT Error Handling', () => {
    it('should handle JsonWebTokenError correctly', async () => {
      req.headers.authorization = 'Bearer invalid.token.here';

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid token'
        })
      );
    });

    it('should handle TokenExpiredError correctly', async () => {
      req.headers.authorization = `Bearer ${generateExpiredToken()}`;

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Token expired'
        })
      );
    });

    it('should handle NotBeforeError if token not yet valid', async () => {
      const token = jwt.sign(
        { id: mockUser._id },
        process.env.JWT_SECRET || 'test-secret-key',
        { expiresIn: '15d', notBefore: '30d' }
      );
      req.headers.authorization = `Bearer ${token}`;

      await protectedRoutes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('User Object Variations', () => {
    it('should handle user with minimal fields', async () => {
      const token = generateMockToken();
      req.headers.authorization = `Bearer ${token}`;
      
      const minimalUser = {
        _id: mockUser._id,
        phone: '+919876543210'
      };
      User.findById.mockResolvedValue(minimalUser);

      await protectedRoutes(req, res, next);

      expect(req.user).toEqual(minimalUser);
      expect(next).toHaveBeenCalled();
    });

    it('should handle user with all fields', async () => {
      const token = generateMockToken();
      req.headers.authorization = `Bearer ${token}`;
      User.findById.mockResolvedValue(mockUser);

      await protectedRoutes(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should handle user with inactive status', async () => {
      const token = generateMockToken();
      req.headers.authorization = `Bearer ${token}`;
      
      const inactiveUser = { ...mockUser, isActive: false };
      User.findById.mockResolvedValue(inactiveUser);

      await protectedRoutes(req, res, next);

      // Middleware doesn't check isActive, so it should pass
      expect(next).toHaveBeenCalled();
    });
  });
});
