import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Review target (product or shop)
  reviewType: {
    type: String,
    enum: ['product', 'shop'],
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    index: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    index: true
  },
  // Order reference (for verified purchases)
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  // Images
  images: [{
    url: String,
    alt: String
  }],
  // Helpful votes
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulVotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isHelpful: Boolean,
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Shop response
  shopResponse: {
    comment: String,
    respondedAt: Date
  },
  // Moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved'
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ product: 1, user: 1 });
reviewSchema.index({ shop: 1, user: 1 });
reviewSchema.index({ rating: -1, createdAt: -1 });
reviewSchema.index({ isVerifiedPurchase: 1 });

// Ensure user can only review a product/shop once per order
reviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true, sparse: true });
reviewSchema.index({ shop: 1, user: 1, order: 1 }, { unique: true, sparse: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
