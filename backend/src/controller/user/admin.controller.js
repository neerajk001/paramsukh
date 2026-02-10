import { User } from '../../models/user.models.js';
import { Enrollment } from '../../models/enrollment.models.js';
import { Course } from '../../models/course.models.js';
import { Group } from '../../models/community.models.js';
import { GroupMember } from '../../models/community.models.js';
import { MEMBERSHIP_COURSE_ACCESS } from '../../models/enrollment.models.js';

/**
 * Get all users (Admin only)
 * GET /api/user/all
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-__v')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
      total: users.length
    });
  } catch (error) {
    console.error('❌ Error fetching all users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

/**
 * Get user by ID (Admin only)
 * GET /api/user/:id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

/**
 * Update user membership (Admin only)
 * PATCH /api/user/:id/membership
 */
export const updateUserMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      subscriptionPlan, 
      subscriptionStatus, 
      subscriptionStartDate, 
      subscriptionEndDate,
      autoEnroll 
    } = req.body;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update subscription fields
    if (subscriptionPlan) user.subscriptionPlan = subscriptionPlan;
    if (subscriptionStatus) user.subscriptionStatus = subscriptionStatus;
    if (subscriptionStartDate) user.subscriptionStartDate = new Date(subscriptionStartDate);
    if (subscriptionEndDate) user.subscriptionEndDate = new Date(subscriptionEndDate);

    await user.save();

    // Auto-enroll in courses if requested
    if (autoEnroll && subscriptionPlan && subscriptionPlan !== 'free') {
      const courseTitles = MEMBERSHIP_COURSE_ACCESS[subscriptionPlan];
      
      if (courseTitles && courseTitles.length > 0) {
        const courses = await Course.find({
          title: { $in: courseTitles },
          status: 'published'
        });

        // Enroll in courses
        for (const course of courses) {
          const existingEnrollment = await Enrollment.findOne({ 
            userId: id, 
            courseId: course._id 
          });
          
          if (!existingEnrollment) {
            await Enrollment.create({
              userId: id,
              courseId: course._id,
              currentVideoId: course.videos.length > 0 ? course.videos[0]._id : null
            });
            
            course.enrollmentCount += 1;
            await course.save();
          }
        }

        // Add to community groups
        for (const course of courses) {
          let group = await Group.findOne({ courseId: course._id });
          
          if (!group) {
            group = await Group.create({
              name: `${course.title} Community`,
              description: `Discussion group for ${course.title} course members`,
              courseId: course._id,
              coverImage: course.thumbnail,
              memberCount: 0
            });
          }

          const existingMembership = await GroupMember.findOne({ 
            groupId: group._id, 
            userId: id 
          });

          if (!existingMembership) {
            await GroupMember.create({
              groupId: group._id,
              userId: id,
              role: 'member'
            });

            group.memberCount += 1;
            await group.save();
          }
        }

        console.log(`✅ Admin updated membership for user ${id}: ${subscriptionPlan} (auto-enrolled)`);
      }
    } else {
      console.log(`✅ Admin updated membership for user ${id}: ${subscriptionPlan}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Membership updated successfully',
      user
    });
  } catch (error) {
    console.error('❌ Error updating membership:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update membership',
      error: error.message
    });
  }
};

/**
 * Get user enrollments (Admin only)
 * GET /api/user/:userId/enrollments
 */
export const getUserEnrollments = async (req, res) => {
  try {
    const { userId } = req.params;

    const enrollments = await Enrollment.find({ userId })
      .populate('courseId', 'title thumbnail category')
      .sort({ enrolledAt: -1 });

    return res.status(200).json({
      success: true,
      enrollments,
      total: enrollments.length
    });
  } catch (error) {
    console.error('❌ Error fetching enrollments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: error.message
    });
  }
};

/**
 * Get user payments (Admin only)
 * GET /api/user/:userId/payments
 */
export const getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('payments');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // payments array from user model
    const payments = user.payments || [];

    return res.status(200).json({
      success: true,
      payments,
      total: payments.length
    });
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

/**
 * Get user activity (Admin only) - Optional
 * GET /api/user/:userId/activity
 */
export const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;

    // This is a placeholder - implement activity logging as needed
    // You could track: logins, enrollments, course progress, purchases, etc.
    
    const activities = [];

    return res.status(200).json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('❌ Error fetching activity:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch activity',
      error: error.message
    });
  }
};
