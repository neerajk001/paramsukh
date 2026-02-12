import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/index.js';
import User from '../../src/models/user.models.js';
import Assessment from '../../src/models/assessment.models.js';
import { generateTokens } from '../../src/lib/generateTokens.js';

describe('Assessment Controller', () => {
  let mongoServer;
  let user;
  let authToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Assessment.deleteMany({});

    // Create a test user
    user = await User.create({
      phone: '+919876543210',
      displayName: 'Test User',
      email: 'test@example.com',
      authProvider: 'phone',
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
      assessmentCompleted: false
    });

    // Generate auth token
    const { token } = await generateTokens(user._id);
    authToken = token;
  });

  describe('POST /api/assessment/submit', () => {
    const validAssessmentData = {
      age: 30,
      occupation: 'Software Engineer',
      location: 'Bangalore',
      physicalIssue: true,
      physicalIssueDetails: 'Back pain',
      specialDiseaseIssue: false,
      specialDiseaseDetails: '',
      relationshipIssue: true,
      relationshipIssueDetails: 'Family issues',
      financialIssue: false,
      financialIssueDetails: '',
      mentalHealthIssue: true,
      mentalHealthIssueDetails: 'Anxiety',
      spiritualGrowth: true,
      spiritualGrowthDetails: 'Meditation'
    };

    it('should create a new assessment successfully', async () => {
      const response = await request(app)
        .post('/api/assessment/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validAssessmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Assessment submitted successfully');
      expect(response.body.data.assessment).toHaveProperty('_id');
      expect(response.body.data.assessment.user.toString()).toBe(user._id.toString());
      expect(response.body.data.assessment.age).toBe(30);
      expect(response.body.data.assessment.occupation).toBe('Software Engineer');
    });

    it('should update user assessmentCompleted flag on first submission', async () => {
      await request(app)
        .post('/api/assessment/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validAssessmentData)
        .expect(201);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.assessmentCompleted).toBe(true);
      expect(updatedUser.assessmentCompletedAt).toBeDefined();
    });

    it('should update existing assessment if already exists', async () => {
      // Create initial assessment
      await Assessment.create({
        user: user._id,
        age: 25,
        occupation: 'Developer',
        location: 'Delhi',
        physicalIssue: false,
        specialDiseaseIssue: false,
        relationshipIssue: false,
        financialIssue: false,
        mentalHealthIssue: false,
        spiritualGrowth: false
      });

      // Update assessment
      const response = await request(app)
        .post('/api/assessment/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validAssessmentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Assessment updated successfully');
      expect(response.body.data.assessment.age).toBe(30);
      expect(response.body.data.assessment.occupation).toBe('Software Engineer');
    });

    it('should fail if age is missing', async () => {
      const invalidData = { ...validAssessmentData };
      delete invalidData.age;

      const response = await request(app)
        .post('/api/assessment/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should fail if occupation is missing', async () => {
      const invalidData = { ...validAssessmentData };
      delete invalidData.occupation;

      const response = await request(app)
        .post('/api/assessment/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail if location is missing', async () => {
      const invalidData = { ...validAssessmentData };
      delete invalidData.location;

      const response = await request(app)
        .post('/api/assessment/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail if required boolean fields are missing', async () => {
      const invalidData = {
        age: 30,
        occupation: 'Engineer',
        location: 'Mumbai'
      };

      const response = await request(app)
        .post('/api/assessment/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('must be answered');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/assessment/submit')
        .send(validAssessmentData)
        .expect(401);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .post('/api/assessment/submit')
        .set('Authorization', 'Bearer invalidtoken123')
        .send(validAssessmentData)
        .expect(401);
    });
  });

  describe('GET /api/assessment', () => {
    it('should get user assessment if exists', async () => {
      // Create assessment
      const assessment = await Assessment.create({
        user: user._id,
        age: 30,
        occupation: 'Engineer',
        location: 'Chennai',
        physicalIssue: true,
        specialDiseaseIssue: false,
        relationshipIssue: false,
        financialIssue: true,
        mentalHealthIssue: false,
        spiritualGrowth: true
      });

      const response = await request(app)
        .get('/api/assessment')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assessment._id.toString()).toBe(assessment._id.toString());
      expect(response.body.data.assessment.age).toBe(30);
    });

    it('should return 404 if assessment not found', async () => {
      const response = await request(app)
        .get('/api/assessment')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/assessment')
        .expect(401);
    });
  });

  describe('GET /api/assessment/status', () => {
    it('should return completed status when assessment exists', async () => {
      await Assessment.create({
        user: user._id,
        age: 30,
        occupation: 'Engineer',
        location: 'Chennai',
        physicalIssue: false,
        specialDiseaseIssue: false,
        relationshipIssue: false,
        financialIssue: false,
        mentalHealthIssue: false,
        spiritualGrowth: false
      });

      const response = await request(app)
        .get('/api/assessment/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.completed).toBe(true);
      expect(response.body.data.completedAt).toBeDefined();
    });

    it('should return not completed status when assessment does not exist', async () => {
      const response = await request(app)
        .get('/api/assessment/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.completed).toBe(false);
      expect(response.body.data.completedAt).toBeNull();
    });
  });

  describe('DELETE /api/assessment', () => {
    it('should delete user assessment', async () => {
      // Create assessment
      await Assessment.create({
        user: user._id,
        age: 30,
        occupation: 'Engineer',
        location: 'Chennai',
        physicalIssue: false,
        specialDiseaseIssue: false,
        relationshipIssue: false,
        financialIssue: false,
        mentalHealthIssue: false,
        spiritualGrowth: false
      });

      // Mark user as completed
      await User.findByIdAndUpdate(user._id, {
        assessmentCompleted: true,
        assessmentCompletedAt: Date.now()
      });

      const response = await request(app)
        .delete('/api/assessment')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Assessment deleted successfully');

      // Verify assessment is deleted
      const assessment = await Assessment.findOne({ user: user._id });
      expect(assessment).toBeNull();

      // Verify user flags are reset
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.assessmentCompleted).toBe(false);
      expect(updatedUser.assessmentCompletedAt).toBeNull();
    });

    it('should return 404 if assessment not found', async () => {
      const response = await request(app)
        .delete('/api/assessment')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});