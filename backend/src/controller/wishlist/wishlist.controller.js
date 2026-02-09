import Wishlist from '../../models/wishlist.models.js';
import Product from '../../models/product.models.js';
import Cart from '../../models/cart.models.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    let wishlist = await Wishlist.findOne({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name images pricing rating inventory shop',
        populate: { path: 'shop', select: 'name slug' }
      });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      data: { wishlist }
    });
  } catch (error) {
    console.error('Get Wishlist Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wishlist',
      error: error.message
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive'
      });
    }

    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
    }

    await wishlist.addProduct(productId);

    // Update product wishlist count
    product.stats.wishlistCount += 1;
    await product.save();

    await wishlist.populate({
      path: 'items.product',
      select: 'name images pricing rating inventory shop'
    });

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: { wishlist }
    });
  } catch (error) {
    console.error('Add to Wishlist Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist',
      error: error.message
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/remove/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    await wishlist.removeProduct(productId);

    // Update product wishlist count
    const product = await Product.findById(productId);
    if (product && product.stats.wishlistCount > 0) {
      product.stats.wishlistCount -= 1;
      await product.save();
    }

    await wishlist.populate({
      path: 'items.product',
      select: 'name images pricing rating inventory shop'
    });

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: { wishlist }
    });
  } catch (error) {
    console.error('Remove from Wishlist Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist',
      error: error.message
    });
  }
};

// @desc    Move item from wishlist to cart
// @route   POST /api/wishlist/move-to-cart/:productId
// @access  Private
export const moveToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

    // Get product
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive'
      });
    }

    // Check stock
    if (!product.isAvailable(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Add to cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }
    await cart.addItem(productId, quantity, product.pricing.sellingPrice);

    // Remove from wishlist
    const wishlist = await Wishlist.findOne({ user: userId });
    if (wishlist) {
      await wishlist.removeProduct(productId);
    }

    res.status(200).json({
      success: true,
      message: 'Product moved to cart',
      data: { cart }
    });
  } catch (error) {
    console.error('Move to Cart Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move product to cart',
      error: error.message
    });
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared',
      data: { wishlist }
    });
  } catch (error) {
    console.error('Clear Wishlist Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
      error: error.message
    });
  }
};
