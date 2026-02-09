import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Prevent duplicate products in wishlist
wishlistSchema.index({ user: 1, 'items.product': 1 });

// Add product to wishlist
wishlistSchema.methods.addProduct = async function(productId) {
  const exists = this.items.some(item => item.product.toString() === productId.toString());
  
  if (!exists) {
    this.items.push({ product: productId });
    await this.save();
  }
  
  return this;
};

// Remove product from wishlist
wishlistSchema.methods.removeProduct = async function(productId) {
  this.items = this.items.filter(item => item.product.toString() !== productId.toString());
  await this.save();
  return this;
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
