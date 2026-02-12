import { Enrollment } from '../../models/enrollment.models.js';
import { Course } from '../../models/course.models.js';

/**
 * Get overall enrollment statistics for admin dashboard
 * GET /api/enrollments/stats
 */
export const getEnrollmentStats = async (req, res) => {
  try {
    const [
      totalEnrollments,
      completedEnrollments,
      inProgressEnrollments,
      uniqueCoursesWithEnrollments,
      uniqueUsersWithEnrollments
    ] = await Promise.all([
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ isCompleted: true }),
      Enrollment.countDocuments({ isCompleted: false, progress: { $gt: 0 } }),
      Enrollment.distinct('courseId'),
      Enrollment.distinct('userId')
    ]);

    // Calculate average progress across all enrollments
    const allEnrollments = await Enrollment.find();
    const averageProgress = allEnrollments.length > 0
      ? Math.round(allEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / allEnrollments.length)
      : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalEnrollments,
        completedEnrollments,
        inProgressEnrollments,
        notStarted: totalEnrollments - completedEnrollments - inProgressEnrollments,
        averageProgress,
        coursesWithEnrollments: uniqueCoursesWithEnrollments.length,
        usersWithEnrollments: uniqueUsersWithEnrollments.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching enrollment stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get enrollment statistics by course
 * GET /api/enrollments/stats/courses
 */
export const getEnrollmentStatsByCourse = async (req, res) => {
  try {
    const courses = await Course.find({ status: 'published' })
      .select('title thumbnailUrl category enrollmentCount completionCount totalVideos totalPdfs')
      .sort({ enrollmentCount: -1 });

    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const enrollments = await Enrollment.find({ courseId: course._id });
        const completedCount = enrollments.filter(e => e.isCompleted).length;
        const averageProgress = enrollments.length > 0
          ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
          : 0;

        return {
          courseId: course._id,
          title: course.title,
          thumbnailUrl: course.thumbnailUrl,
          category: course.category,
          totalVideos: course.totalVideos,
          totalPdfs: course.totalPdfs,
          enrollmentCount: enrollments.length,
          completedCount,
          inProgressCount: enrollments.filter(e => !e.isCompleted && e.progress > 0).length,
          notStartedCount: enrollments.filter(e => e.progress === 0).length,
          averageProgress
        };
      })
    );

    return res.status(200).json({
      success: true,
      courses: courseStats
    });
  } catch (error) {
    console.error('❌ Error fetching course enrollment stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get recent enrollments
 * GET /api/enrollments/stats/recent
 */
export const getRecentEnrollments = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentEnrollments = await Enrollment.find()
      .populate({
        path: 'userId',
        select: 'displayName email photoURL phone'
      })
      .populate({
        path: 'courseId',
        select: 'title thumbnailUrl category'
      })
      .sort({ enrolledAt: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      enrollments: recentEnrollments
    });
  } catch (error) {
    console.error('❌ Error fetching recent enrollments:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
