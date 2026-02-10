import { Post } from '../../models/community.models.js';

// @desc    Get all community posts (Admin only)
// @route   GET /api/community/all
// @access  Admin
export const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { content: { $regex: search, $options: 'i' } },
                { 'author.name': { $regex: search, $options: 'i' } }
            ];
        }

        const posts = await Post.find(query)
            .populate('author', 'displayName email photoURL')
            .populate('group', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await Post.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                posts,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalItems: total
                }
            }
        });
    } catch (error) {
        console.error('Get All Posts Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve posts',
            error: error.message
        });
    }
};
