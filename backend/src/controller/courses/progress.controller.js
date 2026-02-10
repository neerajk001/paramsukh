import { Enrollment } from '../../models/enrollment.models.js';
import { Course } from '../../models/course.models.js';

/**
 * Update video progress for a user's enrollment
 * POST /api/courses/:courseId/progress/video/:videoId
 */
export const markVideoComplete = async (req, res) => {
    try {
        const { courseId, videoId } = req.params;
        const userId = req.user._id;

        // Find the enrollment
        const enrollment = await Enrollment.findOne({ userId, courseId });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found. Please enroll in this course first.'
            });
        }

        // Find the course to get total videos and PDFs
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Mark video as complete
        enrollment.markVideoComplete(videoId);

        // Update current video
        enrollment.currentVideoId = videoId;
        enrollment.lastAccessedAt = new Date();

        // Recalculate progress
        const totalVideos = course.videos.length;
        const totalPdfs = course.pdfs.length;
        enrollment.updateProgress(totalVideos, totalPdfs);

        await enrollment.save();

        return res.status(200).json({
            success: true,
            message: 'Video marked as complete',
            data: {
                progress: enrollment.progress,
                completedVideos: enrollment.completedVideos,
                isCompleted: enrollment.isCompleted
            }
        });
    } catch (error) {
        console.error('Mark Video Complete Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update video progress',
            error: error.message
        });
    }
};

/**
 * Mark PDF as complete
 * POST /api/courses/:courseId/progress/pdf/:pdfId
 */
export const markPdfComplete = async (req, res) => {
    try {
        const { courseId, pdfId } = req.params;
        const userId = req.user._id;

        const enrollment = await Enrollment.findOne({ userId, courseId });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        enrollment.markPdfComplete(pdfId);
        enrollment.lastAccessedAt = new Date();

        const totalVideos = course.videos.length;
        const totalPdfs = course.pdfs.length;
        enrollment.updateProgress(totalVideos, totalPdfs);

        await enrollment.save();

        return res.status(200).json({
            success: true,
            message: 'PDF marked as complete',
            data: {
                progress: enrollment.progress,
                completedPdfs: enrollment.completedPdfs,
                isCompleted: enrollment.isCompleted
            }
        });
    } catch (error) {
        console.error('Mark PDF Complete Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update PDF progress',
            error: error.message
        });
    }
};

/**
 * Get enrollment progress for a course
 * GET /api/courses/:courseId/progress
 */
export const getEnrollmentProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id;

        const enrollment = await Enrollment.findOne({ userId, courseId });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Not enrolled in this course'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                progress: enrollment.progress,
                completedVideos: enrollment.completedVideos,
                completedPdfs: enrollment.completedPdfs,
                currentVideoId: enrollment.currentVideoId,
                isCompleted: enrollment.isCompleted,
                lastAccessedAt: enrollment.lastAccessedAt
            }
        });
    } catch (error) {
        console.error('Get Enrollment Progress Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get progress',
            error: error.message
        });
    }
};
