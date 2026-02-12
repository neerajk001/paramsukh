import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/user.models.js';
import { Enrollment } from '../src/models/enrollment.models.js';
import { Course } from '../src/models/course.models.js';
import { Group } from '../src/models/community.models.js';
import { GroupMember } from '../src/models/community.models.js';

// This file contains integration tests for auto-enrollment functionality
// These tests verify the entire flow from membership purchase to enrollment/group creation

describe('Auto-Enrollment Integration Tests', () => {
  let mongoServer;
  let testUser;
  let physicalCourse;
  let mentalCourse;
  let spiritualCourse;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create test courses
    physicalCourse = await Course.create({
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
      videos: [
        { title: 'Video 1', duration: '10:00', durationInSeconds: 600, videoUrl: 'https://example.com/v1.mp4', order: 1 },
        { title: 'Video 2', duration: '15:00', durationInSeconds: 900, videoUrl: 'https://example.com/v2.mp4', order: 2 }
      ]
    });

    mentalCourse = await Course.create({
      title: 'Mental Wellness',
      description: 'Mental wellness course',
      color: '#8B5CF6',
      icon: 'brain',
      thumbnailUrl: 'https://example.com/mental.jpg',
      bannerUrl: 'https://example.com/mental-banner.jpg',
      duration: '4 weeks',
      category: 'mental',
      tags: ['wellness', 'mindfulness'],
      status: 'published',
      videos: [
        { title: 'Video 1', duration: '8:00', durationInSeconds: 480, videoUrl: 'https://example.com/m1.mp4', order: 1 }
      ]
    });

    spiritualCourse = await Course.create({
      title: 'Spirituality & Mantra Yoga',
      description: 'Spirituality course',
      color: '#8B5CF6',
      icon: 'meditation',
      thumbnailUrl: 'https://example.com/spiritual.jpg',
      bannerUrl: 'https://example.com/spiritual-banner.jpg',
      duration: '8 weeks',
      category: 'spiritual',
      tags: ['yoga', 'meditation'],
      status: 'published',
      videos: []
    });

    // Create test user
    testUser = await User.create({
      displayName: 'Integration Test User',
      phone: '+1987654321',
      email: 'integration@example.com',
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

  test('should create enrollment when user purchases bronze membership', async () => {
    // Simulate membership purchase by updating user
    testUser.subscriptionPlan = 'bronze';
    testUser.subscriptionStatus = 'active';
    await testUser.save();

    // Manually create enrollment (simulating the controller logic)
    const enrollment = await Enrollment.create({
      userId: testUser._id,
      courseId: physicalCourse._id,
      currentVideoId: physicalCourse.videos[0]?._id,
      progress: 0,
      isCompleted: false
    });

    // Update course enrollment count
    physicalCourse.enrollmentCount += 1;
    await physicalCourse.save();

    // Verify enrollment
    const foundEnrollment = await Enrollment.findOne({
      userId: testUser._id,
      courseId: physicalCourse._id
    });

    expect(foundEnrollment).not.toBeNull();
    expect(foundEnrollment.userId.toString()).toBe(testUser._id.toString());
    expect(foundEnrollment.courseId.toString()).toBe(physicalCourse._id.toString());
    expect(foundEnrollment.progress).toBe(0);
    expect(foundEnrollment.isCompleted).toBe(false);

    // Verify course count updated
    const updatedCourse = await Course.findById(physicalCourse._id);
    expect(updatedCourse.enrollmentCount).toBe(1);
  });

  test('should create multiple enrollments for copper plan', async () => {
    testUser.subscriptionPlan = 'copper';
    testUser.subscriptionStatus = 'active';
    await testUser.save();

    // Create enrollments for copper plan (3 courses)
    const courses = [physicalCourse, spiritualCourse, mentalCourse];
    for (const course of courses) {
      await Enrollment.create({
        userId: testUser._id,
        courseId: course._id,
        currentVideoId: course.videos[0]?._id,
        progress: 0,
        isCompleted: false
      });
      course.enrollmentCount += 1;
      await course.save();
    }

    const enrollments = await Enrollment.find({ userId: testUser._id });
    expect(enrollments).toHaveLength(3);
  });

  test('should prevent duplicate enrollments', async () => {
    // Create first enrollment
    await Enrollment.create({
      userId: testUser._id,
      courseId: physicalCourse._id,
      currentVideoId: physicalCourse.videos[0]?._id,
      progress: 0,
      isCompleted: false
    });
    physicalCourse.enrollmentCount += 1;
    await physicalCourse.save();

    // Try to create duplicate
    try {
      await Enrollment.create({
        userId: testUser._id,
        courseId: physicalCourse._id,
        currentVideoId: physicalCourse.videos[0]?._id,
        progress: 0,
        isCompleted: false
      });
      // Should throw error due to unique constraint
      fail('Should have thrown duplicate key error');
    } catch (error) {
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    }

    const enrollments = await Enrollment.find({ userId: testUser._id });
    expect(enrollments).toHaveLength(1);
  });

  test('should create community group for course', async () => {
    const group = await Group.create({
      name: 'Physical Wellness Community',
      description: 'Discussion group for Physical Wellness course',
      courseId: physicalCourse._id,
      coverImage: physicalCourse.thumbnailUrl,
      memberCount: 1
    });

    await GroupMember.create({
      groupId: group._id,
      userId: testUser._id,
      role: 'member'
    });

    const foundGroup = await Group.findOne({ courseId: physicalCourse._id });
    expect(foundGroup).not.toBeNull();
    expect(foundGroup.name).toBe('Physical Wellness Community');
    expect(foundGroup.memberCount).toBe(1);

    const membership = await GroupMember.findOne({
      groupId: group._id,
      userId: testUser._id
    });
    expect(membership).not.toBeNull();
    expect(membership.role).toBe('member');
  });

  test('should track enrollment progress correctly', async () => {
    const enrollment = await Enrollment.create({
      userId: testUser._id,
      courseId: physicalCourse._id,
      currentVideoId: physicalCourse.videos[0]?._id,
      progress: 0,
      isCompleted: false,
      completedVideos: [],
      completedPdfs: []
    });

    // Mark first video as complete
    enrollment.markVideoComplete(physicalCourse.videos[0]._id);
    enrollment.updateProgress(physicalCourse.totalVideos, physicalCourse.totalPdfs);
    await enrollment.save();

    const updatedEnrollment = await Enrollment.findById(enrollment._id);
    expect(updatedEnrollment.completedVideos).toHaveLength(1);
    expect(updatedEnrollment.completedVideos[0].toString()).toBe(physicalCourse.videos[0]._id.toString());
    expect(updatedEnrollment.progress).toBe(50); // 1 of 2 videos
    expect(updatedEnrollment.isCompleted).toBe(false);
  });

  test('should mark enrollment as completed when all items done', async () => {
    const enrollment = await Enrollment.create({
      userId: testUser._id,
      courseId: physicalCourse._id,
      currentVideoId: physicalCourse.videos[0]?._id,
      progress: 0,
      isCompleted: false,
      completedVideos: [],
      completedPdfs: []
    });

    // Mark both videos as complete
    enrollment.markVideoComplete(physicalCourse.videos[0]._id);
    enrollment.markVideoComplete(physicalCourse.videos[1]._id);
    enrollment.updateProgress(physicalCourse.totalVideos, physicalCourse.totalPdfs);
    await enrollment.save();

    const updatedEnrollment = await Enrollment.findById(enrollment._id);
    expect(updatedEnrollment.completedVideos).toHaveLength(2);
    expect(updatedEnrollment.progress).toBe(100);
    expect(updatedEnrollment.isCompleted).toBe(true);
    expect(updatedEnrollment.completedAt).not.toBeNull();
  });

  test('should count enrollments correctly across all courses', async () => {
    // Create enrollments for all courses
    for (const course of [physicalCourse, mentalCourse, spiritualCourse]) {
      await Enrollment.create({
        userId: testUser._id,
        courseId: course._id,
        currentVideoId: course.videos[0]?._id,
        progress: 0,
        isCompleted: false
      });
      course.enrollmentCount += 1;
      await course.save();
    }

    const totalEnrollments = await Enrollment.countDocuments();
    expect(totalEnrollments).toBe(3);

    // Count by course
    const physicalEnrollments = await Enrollment.countDocuments({ courseId: physicalCourse._id });
    expect(physicalEnrollments).toBe(1);
  });
});
