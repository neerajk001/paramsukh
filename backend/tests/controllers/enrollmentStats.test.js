import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { User } from '../../src/models/user.models.js';
import { Course } from '../../src/models/course.models.js';
import { Enrollment } from '../../src/models/enrollment.models.js';
import request from 'supertest';
import app from '../../src/index.js';

describe('Enrollment Stats API Tests', () => {
  let mongoServer;
  let adminApiKey = 'test-admin-key';
  let testUser;
  let testCourse1, testCourse2;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    process.env.ADMIN_API_KEY = adminApiKey;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clean up all collections
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});

    // Create test users
    testUser = await User.create({
      displayName: 'Test User',
      phone: '+1234567890',
      email: 'test@example.com',
      subscriptionPlan: 'bronze',
      subscriptionStatus: 'active',
      authProvider: 'phone'
    });

    const testUser2 = await User.create({
      displayName: 'Test User 2',
      phone: '+1234567891',
      email: 'test2@example.com',
      subscriptionPlan: 'silver',
      subscriptionStatus: 'active',
      authProvider: 'phone'
    });

    // Create test courses
    testCourse1 = await Course.create({
      title: 'Test Course 1',
      description: 'Test description',
      color: '#8B5CF6',
      icon: 'book',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      bannerUrl: 'https://example.com/banner1.jpg',
      duration: '6 weeks',
      category: 'physical',
      tags: ['test'],
      status: 'published',
      videos: [
        { title: 'Video 1', duration: '15:00', durationInSeconds: 900, videoUrl: 'https://example.com/v1.mp4', order: 1 },
        { title: 'Video 2', duration: '20:00', durationInSeconds: 1200, videoUrl: 'https://example.com/v2.mp4', order: 2 }
      ],
      pdfs: [
        { title: 'PDF 1', pdfUrl: 'https://example.com/p1.pdf', order: 1 }
      ]
    });

    testCourse2 = await Course.create({
      title: 'Test Course 2',
      description: 'Test description 2',
      color: '#10B981',
      icon: 'fitness',
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      bannerUrl: 'https://example.com/banner2.jpg',
      duration: '4 weeks',
      category: 'mental',
      tags: ['test2'],
      status: 'published',
      videos: [
        { title: 'Video 1', duration: '25:00', durationInSeconds: 1500, videoUrl: 'https://example.com/v3.mp4', order: 1 }
      ]
    });

    // Create test enrollments
    // User 1 enrolled in both courses, completed one
    await Enrollment.create({
      userId: testUser._id,
      courseId: testCourse1._id,
      progress: 100,
      isCompleted: true,
      completedAt: new Date(),
      completedVideos: [testCourse1.videos[0]._id, testCourse1.videos[1]._id],
      completedPdfs: [testCourse1.pdfs[0]._id],
      currentVideoId: testCourse1.videos[0]._id,
      currentVideoIndex: 0,
      lastAccessedAt: new Date()
    });

    await Enrollment.create({
      userId: testUser._id,
      courseId: testCourse2._id,
      progress: 50,
      isCompleted: false,
      completedVideos: [testCourse2.videos[0]._id],
      completedPdfs: [],
      currentVideoId: testCourse2.videos[0]._id,
      currentVideoIndex: 0,
      lastAccessedAt: new Date()
    });

    // User 2 enrolled in first course only, in progress
    await Enrollment.create({
      userId: testUser2._id,
      courseId: testCourse1._id,
      progress: 25,
      isCompleted: false,
      completedVideos: [],
      completedPdfs: [],
      currentVideoId: testCourse1.videos[0]._id,
      currentVideoIndex: 0,
      lastAccessedAt: new Date()
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
  });

  describe('GET /api/enrollments/stats', () => {
    it('should return enrollment statistics with admin auth', async () => {
      const response = await request(app)
        .get('/api/enrollments/stats')
        .set('X-Admin-API-Key', adminApiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.totalEnrollments).toBe(3);
      expect(response.body.stats.completedEnrollments).toBe(1);
      expect(response.body.stats.inProgressEnrollments).toBe(2);
      expect(response.body.stats.notStarted).toBe(0);
      expect(response.body.stats.usersWithEnrollments).toBe(2);
      expect(response.body.stats.coursesWithEnrollments).toBe(2);
      expect(response.body.stats.averageProgress).toBeCloseTo(58, 0); // (100 + 50 + 25) / 3 = 58.33
    });

    it('should return 401 without admin API key', async () => {
      const response = await request(app)
        .get('/api/enrollments/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Admin API key required');
    });

    it('should return 403 with invalid admin API key', async () => {
      const response = await request(app)
        .get('/api/enrollments/stats')
        .set('X-Admin-API-Key', 'invalid-key')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid admin API key');
    });

    it('should return zero stats when no enrollments exist', async () => {
      await Enrollment.deleteMany({});

      const response = await request(app)
        .get('/api/enrollments/stats')
        .set('X-Admin-API-Key', adminApiKey)
        .expect(200);

      expect(response.body.stats.totalEnrollments).toBe(0);
      expect(response.body.stats.completedEnrollments).toBe(0);
      expect(response.body.stats.inProgressEnrollments).toBe(0);
      expect(response.body.stats.averageProgress).toBe(0);
    });
  });

  describe('GET /api/enrollments/stats/courses', () => {
    it('should return enrollment stats by course', async () => {
      const response = await request(app)
        .get('/api/enrollments/stats/courses')
        .set('X-Admin-API-Key', adminApiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.courses).toBeDefined();
      expect(response.body.courses).toHaveLength(2);

      // Check course 1 stats
      const course1Stats = response.body.courses.find(c => c.courseId.toString() === testCourse1._id.toString());
      expect(course1Stats).toBeDefined();
      expect(course1Stats.title).toBe(testCourse1.title);
      expect(course1Stats.enrollmentCount).toBe(2);
      expect(course1Stats.completedCount).toBe(1);
      expect(course1Stats.inProgressCount).toBe(1);
      expect(course1Stats.notStartedCount).toBe(0);
      expect(course1Stats.totalVideos).toBe(2);
      expect(course1Stats.totalPdfs).toBe(1);
      expect(course1Stats.averageProgress).toBeCloseTo(62, 0); // (100 + 25) / 2 = 62.5

      // Check course 2 stats
      const course2Stats = response.body.courses.find(c => c.courseId.toString() === testCourse2._id.toString());
      expect(course2Stats).toBeDefined();
      expect(course2Stats.title).toBe(testCourse2.title);
      expect(course2Stats.enrollmentCount).toBe(1);
      expect(course2Stats.completedCount).toBe(0);
      expect(course2Stats.inProgressCount).toBe(1);
      expect(course2Stats.notStartedCount).toBe(0);
      expect(course2Stats.totalVideos).toBe(1);
      expect(course2Stats.totalPdfs).toBe(0);
      expect(course2Stats.averageProgress).toBe(50);
    });

    it('should only return published courses', async () => {
      // Create unpublished course
      const unpublishedCourse = await Course.create({
        title: 'Unpublished Course',
        description: 'Not published',
        color: '#EF4444',
        icon: 'book',
        thumbnailUrl: 'https://example.com/thumb3.jpg',
        bannerUrl: 'https://example.com/banner3.jpg',
        duration: '2 weeks',
        category: 'general',
        tags: ['test'],
        status: 'draft',
        videos: [{ title: 'Video 1', duration: '10:00', durationInSeconds: 600, videoUrl: 'https://example.com/v4.mp4', order: 1 }]
      });

      // Create enrollment for unpublished course
      await Enrollment.create({
        userId: testUser._id,
        courseId: unpublishedCourse._id,
        progress: 0,
        isCompleted: false,
        completedVideos: [],
        completedPdfs: [],
        currentVideoId: unpublishedCourse.videos[0]._id,
        currentVideoIndex: 0,
        lastAccessedAt: new Date()
      });

      const response = await request(app)
        .get('/api/enrollments/stats/courses')
        .set('X-Admin-API-Key', adminApiKey)
        .expect(200);

      // Should only return published courses
      expect(response.body.courses).toHaveLength(2);
      const hasUnpublished = response.body.courses.some(
        c => c.courseId.toString() === unpublishedCourse._id.toString()
      );
      expect(hasUnpublished).toBe(false);
    });

    it('should return empty array when no courses exist', async () => {
      await Course.deleteMany({});

      const response = await request(app)
        .get('/api/enrollments/stats/courses')
        .set('X-Admin-API-Key', adminApiKey)
        .expect(200);

      expect(response.body.courses).toEqual([]);
    });
  });

  describe('GET /api/enrollments/stats/recent', () => {
    it('should return recent enrollments', async () => {
      const response = await request(app)
        .get('/api/enrollments/stats/recent?limit=2')
        .set('X-Admin-API-Key', adminApiKey)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.enrollments).toBeDefined();
      expect(response.body.enrollments.length).toBeLessThanOrEqual(2);

      // Check that enrollments are populated with user and course data
      if (response.body.enrollments.length > 0) {
        const enrollment = response.body.enrollments[0];
        expect(enrollment.userId).toBeDefined();
        expect(enrollment.userId.displayName).toBeDefined();
        expect(enrollment.courseId).toBeDefined();
        expect(enrollment.courseId.title).toBeDefined();
      }
    });

    it('should default to limit of 10 when not specified', async () => {
      // Create additional enrollments
      for (let i = 0; i < 15; i++) {
        const newUser = await User.create({
          displayName: `Test User ${i + 3}`,
          phone: `+123456789${i + 2}`,
          subscriptionPlan: 'free',
          subscriptionStatus: 'active',
          authProvider: 'phone'
        });

        await Enrollment.create({
          userId: newUser._id,
          courseId: testCourse1._id,
          progress: 0,
          isCompleted: false,
          completedVideos: [],
          completedPdfs: [],
          currentVideoId: testCourse1.videos[0]._id,
          currentVideoIndex: 0,
          lastAccessedAt: new Date()
        });
      }

      const response = await request(app)
        .get('/api/enrollments/stats/recent')
        .set('X-Admin-API-Key', adminApiKey)
        .expect(200);

      expect(response.body.enrollments.length).toBeLessThanOrEqual(10);
    });

    it('should respect custom limit parameter', async () => {
      const response = await request(app)
        .get('/api/enrollments/stats/recent?limit=1')
        .set('X-Admin-API-Key', adminApiKey)
        .expect(200);

      expect(response.body.enrollments.length).toBeLessThanOrEqual(1);
    });
  });
});
