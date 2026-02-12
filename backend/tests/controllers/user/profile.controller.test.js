import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../../models/user.models.js';
import { Enrollment } from '../../models/enrollment.models.js';
import { Course } from '../../models/course.models.js';
import { Group } from '../../models/community.models.js';
import { GroupMember } from '../../models/community.models.js';
import { purchaseMembership } from '../../controller/user/profile.controller.js';
import { MEMBERSHIP_COURSE_ACCESS } from '../../models/enrollment.models.js';

// Mock dependencies
jest.mock('axios', () => ({
  default: {
    post: jest.fn(() => Promise.resolve({ data: { success: true } }))
  }
}));

describe('Membership Auto-Enrollment Controller', () => {
  let app;
  let mongoServer;
  let user;
  let course1, course2;
  let req, res;

  beforeEach(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create test app
    app = express();
    app.use(express.json());
    app.post('/api/user/membership/purchase', async (req, res) => {
      // Mock req.user
      req.user = { _id: user._id };
      await purchaseMembership(req, res);
    });

    // Create test courses
    course1 = await Course.create({
      title: 'Physical Wellness',
      description: 'Test course 1',
      color: '#8B5CF6',
      icon: 'fitness',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      bannerUrl: 'https://example.com/banner1.jpg',
      duration: '6 weeks',
      category: 'physical',
      tags: ['wellness', 'fitness'],
      status: 'published',
      videos: []
    });

    course2 = await Course.create({
      title: 'Spirituality & Mantra Yoga',
      description: 'Test course 2',
      color: '#8B5CF6',
      icon: 'meditation',
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      bannerUrl: 'https://example.com/banner2.jpg',
      duration: '4 weeks',
      category: 'spiritual',
      tags: ['yoga', 'meditation'],
      status: 'published',
      videos: []
    });

    // Create test user
    user = await User.create({
      displayName: 'Test User',
      phone: '+1234567890',
      email: 'test@example.com',
      subscriptionPlan: 'free',
      subscriptionStatus: 'trial',
      authProvider: 'phone',
      isActive: true
    });
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('purchaseMembership', () => {
    test('should auto-enroll user in Bronze plan courses', async () => {
      const res = await request(app)
        .post('/api/user/membership/purchase')
        .send({ plan: 'bronze' })
        .set('authorization', `Bearer test-token`)
        .set('x-user-id', user._id.toString());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.subscription.plan).toBe('bronze');
      expect(res.body.subscription.status).toBe('active');

      // Verify enrollments were created
      const enrollments = await Enrollment.find({ userId: user._id });
      expect(enrollments).toHaveLength(1);
      expect(enrollments[0].courseId.toString()).toBe(course1._id.toString());

      // Verify course enrollment count was updated
      const updatedCourse = await Course.findById(course1._id);
      expect(updatedCourse.enrollmentCount).toBe(1);
    });

    test('should auto-enroll user in Copper plan courses', async () => {
      const res = await request(app)
        .post('/api/user/membership/purchase')
        .send({ plan: 'copper' })
        .set('authorization', `Bearer test-token`)
        .set('x-user-id', user._id.toString());

      expect(res.status).toBe(200);
      expect(res.body.enrolledCourses).toHaveLength(2);

      // Verify all courses were enrolled
      const enrollments = await Enrollment.find({ userId: user._id });
      expect(enrollments).toHaveLength(2);

      const courseIds = enrollments.map(e => e.courseId.toString());
      expect(courseIds).toContain(course1._id.toString());
      expect(courseIds).toContain(course2._id.toString());
    });

    test('should create community groups for enrolled courses', async () => {
      await request(app)
        .post('/api/user/membership/purchase')
        .send({ plan: 'bronze' })
        .set('authorization', `Bearer test-token`)
        .set('x-user-id', user._id.toString());

      // Verify group was created
      const group = await Group.findOne({ courseId: course1._id });
      expect(group).not.toBeNull();
      expect(group.name).toBe('Physical Wellness Community');
      expect(group.memberCount).toBe(1);

      // Verify user is group member
      const groupMember = await GroupMember.findOne({
        groupId: group._id,
        userId: user._id
      });
      expect(groupMember).not.toBeNull();
      expect(groupMember.role).toBe('member');
    });

    test('should not create duplicate enrollments for same user and course', async () => {
      // First purchase
      await request(app)
        .post('/api/user/membership/purchase')
        .send({ plan: 'bronze' })
        .set('authorization', `Bearer test-token`)
        .set('x-user-id', user._id.toString());

      // Second purchase (should not create duplicate enrollment)
      const res = await request(app)
        .post('/api/user/membership/purchase')
        .send({ plan: 'bronze' })
        .set('authorization', `Bearer test-token`)
        .set('x-user-id', user._id.toString());

      // Verify only one enrollment exists
      const enrollments = await Enrollment.find({ userId: user._id });
      expect(enrollments).toHaveLength(1);
    });

    test('should not create duplicate group memberships', async () => {
      // First purchase
      await request(app)
        .post('/api/user/membership/purchase')
        .send({ plan: 'bronze' })
        .set('authorization', `Bearer test-token`)
        .set('x-user-id', user._id.toString());

      const group = await Group.findOne({ courseId: course1._id });
      const initialMemberCount = group.memberCount;

      // Second purchase
      await request(app)
        .post('/api/user/membership/purchase')
        .send({ plan: 'bronze' })
        .set('authorization', `Bearer test-token`)
        .set('x-user-id', user._id.toString());

      // Verify member count didn't increase
      const updatedGroup = await Group.findById(group._id);
      expect(updatedGroup.memberCount).toBe(initialMemberCount);
    });

    test('should return 400 for invalid plan', async () => {
      const res = await request(app)
        .post('/api/user/membership/purchase')
        .send({ plan: 'invalid' })
        .set('authorization', `Bearer test-token`)
        .set('x-user-id', user._id.toString());

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid plan');
    });

    test('should handle case-insensitive course title matching', async () => {
      // Create course with different casing
      await Course.create({
        title: 'physical wellness', // lowercase
        description: 'Test course 3',
        color: '#8B5CF6',
        icon: 'fitness',
        thumbnailUrl: 'https://example.com/thumb3.jpg',
        bannerUrl: 'https://example.com/banner3.jpg',
        duration: '6 weeks',
        category: 'physical',
        tags: ['wellness'],
        status: 'published',
        videos: []
      });

      const res = await request(app)
        .post('/api/user/membership/purchase')
        .send({ plan: 'bronze' })
        .set('authorization', `Bearer test-token`)
        .set('x-user-id', user._id.toString());

      expect(res.status).toBe(200);
      expect(res.body.enrolledCourses).toHaveLength(1);
    });

    test('should only enroll in published courses', async () => {
      // Create draft course (should not be enrolled)
      await Course.create({
        title: 'Physical Wellness',
        description: 'Draft course',
        color: '#8B5CF6',
        icon: 'fitness',
        thumbnailUrl: 'https://example.com/thumb4.jpg',
        bannerUrl: 'https://example.com/banner4.jpg',
        duration: '6 weeks',
        category: 'physical',
        tags: ['wellness'],
        status: 'draft', // Draft status
        videos: []
      });

      const res = await request(app)
        .post('/api/user/membership/purchase')
        .send({ plan: 'bronze' })
        .set('authorization', `Bearer test-token`)
        .set('x-user-id', user._id.toString());

      expect(res.status).toBe(200);
      // Should only enroll in the published course (course1)
      const enrollments = await Enrollment.find({ userId: user._id });
      expect(enrollments).toHaveLength(1);
    });

    test('should return 404 if no published courses found for plan', async () => {
      // Delete all published courses
      await Course.deleteMany({ status: 'published' });

      const res = await request(app)
        .post('/api/user/membership/purchase')
        .send({ plan: 'bronze' })
        .set('authorization', `Bearer test-token`)
        .set('x-user-id', user._id.toString());

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No published courses found');
    });
  });

  describe('MEMBERSHIP_COURSE_ACCESS', () => {
    test('should have correct course access configuration', () => {
      expect(MEMBERSHIP_COURSE_ACCESS.bronze).toEqual(['Physical Wellness']);
      expect(MEMBERSHIP_COURSE_ACCESS.copper).toContain('Physical Wellness');
      expect(MEMBERSHIP_COURSE_ACCESS.copper).toContain('Spirituality & Mantra Yoga');
      expect(MEMBERSHIP_COURSE_ACCESS.copper).toContain('Mental Wellness');
      expect(MEMBERSHIP_COURSE_ACCESS.silver).toHaveLength(5);
    });
  });
});
