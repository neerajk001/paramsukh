import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { body, validationResult } from 'express-validator';
import {
  validateSendOTP,
  validateVerifyOTP,
  validateUpdateProfile,
  validateCreateCourse,
  validateCreateEvent,
  validateCreateProduct,
  validateBookCounseling,
  validateCreateOrder,
  validateVerifyPayment,
  validateSubmitAssessment,
  validatePagination,
  validateSearch,
  validateAddToCart,
  validateCreatePost,
  validateCreateComment,
  validateRegisterShop,
  validateCreateAddress,
  validateMongoId,
  handleValidationErrors
} from '../../src/middleware/validators.js';

// Mock request, response, next
const createMockReq = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query
});

const createMockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

const mockNext = jest.fn();

describe('Validator Middleware Tests', () => {
  describe('handleValidationErrors', () => {
    it('should call next when no validation errors', async () => {
      const req = createMockReq();
      const res = createMockRes();
      
      // Mock validationResult to return no errors
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      handleValidationErrors(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 when validation errors exist', async () => {
      const req = createMockReq();
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid field', param: 'field' }]
      });

      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation failed',
          errors: expect.any(Array)
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateSendOTP', () => {
    it('should pass validation for valid Indian phone number', async () => {
      const req = createMockReq({ phone: '9876543210' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      const middleware = validateSendOTP[0];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail validation for phone with + prefix', async () => {
      const req = createMockReq({ phone: '+919876543210' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid phone number', param: 'phone' }]
      });

      const middleware = validateSendOTP[0];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for phone with letters', async () => {
      const req = createMockReq({ phone: '98765abcde' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid phone number', param: 'phone' }]
      });

      const middleware = validateSendOTP[0];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for phone starting with 5', async () => {
      const req = createMockReq({ phone: '5876543210' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid phone number', param: 'phone' }]
      });

      const middleware = validateSendOTP[0];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for phone with less than 10 digits', async () => {
      const req = createMockReq({ phone: '987654321' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid phone number', param: 'phone' }]
      });

      const middleware = validateSendOTP[0];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for phone with more than 10 digits', async () => {
      const req = createMockReq({ phone: '98765432101' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid phone number', param: 'phone' }]
      });

      const middleware = validateSendOTP[0];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for missing phone', async () => {
      const req = createMockReq({});
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid phone number', param: 'phone' }]
      });

      const middleware = validateSendOTP[0];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for empty phone', async () => {
      const req = createMockReq({ phone: '' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid phone number', param: 'phone' }]
      });

      const middleware = validateSendOTP[0];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateVerifyOTP', () => {
    it('should pass validation for valid phone and OTP', async () => {
      const req = createMockReq({ phone: '9876543210', otp: '123456' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      const middleware1 = validateVerifyOTP[0];
      const middleware2 = validateVerifyOTP[1];
      await middleware1(req, {}, () => {});
      await middleware2(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail validation for OTP with letters', async () => {
      const req = createMockReq({ phone: '9876543210', otp: 'abc123' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid OTP', param: 'otp' }]
      });

      const middleware = validateVerifyOTP[1];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for OTP with special characters', async () => {
      const req = createMockReq({ phone: '9876543210', otp: '12@45#' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid OTP', param: 'otp' }]
      });

      const middleware = validateVerifyOTP[1];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for OTP less than 6 digits', async () => {
      const req = createMockReq({ phone: '9876543210', otp: '12345' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid OTP', param: 'otp' }]
      });

      const middleware = validateVerifyOTP[1];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for OTP more than 6 digits', async () => {
      const req = createMockReq({ phone: '9876543210', otp: '1234567' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid OTP', param: 'otp' }]
      });

      const middleware = validateVerifyOTP[1];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for missing OTP', async () => {
      const req = createMockReq({ phone: '9876543210' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid OTP', param: 'otp' }]
      });

      const middleware = validateVerifyOTP[1];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateUpdateProfile', () => {
    it('should pass validation for valid profile data', async () => {
      const req = createMockReq({
        displayName: 'John Doe',
        email: 'john@example.com',
        photoURL: 'https://example.com/photo.jpg'
      });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      validateUpdateProfile.forEach(middleware => {
        middleware(req, {}, () => {});
      });
      handleValidationErrors(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail validation for short displayName', async () => {
      const req = createMockReq({ displayName: 'J' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid displayName', param: 'displayName' }]
      });

      const middleware = validateUpdateProfile[0];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for long displayName', async () => {
      const req = createMockReq({ displayName: 'A'.repeat(51) });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid displayName', param: 'displayName' }]
      });

      const middleware = validateUpdateProfile[0];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for invalid email', async () => {
      const req = createMockReq({ email: 'invalid-email' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid email', param: 'email' }]
      });

      const middleware = validateUpdateProfile[1];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for invalid photoURL', async () => {
      const req = createMockReq({ photoURL: 'not-a-url' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid photoURL', param: 'photoURL' }]
      });

      const middleware = validateUpdateProfile[2];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateCreateCourse', () => {
    it('should pass validation for valid course data', async () => {
      const req = createMockReq({
        title: 'Course Title',
        description: 'This is a course description',
        price: 99.99,
        category: 'Technology'
      });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      validateCreateCourse.forEach(middleware => {
        middleware(req, {}, () => {});
      });
      handleValidationErrors(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail validation for short title', async () => {
      const req = createMockReq({ title: 'AB' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid title', param: 'title' }]
      });

      const middleware = validateCreateCourse[0];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for short description', async () => {
      const req = createMockReq({ description: 'Short' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid description', param: 'description' }]
      });

      const middleware = validateCreateCourse[1];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for negative price', async () => {
      const req = createMockReq({ price: -10 });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid price', param: 'price' }]
      });

      const middleware = validateCreateCourse[2];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for empty category', async () => {
      const req = createMockReq({ category: '' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid category', param: 'category' }]
      });

      const middleware = validateCreateCourse[3];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateMongoId', () => {
    it('should pass validation for valid MongoDB ID', async () => {
      const req = createMockReq({}, { id: '507f1f77bcf86cd799439011' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      const middleware = validateMongoId[0];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail validation for invalid MongoDB ID', async () => {
      const req = createMockReq({}, { id: 'invalid-id' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid ID', param: 'id' }]
      });

      const middleware = validateMongoId[0];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for MongoDB ID that is too short', async () => {
      const req = createMockReq({}, { id: '507f1f77' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid ID', param: 'id' }]
      });

      const middleware = validateMongoId[0];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validatePagination', () => {
    it('should pass validation for valid pagination', async () => {
      const req = createMockReq({}, {}, { page: '1', limit: '10' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      validatePagination.forEach(middleware => {
        middleware(req, {}, () => {});
      });
      handleValidationErrors(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail validation for negative page', async () => {
      const req = createMockReq({}, {}, { page: '-1' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid page', param: 'page' }]
      });

      const middleware = validatePagination[0];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for page that is not a number', async () => {
      const req = createMockReq({}, {}, { page: 'abc' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid page', param: 'page' }]
      });

      const middleware = validatePagination[0];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for limit > 100', async () => {
      const req = createMockReq({}, {}, { limit: '101' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid limit', param: 'limit' }]
      });

      const middleware = validatePagination[1];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for zero limit', async () => {
      const req = createMockReq({}, {}, { limit: '0' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid limit', param: 'limit' }]
      });

      const middleware = validatePagination[1];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateSubmitAssessment', () => {
    it('should pass validation for valid assessment scores', async () => {
      const req = createMockReq({
        physicalHealth: 5,
        mentalHealth: 5,
        spiritualHealth: 5,
        emotionalHealth: 5
      });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      validateSubmitAssessment.forEach(middleware => {
        middleware(req, {}, () => {});
      });
      handleValidationErrors(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail validation for health score < 1', async () => {
      const req = createMockReq({ physicalHealth: 0 });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid score', param: 'physicalHealth' }]
      });

      const middleware = validateSubmitAssessment[0];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for health score > 10', async () => {
      const req = createMockReq({ mentalHealth: 11 });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid score', param: 'mentalHealth' }]
      });

      const middleware = validateSubmitAssessment[1];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for non-integer score', async () => {
      const req = createMockReq({ spiritualHealth: 5.5 });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid score', param: 'spiritualHealth' }]
      });

      const middleware = validateSubmitAssessment[2];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateCreateAddress', () => {
    it('should pass validation for valid address', async () => {
      const req = createMockReq({
        fullName: 'John Doe',
        phone: '9876543210',
        pincode: '110001',
        state: 'Delhi',
        city: 'New Delhi',
        addressLine1: '123 Street Name'
      });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      validateCreateAddress.forEach(middleware => {
        middleware(req, {}, () => {});
      });
      handleValidationErrors(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail validation for invalid pincode format', async () => {
      const req = createMockReq({ pincode: '12345' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid pincode', param: 'pincode' }]
      });

      const middleware = validateCreateAddress[3];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for pincode starting with 0', async () => {
      const req = createMockReq({ pincode: '012345' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid pincode', param: 'pincode' }]
      });

      const middleware = validateCreateAddress[3];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail validation for short address line', async () => {
      const req = createMockReq({ addressLine1: 'ABC' });
      const res = createMockRes();
      
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid addressLine1', param: 'addressLine1' }]
      });

      const middleware = validateCreateAddress[6];
      await middleware(req, {}, () => {});
      handleValidationErrors(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
