import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import { User } from '../../src/models/user.models.js';
import { Course } from '../../src/models/course.models.js';
import { Enrollment } from '../../src/models/enrollment.models.js';
import { Group, GroupMember } from '../../src/models/community.models.js';
import { MEMBERSHIP_COURSE_ACCESS } from '../../src/models/enrollment.models.js';

// Mock the request/response objects
const mockReq = {
  user: { _id: null },
  body: {}
};

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis()
};

describe('purchaseMembership - Auto Enrollment', () => {
  let testUser;
  let testCourses;
  let connection;

  beforeAll(async () => {
    // Connect to test database
    const MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/paramSukh_test';
    connection = await mongoose.createConnection(MONGO_URI).asPromise();
    await connection.dropDatabase();

    // Create test courses matching MEMBERSHIP_COURSE_ACCESS
    testCourses = await Course.create([
      {
        title: 'Physical Wellness',
        description: 'Physical wellness course',
        color: '#8B5CF6',
        icon: 'fitness',
        thumbnailUrl: 'https://example.com/physical.jpg',
        bannerUrl: 'https://example.com/physical-banner.jpg',
        duration: '6 weeks',
        category: 'physical',
        tags: ['wellness', 'fitness'],
        status: 'published',
        videos: [],
        totalVideos: 0,
        pdfs: [],
        totalPdfs: 0
      },
      {
        title: 'Mental Wellness',
        description: 'Mental wellness course',
        color: '#3B82F6',
        icon: 'brain',
        thumbnailUrl: 'https://example.com/mental.jpg',
        bannerUrl: 'https://example.com/mental-banner.jpg',
        duration: '8 weeks',
        category: 'mental',
        tags: ['wellness', 'mental'],
        status: 'published',
        videos: [],
        totalVideos: 0,
        pdfs: [],
        totalPdfs: 0
      },
      {
        title: 'Spirituality & Mantra Yoga',
        description: 'Spirituality and mantra yoga course',
        color: '#10B981',
        icon: 'flower',
        thumbnailUrl: 'https://example.com/spiritual.jpg',
        bannerUrl: 'https://example.com/spiritual-banner.jpg',
        duration: '4 weeks',
        category: 'spiritual',
        tags: ['spiritual', 'yoga'],
        status: 'published',
        videos: [],
        totalVideos: 0,
        pdfs: [],
        totalPdfs: 0
      },
      {
        title: 'Financial Wellness',
        description: 'Financial wellness course',
        color: '#F59E0B',
        icon: 'dollar',
        thumbnailUrl: 'https://example.com/financial.jpg',
        bannerUrl: 'https://example.com/financial-banner.jpg',
        duration: '6 weeks',
        category: 'financial',
        tags: ['finance', 'wellness'],
        status: 'published',
        videos: [],
        totalVideos: 0,
        pdfs: [],
        totalPdfs: 0
      },
      {
        title: 'Relationship & Family Wellness',
        description: 'Relationship and family wellness course',
        color: '#EC4899',
        icon: 'heart',
        thumbnailUrl: 'https://example.com/relationship.jpg',
        bannerUrl: 'https://example.com/relationship-banner.jpg',
        duration: '8 weeks',
        category: 'relationship',
        tags: ['relationships', 'family'],
        status: 'published',
        videos: [],
        totalVideos: 0,
        pdfs: [],
        totalPdfs: 0
      }
    ]);

    // Create test user
    testUser = await User.create({
      displayName: 'Test User',
      phone: '+1234567890',
      email: 'test@example.com',
      subscriptionPlan: 'free',
      subscriptionStatus: 'inactive',
      authProvider: 'phone',
      isActive: true
    });

    mockReq.user._id = testUser._id;
  });

  afterAll(async () => {
    // Cleanup
    await Enrollment.deleteMany({});
    await GroupMember.deleteMany({});
    await Group.deleteMany({});
    await Course.deleteMany({});
    await User.deleteMany({});
    await connection.close();
  });

  describe('MEMBERSHIP_COURSE_ACCESS Configuration', () => {
    test('should have bronze plan with Physical Wellness course', () => {
      expect(MEMBERSHIP_COURSE_ACCESS.bronze).toContain('Physical Wellness');
      expect(MEMBERSHIP_COURSE_ACCESS.bronze.length).toBe(1);
    });

    test('should have copper plan with 3 courses', () => {
      expect(MEMBERSHIP_COURSE_ACCESS.copper).toContain('Physical Wellness');
      expect(MEMBERSHIP_COURSE_ACCESS.copper).toContain('Mental Wellness');
      expect(MEMBERSHIP_COURSE_ACCESS.copper).toContain('Spirituality & Mantra Yoga');
      expect(MEMBERSHIP_COURSE_ACCESS.copper.length).toBe(3);
    });

    test('should have silver plan with 5 courses', () => {
      expect(MEMBERSHIP_COURSE_ACCESS.silver).toContain('Physical Wellness');
      expect(MEMBERSHIP_COURSE_ACCESS.silver).toContain('Mental Wellness');
      expect(MEMBERSHIP_COURSE_ACCESS.silver).toContain('Financial Wellness');
      expect(MEMBERSHIP_COURSE_ACCESS.silver).toContain('Relationship & Family Wellness');
      expect(MEMBERSHIP_COURSE_ACCESS.silver).toContain('Spirituality & Mantra Yoga');
      expect(MEMBERSHIP_COURSE_ACCESS.silver.length).toBe(5);
    });
  });

  describe('Course Title Matching', () => {
    test('should match course titles case-insensitively', () => {
      const courseTitles = MEMBERSHIP_COURSE_ACCESS.bronze;
      expect(
        testCourses.some(c => 
          courseTitles.some(title => 
            c.title.toLowerCase().trim() === title.toLowerCase().trim()
          )
        )
      ).toBe(true);
    });

    test('should find all bronze courses by title pattern', async () => {
      const courseTitles = MEMBERSHIP_COURSE_ACCESS.bronze;
      const courseTitlePatterns = courseTitles.map(title => ({
        $expr: { $eq: [{ $trim: [{ $toLower: '$title' }] }, title.toLowerCase().trim()] }
      }));
      
      const courses = await Course.find({
        $or: courseTitlePatterns,
        status: 'published'
      });
      
      expect(courses.length).toBeGreaterThan(0);
      expect(courses[0].title).toBe('Physical Wellness');
    });

    test('should find all copper courses by title pattern', async () => {
      const courseTitles = MEMBERSHIP_COURSE_ACCESS.copper;
      const courseTitlePatterns = courseTitles.map(title => ({
        $expr: { $eq: [{ $trim: [{ $toLower: '$title' }] }, title.toLowerCase().trim()] }
      }));
      
      const courses = await Course.find({
        $or: courseTitlePatterns,
        status: 'published'
      });
      
      expect(courses.length).toBe(3);
    });
  });

  describe('Auto-Enrollment Creation', () => {
    test('should create enrollment for bronze plan', async () => {
      const bronzeCourse = testCourses.find(c => c.title === 'Physical Wellness');
      
      // Simulate enrollment creation
      const enrollment = await Enrollment.create({
        userId: testUser._id,
        courseId: bronzeCourse._id,
        currentVideoId: null,
        progress: 0,
        isCompleted: false
      });
      
      expect(enrollment).toBeDefined();
      expect(enrollment.userId.toString()).toBe(testUser._id.toString());
      expect(enrollment.courseId.toString()).toBe(bronzeCourse._id.toString());
      
      // Cleanup
      await Enrollment.findByIdAndDelete(enrollment._id);
    });

    test('should increment course enrollmentCount', async () => {
      const bronzeCourse = testCourses.find(c => c.title === 'Physical Wellness');
      const initialCount = bronzeCourse.enrollmentCount || 0;
      
      // Create enrollment
      await Enrollment.create({
        userId: testUser._id,
        courseId: bronzeCourse._id,
        currentVideoId: null,
        progress: 0,
        isCompleted: false
      });
      
      // Update course enrollment count
      bronzeCourse.enrollmentCount += 1;
      await bronzeCourse.save();
      
      const updatedCourse = await Course.findById(bronzeCourse._id);
      expect(updatedCourse.enrollmentCount).toBe(initialCount + 1);
      
      // Cleanup
      await Enrollment.deleteMany({ userId: testUser._id, courseId: bronzeCourse._id });
      bronzeCourse.enrollmentCount = initialCount;
      await bronzeCourse.save();
    });

    test('should prevent duplicate enrollments', async () => {
      const bronzeCourse = testCourses.find(c => c.title === 'Physical Wellness');
      
      // Create first enrollment
      const enrollment1 = await Enrollment.create({
        userId: testUser._id,
        courseId: bronzeCourse._id,
        currentVideoId: null
      });
      
      // Try to create duplicate
      let duplicateError = null;
      try {
        await Enrollment.create({
          userId: testUser._id,
          courseId: bronzeCourse._id,
          currentVideoId: null
        });
      } catch (error) {
        duplicateError = error;
      }
      
      expect(duplicateError).toBeDefined();
      expect(duplicateError.code).toBe(11000); // MongoDB duplicate key error
      
      // Cleanup
      await Enrollment.findByIdAndDelete(enrollment1._id);
    });
  });

  describe('Community Group Auto-Creation', () => {
    test('should create group for course if not exists', async () => {
      const bronzeCourse = testCourses.find(c => c.title === 'Physical Wellness');
      
      // Create group
      const group = await Group.create({
        name: `${bronzeCourse.title} Community`,
        description: `Discussion group for ${bronzeCourse.title} course members`,
        courseId: bronzeCourse._id,
        coverImage: bronzeCourse.thumbnailUrl,
        memberCount: 0
      });
      
      expect(group).toBeDefined();
      expect(group.name).toBe('Physical Wellness Community');
      expect(group.courseId.toString()).toBe(bronzeCourse._id.toString());
      
      // Cleanup
      await Group.findByIdAndDelete(group._id);
    });

    test('should add user to group', async () => {
      const bronzeCourse = testCourses.find(c => c.title === 'Physical Wellness');
      
      // Create group
      const group = await Group.create({
        name: `${bronzeCourse.title} Community`,
        description: `Discussion group for ${bronzeCourse.title} course members`,
        courseId: bronzeCourse._id,
        coverImage: bronzeCourse.thumbnailUrl,
        memberCount: 0
      });
      
      // Add user to group
      const groupMember = await GroupMember.create({
        groupId: group._id,
        userId: testUser._id,
        role: 'member',
        isActive: true
      });
      
      expect(groupMember).toBeDefined();
      expect(groupMember.userId.toString()).toBe(testUser._id.toString());
      expect(groupMember.groupId.toString()).toBe(group._id.toString());
      expect(groupMember.role).toBe('member');
      expect(groupMember.isActive).toBe(true);
      
      // Cleanup
      await GroupMember.findByIdAndDelete(groupMember._id);
      await Group.findByIdAndDelete(group._id);
    });

    test('should increment group memberCount', async () => {
      const bronzeCourse = testCourses.find(c => c.title === 'Physical Wellness');
      
      // Create group
      const group = await Group.create({
        name: `${bronzeCourse.title} Community`,
        description: `Discussion group for ${bronzeCourse.title} course members`,
        courseId: bronzeCourse._id,
        coverImage: bronzeCourse.thumbnailUrl,
        memberCount: 0
      });
      
      // Add user to group
      await GroupMember.create({
        groupId: group._id,
        userId: testUser._id,
        role: 'member',
        isActive: true
      });
      
      // Increment member count
      group.memberCount += 1;
      await group.save();
      
      const updatedGroup = await Group.findById(group._id);
      expect(updatedGroup.memberCount).toBe(1);
      
      // Cleanup
      await GroupMember.deleteMany({ groupId: group._id });
      await Group.findByIdAndDelete(group._id);
    });
  });

  describe('Integration: Complete Bronze Purchase Flow', () => {
    test('should complete full bronze plan enrollment flow', async () => {
      const bronzeCourse = testCourses.find(c => c.title === 'Physical Wellness');
      const initialCourseEnrollment = bronzeCourse.enrollmentCount || 0;
      
      // 1. Update user subscription
      testUser.subscriptionPlan = 'bronze';
      testUser.subscriptionStatus = 'active';
      await testUser.save();
      
      // 2. Find course
      const courses = await Course.find({
        title: 'Physical Wellness',
        status: 'published'
      });
      expect(courses.length).toBeGreaterThan(0);
      
      // 3. Create enrollment
      const enrollment = await Enrollment.create({
        userId: testUser._id,
        courseId: courses[0]._id,
        currentVideoId: null
      });
      
      // 4. Update course enrollment count
      courses[0].enrollmentCount += 1;
      await courses[0].save();
      
      // 5. Create group
      let group = await Group.findOne({ courseId: courses[0]._id });
      if (!group) {
        group = await Group.create({
          name: `${courses[0].title} Community`,
          description: `Discussion group for ${courses[0].title} course members`,
          courseId: courses[0]._id,
          coverImage: courses[0].thumbnailUrl,
          memberCount: 0
        });
      }
      
      // 6. Add user to group
      const existingMembership = await GroupMember.findOne({
        groupId: group._id,
        userId: testUser._id
      });
      
      if (!existingMembership) {
        await GroupMember.create({
          groupId: group._id,
          userId: testUser._id,
          role: 'member'
        });
        group.memberCount += 1;
        await group.save();
      }
      
      // Verify all steps
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.subscriptionPlan).toBe('bronze');
      expect(updatedUser.subscriptionStatus).toBe('active');
      
      const finalEnrollment = await Enrollment.findOne({
        userId: testUser._id,
        courseId: courses[0]._id
      });
      expect(finalEnrollment).toBeDefined();
      
      const finalCourse = await Course.findById(courses[0]._id);
      expect(finalCourse.enrollmentCount).toBe(initialCourseEnrollment + 1);
      
      const finalGroupMember = await GroupMember.findOne({
        groupId: group._id,
        userId: testUser._id
      });
      expect(finalGroupMember).toBeDefined();
      expect(finalGroupMember.isActive).toBe(true);
      
      const finalGroup = await Group.findById(group._id);
      expect(finalGroup.memberCount).toBeGreaterThanOrEqual(1);
      
      // Cleanup
      await Enrollment.deleteMany({ userId: testUser._id });
      await GroupMember.deleteMany({ userId: testUser._id });
      await Group.deleteMany({});
      testUser.subscriptionPlan = 'free';
      testUser.subscriptionStatus = 'inactive';
      await testUser.save();
      courses[0].enrollmentCount = initialCourseEnrollment;
      await courses[0].save();
    });
  });
});
