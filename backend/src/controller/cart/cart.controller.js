import Cart from '../../models/cart.models.js';
import Product from '../../models/product.models.js';
import Coupon from '../../models/coupon.models.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name images pricing inventory shop',
        populate: { path: 'shop', select: 'name slug' }
      });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
    }

    // Recalculate totals
    cart.calculateTotals();
    await cart.save();

    res.status(200).json({
      success: true,
      data: { cart }
    });
  } catch (error) {
    console.error('Get Cart Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart',
      error: error.message
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1, variant } = req.body;

    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive'
      });
    }

    // Check stock availability
    if (!product.isAvailable(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Add item to cart
    await cart.addItem(productId, quantity, product.pricing.sellingPrice, variant);

    // Populate cart items
    await cart.populate({
      path: 'items.product',
      select: 'name images pricing inventory shop'
    });

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: { cart }
    });
  } catch (error) {
    console.error('Add to Cart Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

// @desc    Update cart item quantity
// @route   PATCH /api/cart/update/:itemId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Check stock for the product
    const item = cart.items.find(i => i._id.toString() === itemId);
    if (item) {
      const product = await Product.findById(item.product);
      if (!product.isAvailable(quantity)) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }
    }

    await cart.updateQuantity(itemId, quantity);

    await cart.populate({
      path: 'items.product',
      select: 'name images pricing inventory shop'
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: { cart }
    });
  } catch (error) {
    console.error('Update Cart Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: error.message
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.removeItem(itemId);

    await cart.populate({
      path: 'items.product',
      select: 'name images pricing inventory shop'
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: { cart }
    });
  } catch (error) {
    console.error('Remove from Cart Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item',
      error: error.message
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.clearCart();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: { cart }
    });
  } catch (error) {
    console.error('Clear Cart Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/apply-coupon
// @access  Private
export const applyCoupon = async (req, res) => {
  try {
    const userId = req.user._id;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Find coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Validate coupon
    const validity = await coupon.canUserUse(userId, cart.subtotal);
    if (!validity.valid) {
      return res.status(400).json({
        success: false,
        message: validity.message
      });
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(cart.subtotal);

    // Apply coupon to cart
    cart.coupon = {
      code: coupon.code,
      discount: discount,
      discountType: coupon.discountType
    };

    cart.calculateTotals();
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name images pricing inventory shop'
    });

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: { cart }
    });
  } catch (error) {
    console.error('Apply Coupon Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply coupon',
      error: error.message
    });
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/remove-coupon
// @access  Private
export const removeCoupon = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.coupon = {};
    cart.calculateTotals();
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name images pricing inventory shop'
    });

    res.status(200).json({
      success: true,
      message: 'Coupon removed',
      data: { cart }
    });
  } catch (error) {
    console.error('Remove Coupon Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove coupon',
      error: error.message
    });
  }
};
