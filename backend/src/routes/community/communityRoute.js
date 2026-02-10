import express from 'express';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';
import { adminAuth } from '../../middleware/adminAuth.js';
import { contentCreationLimiter } from '../../middleware/rateLimiter.js';
import { validateCreatePost, validateCreateComment } from '../../middleware/validators.js';
import {
  checkCommunityAccess,
  getMyGroups,
  getGroupPosts,
  createPost,
  togglePostLike,
  getPostComments,
  addComment,
  toggleCommentLike,
  deletePost
} from '../../controller/community/community.controller.js';
import { getAllPosts } from '../../controller/community/admin.community.controller.js';

const router = express.Router();

// Admin routes
router.get('/all', adminAuth, getAllPosts);

// All other community routes require authentication
router.use(protectedRoutes);

// ========================================
// Community Access
// ========================================
router.get('/check-access', checkCommunityAccess);

// ========================================
// Groups
// ========================================
router.get('/my-groups', getMyGroups);
router.get('/groups/:groupId/posts', getGroupPosts);
router.post('/groups/:groupId/posts', contentCreationLimiter, validateCreatePost, createPost);

// ========================================
// Posts
// ========================================
router.post('/posts/:postId/like', togglePostLike);
router.delete('/posts/:postId', deletePost);

// ========================================
// Comments
// ========================================
router.get('/posts/:postId/comments', getPostComments);
router.post('/posts/:postId/comments', contentCreationLimiter, validateCreateComment, addComment);
router.post('/comments/:commentId/like', toggleCommentLike);

export default router;
