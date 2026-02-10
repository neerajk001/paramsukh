import { Post, Comment } from '../../models/community.models.js';

// @desc    Get all community posts (Admin only)
// @route   GET /api/community/all
// @access  Admin
export const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;

        const query = { isActive: true }; // Only show active posts

        if (search) {
            query.content = { $regex: search, $options: 'i' };
        }

        const posts = await Post.find(query)
            .populate('userId', 'displayName email photoURL')
            .populate('groupId', 'name')
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

// @desc    Delete a post (Admin only)
// @route   DELETE /api/community/posts/:postId
// @access  Admin
export const deletePostAdmin = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Soft delete
        post.isActive = false;
        await post.save();

        // Also soft delete all comments
        await Comment.updateMany({ postId }, { isActive: false });

        console.log(`🗑️ Admin deleted post ${postId}`);

        res.status(200).json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Delete Post Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete post',
            error: error.message
        });
    }
};

// @desc    Pin/Unpin a post (Admin only)
// @route   PATCH /api/community/posts/:postId/pin
// @access  Admin
export const togglePinPost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        post.isPinned = !post.isPinned;
        await post.save();

        console.log(`📌 Admin ${post.isPinned ? 'pinned' : 'unpinned'} post ${postId}`);

        res.status(200).json({
            success: true,
            message: `Post ${post.isPinned ? 'pinned' : 'unpinned'} successfully`,
            data: { isPinned: post.isPinned }
        });
    } catch (error) {
        console.error('Toggle Pin Post Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle pin status',
            error: error.message
        });
    }
};
