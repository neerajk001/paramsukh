import express from 'express';
import { protectedRoutes } from '../../middleware/protectedRoutes.js';
import { uploadLimiter } from '../../middleware/rateLimiter.js';
import {
  uploadSingleImage as uploadSingleImageMiddleware,
  uploadMultipleImages as uploadMultipleImagesMiddleware,
  uploadSingleVideo,
  uploadProfilePhoto as uploadProfilePhotoMiddleware,
  handleMulterError
} from '../../middleware/uploadMiddleware.js';
import {
  uploadSingleImage,
  uploadImages,
  uploadProfilePhoto,
  uploadVideoFile,
  uploadProductImages,
  uploadCourseMedia,
  deleteUploadedFile,
  getUploadStatus
} from '../../controller/upload/upload.controller.js';

const router = express.Router();

// ========================================
// Upload Status (Public)
// ========================================

// Check if running in test mode or production
// GET /api/upload/status
router.get('/status', getUploadStatus);

// ========================================
// Image Upload Routes (Protected)
// ========================================

// Upload single image (general purpose)
// POST /api/upload/image
// @multipart file: image
// @query folder: optional folder name
router.post('/image',
  protectedRoutes,
  uploadSingleImageMiddleware,
  handleMulterError,
  uploadSingleImage
);

// Upload multiple images
// POST /api/upload/images
// @multipart files: images[]
// @query folder: optional folder name
router.post('/images',
  protectedRoutes,
  uploadMultipleImagesMiddleware,
  handleMulterError,
  uploadImages
);

// Upload profile photo
// POST /api/upload/profile-photo
// @multipart file: photo
router.post('/profile-photo',
  protectedRoutes,
  uploadProfilePhotoMiddleware,
  handleMulterError,
  uploadProfilePhoto
);

// Upload product images
// POST /api/upload/product-images
// @multipart files: images[]
router.post('/product-images',
  protectedRoutes,
  uploadMultipleImagesMiddleware,
  handleMulterError,
  uploadProductImages
);

// Upload course media (thumbnail/banner)
// POST /api/upload/course-media
// @multipart file: image
// @query type: thumbnail or banner
router.post('/course-media',
  protectedRoutes,
  uploadSingleImageMiddleware,
  handleMulterError,
  uploadCourseMedia
);

// ========================================
// Video Upload Routes (Protected)
// ========================================

// Upload video
// POST /api/upload/video
// @multipart file: video
// @query folder: optional folder name
router.post('/video',
  protectedRoutes,
  uploadSingleVideo,
  handleMulterError,
  uploadVideoFile
);

// ========================================
// Delete Routes (Protected)
// ========================================

// Delete uploaded file
// DELETE /api/upload/delete
// @body publicId: Cloudinary public ID
// @body resourceType: image or video
router.delete('/delete',
  protectedRoutes,
  deleteUploadedFile
);

export default router;
