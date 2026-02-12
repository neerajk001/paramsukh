import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { User } from '../../src/models/user.models.js';
import { Course } from '../../src/models/course.models.js';
import { Enrollment } from '../../src/models/enrollment.models.js';
import { Group, GroupMember } from '../../src/models/community.models.js';
import { MEMBERSHIP_COURSE_ACCESS } from '../../src/models/enrollment.models.js';

// Mock the controller functions
import { purchaseMembership } from '../../src/controller/user/profile.controller.js';
import { updateUserMembership } from '../../src/controller/user/admin.controller.js';

describe('Membership Auto-Enrollment Tests', () => {
  let mongoServer;
  let testUser;
  let bronzeCourse;
  let copperCourses = [];
  let silverCourses = [];

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
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
    await Group.deleteMany({});
    await GroupMember.deleteMany({});

    // Create test user
    testUser = await User.create({
      displayName: 'Test User',
      phone: '+1234567890',
      email: 'test@example.com',
      subscriptionPlan: 'free',
      subscriptionStatus: 'inactive',
      authProvider: 'phone'
    });

    // Create test courses for different membership plans
    bronzeCourse = await Course.create({
      title: 'Physical Wellness',
      description: 'Physical wellness course',
      color: '#8B5CF6',
      icon: 'fitness',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      bannerUrl: 'https://example.com/banner1.jpg',
      duration: '6 weeks',
      category: 'physical',
      tags: ['wellness', 'fitness'],
      status: 'published',
      videos: [{ title: 'Video 1', duration: '15:30', durationInSeconds: 930, videoUrl: 'https://example.com/v1.mp4', order: 1 }]
    });

    copperCourses = [
      bronzeCourse,
      await Course.create({
        title: 'Spirituality & Mantra Yoga',
        description: 'Spirituality course',
        color: '#A855F7',
        icon: 'om',
        thumbnailUrl: 'https://example.com/thumb2.jpg',
        bannerUrl: 'https://example.com/banner2.jpg',
        duration: '4 weeks',
        category: 'spiritual',
        tags: ['meditation', 'yoga'],
        status: 'published',
        videos: [{ title: 'Video 1', duration: '20:00', durationInSeconds: 1200, videoUrl: 'https://example.com/v2.mp4', order: 1 }]
      }),
      await Course.create({
        title: 'Mental Wellness',
        description: 'Mental wellness course',
        color: '#6366F1',
        icon: 'brain',
        thumbnailUrl: 'https://example.com/thumb3.jpg',
        bannerUrl: 'https://example.com/banner3.jpg',
        duration: '5 weeks',
        category: 'mental',
        tags: ['mental-health', 'mindfulness'],
        status: 'published',
        videos: [{ title: 'Video 1', duration: '25:00', durationInSeconds: 1500, videoUrl: 'https://example.com/v3.mp4', order: 1 }]
      })
    ];

    silverCourses = [
      bronzeCourse,
      copperCourses[1],
      copperCourses[2],
      await Course.create({
        title: 'Financial Wellness',
        description: 'Financial wellness course',
        color: '#10B981',
        icon: 'dollar',
        thumbnailUrl: 'https://example.com/thumb4.jpg',
        bannerUrl: 'https://example.com/banner4.jpg',
        duration: '4 weeks',
        category: 'financial',
        tags: ['finance', 'money'],
        status: 'published',
        videos: [{ title: 'Video 1', duration: '30:00', durationInSeconds: 1800, videoUrl: 'https://example.com/v4.mp4', order: 1 }]
      }),
      await Course.create({
        title: 'Relationship & Family Wellness',
        description: 'Relationship wellness course',
        color: '#F59E0B',
        icon: 'heart',
        thumbnailUrl: 'https://example.com/thumb5.jpg',
        bannerUrl: 'https://example.com/banner5.jpg',
        duration: '6 weeks',
        category: 'relationship',
        tags: ['relationships', 'family'],
        status: 'published',
        videos: [{ title: 'Video 1', duration: '35:00', durationInSeconds: 2100, videoUrl: 'https://example.com/v5.mp4', order: 1 }]
      })
    ];
  });

  afterEach(async () => {
    // Clean up after each test
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await Group.deleteMany({});
    await GroupMember.deleteMany({});
  });

  describe('Bronze Membership', () => {
    it('should auto-enroll in Physical Wellness course only', async () => {
      const expectedCourseTitle = 'Physical Wellness';
      const expectedCourses = 1;

      expect(MEMBERSHIP_COURSE_ACCESS.bronze).toContain(expectedCourseTitle);
      expect(MEMBERSHIP_COURSE_ACCESS.bronze).toHaveLength(expectedCourses);
    });

    it('should create enrollment record for bronze plan courses', async () => {
      const req = {
        user: { _id: testUser._id },
        body: { plan: 'bronze' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      await purchaseMembership(req, res);

      // Check enrollment was created
      const enrollments = await Enrollment.find({ userId: testUser._id });
      expect(enrollments).toHaveLength(1);
      expect(enrollments[0].courseId.toString()).toBe(bronzeCourse._id.toString());
    });

    it('should create community group for bronze plan course', async () => {
      const req = {
        user: { _id: testUser._id },
        body: { plan: 'bronze' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      await purchaseMembership(req, res);

      // Check group was created
      const groups = await Group.find({ courseId: bronzeCourse._id });
      expect(groups).toHaveLength(1);
      expect(groups[0].name).toContain('Physical Wellness');
    });

    it('should add user as member to bronze plan community group', async () => {
      const req = {
        user: { _id: testUser._id },
        body: { plan: 'bronze' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      await purchaseMembership(req, res);

      // Check user is group member
      const group = await Group.findOne({ courseId: bronzeCourse._id });
      const groupMember = await GroupMember.findOne({
        groupId: group._id,
        userId: testUser._id
      });
      expect(groupMember).toBeTruthy();
      expect(groupMember.role).toBe('member');
    });

    it('should update course enrollment count', async () => {
      const req = {
        user: { _id: testUser._id },
        body: { plan: 'bronze' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      await purchaseMembership(req, res);

      // Reload course to check enrollment count
      const updatedCourse = await Course.findById(bronzeCourse._id);
      expect(updatedCourse.enrollmentCount).toBe(1);
    });

    it('should not create duplicate enrollment if user already enrolled', async () => {
      // First enrollment
      const req1 = {
        user: { _id: testUser._id },
        body: { plan: 'bronze' }
      };
      const res1 = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      await purchaseMembership(req1, res1);

      // Try to purchase bronze again
      testUser.subscriptionPlan = 'free'; // Reset plan
      await testUser.save();

      const req2 = {
        user: { _id: testUser._id },
        body: { plan: 'bronze' }
      };
      const res2 = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      await purchaseMembership(req2, res2);

      // Should still have only 1 enrollment
      const enrollments = await Enrollment.find({ userId: testUser._id });
      expect(enrollments).toHaveLength(1);
    });
  });

  describe('Copper Membership', () => {
    it('should auto-enroll in 3 courses for copper plan', async () => {
      const expectedCourses = 3;
      expect(MEMBERSHIP_COURSE_ACCESS.copper).toHaveLength(expectedCourses);
    });

    it('should create enrollment records for all copper plan courses', async () => {
      const req = {
        user: { _id: testUser._id },
        body: { plan: 'copper' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      await purchaseMembership(req, res);

      // Check all 3 enrollments were created
      const enrollments = await Enrollment.find({ userId: testUser._id });
      expect(enrollments).toHaveLength(3);

      const enrolledCourseIds = enrollments.map(e => e.courseId.toString());
      copperCourses.forEach(course => {
        expect(enrolledCourseIds).toContain(course._id.toString());
      });
    });

    it('should create community groups for all copper plan courses', async () => {
      const req = {
        user: { _id: testUser._id },
        body: { plan: 'copper' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      await purchaseMembership(req, res);

      // Check groups were created for all courses
      const groups = await Group.find({});
      expect(groups).toHaveLength(3);
    });
  });

  describe('Silver Membership', () => {
    it('should auto-enroll in 5 courses for silver plan', async () => {
      const expectedCourses = 5;
      expect(MEMBERSHIP_COURSE_ACCESS.silver).toHaveLength(expectedCourses);
    });

    it('should create enrollment records for all silver plan courses', async () => {
      const req = {
        user: { _id: testUser._id },
        body: { plan: 'silver' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      await purchaseMembership(req, res);

      // Check all 5 enrollments were created
      const enrollments = await Enrollment.find({ userId: testUser._id });
      expect(enrollments).toHaveLength(5);

      const enrolledCourseIds = enrollments.map(e => e.courseId.toString());
      silverCourses.forEach(course => {
        expect(enrolledCourseIds).toContain(course._id.toString());
      });
    });
  });

  describe('Admin Membership Update', () => {
    it('should auto-enroll user when admin updates membership', async () => {
      const req = {
        params: { id: testUser._id },
        body: {
          subscriptionPlan: 'bronze',
          autoEnroll: true
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      await updateUserMembership(req, res);

      // Check enrollment was created
      const enrollments = await Enrollment.find({ userId: testUser._id });
      expect(enrollments).toHaveLength(1);
    });

    it('should not auto-enroll when autoEnroll is false', async () => {
      const req = {
        params: { id: testUser._id },
        body: {
          subscriptionPlan: 'bronze',
          autoEnroll: false
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      await updateUserMembership(req, res);

      // Check no enrollment was created
      const enrollments = await Enrollment.find({ userId: testUser._id });
      expect(enrollments).toHaveLength(0);
    });

    it('should skip enrollment for courses user already enrolled in', async () => {
      // Manually enroll user in one course first
      await Enrollment.create({
        userId: testUser._id,
        courseId: bronzeCourse._id,
        currentVideoId: bronzeCourse.videos[0]._id
      });

      // Update to bronze membership
      const req = {
        params: { id: testUser._id },
        body: {
          subscriptionPlan: 'bronze',
          autoEnroll: true
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      await updateUserMembership(req, res);

      // Should still have only 1 enrollment (no duplicate)
      const enrollments = await Enrollment.find({ userId: testUser._id });
      expect(enrollments).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle case-insensitive course title matching', async () => {
      // Create course with different case
      const lowercaseCourse = await Course.create({
        title: 'physical wellness',
        description: 'Lowercase title course',
        color: '#8B5CF6',
        icon: 'fitness',
        thumbnailUrl: 'https://example.com/thumb-lower.jpg',
        bannerUrl: 'https://example.com/banner-lower.jpg',
        duration: '6 weeks',
        category: 'physical',
        tags: ['wellness'],
        status: 'published',
        videos: [{ title: 'Video 1', duration: '15:00', durationInSeconds: 900, videoUrl: 'https://example.com/v1l.mp4', order: 1 }]
      });

      // Delete original course to force matching with lowercase
      await Course.deleteOne({ _id: bronzeCourse._id });

      const req = {
        user: { _id: testUser._id },
        body: { plan: 'bronze' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      await purchaseMembership(req, res);

      // Should find and enroll in lowercase course
      const enrollments = await Enrollment.find({ userId: testUser._id });
      expect(enrollments).toHaveLength(1);
      expect(enrollments[0].courseId.toString()).toBe(lowercaseCourse._id.toString());
    });

    it('should handle course with extra whitespace in title', async () => {
      const whitespaceCourse = await Course.create({
        title: '  Physical Wellness  ',
        description: 'Whitespace course',
        color: '#8B5CF6',
        icon: 'fitness',
        thumbnailUrl: 'https://example.com/thumb-space.jpg',
        bannerUrl: 'https://example.com/banner-space.jpg',
        duration: '6 weeks',
        category: 'physical',
        tags: ['wellness'],
        status: 'published',
        videos: [{ title: 'Video 1', duration: '15:00', durationInSeconds: 900, videoUrl: 'https://example.com/v1s.mp4', order: 1 }]
      });

      // Delete original course
      await Course.deleteOne({ _id: bronzeCourse._id });

      const req = {
        user: { _id: testUser._id },
        body: { plan: 'bronze' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      await purchaseMembership(req, res);

      // Should find and enroll in course with whitespace
      const enrollments = await Enrollment.find({ userId: testUser._id });
      expect(enrollments).toHaveLength(1);
      expect(enrollments[0].courseId.toString()).toBe(whitespaceCourse._id.toString());
    });

    it('should handle invalid plan gracefully', async () => {
      const req = {
        user: { _id: testUser._id },
        body: { plan: 'invalid_plan' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      await purchaseMembership(req, res);

      // Should return 400 error
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Invalid plan')
        })
      );

      // No enrollments should be created
      const enrollments = await Enrollment.find({ userId: testUser._id });
      expect(enrollments).toHaveLength(0);
    });

    it('should handle no published courses for plan', async () => {
      // Delete all published courses
      await Course.deleteMany({});

      const req = {
        user: { _id: testUser._id },
        body: { plan: 'bronze' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      await purchaseMembership(req, res);

      // Should return 400 error
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('No published courses')
        })
      );
    });
  });
});
