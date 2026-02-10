import Order from '../../models/order.models.js';
import Cart from '../../models/cart.models.js';
import Product from '../../models/product.models.js';
import Shop from '../../models/shop.models.js';
import Address from '../../models/address.models.js';
import { sendNotification } from '../notifications/notifications.controller.js';

// @desc    Create order from cart
// @route   POST /api/orders/create
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId, paymentMethod, customerNotes } = req.body;

    // Get cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Get delivery address
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Delivery address not found'
      });
    }

    // Verify stock for all items
    for (const item of cart.items) {
      if (!item.product.isAvailable(item.quantity)) {
        return res.status(400).json({
          success: false,
          message: `${item.product.name} is out of stock or has insufficient quantity`
        });
      }
    }

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      productName: item.product.name,
      productImage: item.product.images[0]?.url || '',
      shop: item.product.shop,
      quantity: item.quantity,
      variant: item.variant,
      price: item.price,
      tax: Math.round((item.price * item.quantity * 0.18) * 100) / 100,
      subtotal: item.price * item.quantity
    }));

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      deliveryAddress: {
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        landmark: address.landmark,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country
      },
      pricing: {
        subtotal: cart.subtotal,
        discount: cart.discount,
        shippingCharge: cart.shippingCharge,
        tax: cart.tax,
        total: cart.total
      },
      coupon: cart.coupon,
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'pending'
      },
      customerNotes,
      status: 'pending'
    });

    await order.save();

    // Update product inventory
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product.inventory.isUnlimited) {
        product.inventory.stock -= item.quantity;
      }
      product.stats.soldCount += item.quantity;
      await product.save();
    }

    // Clear cart
    await cart.clearCart();

    // Send notification
    await sendNotification(userId, {
      type: 'system',
      title: 'Order Placed Successfully',
      message: `Your order #${order.orderNumber} has been placed successfully`,
      icon: '🛍️',
      priority: 'high',
      relatedId: order._id,
      relatedType: 'order',
      actionUrl: `/orders/${order._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/all
// @access  Admin
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const query = {};
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'deliveryAddress.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('user', 'displayName email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Get All Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
      error: error.message
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Get My Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
      error: error.message
    });
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
export const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId })
      .populate('items.product', 'name images')
      .populate('items.shop', 'name slug phone email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get Order Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { reason, comment } = req.body;

    const order = await Order.findOne({ _id: id, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = Date.now();
    order.cancellation = {
      reason: reason || 'User requested cancellation',
      comment: comment || '',
      cancelledBy: userId
    };

    await order.updateStatus('cancelled', 'Cancelled by user', userId);

    // Restore inventory
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product && !product.inventory.isUnlimited) {
        product.inventory.stock += item.quantity;
        await product.save();
      }
    }

    // Send notification
    await sendNotification(userId, {
      type: 'system',
      title: 'Order Cancelled',
      message: `Order #${order.orderNumber} has been cancelled`,
      icon: '❌',
      priority: 'medium'
    });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Cancel Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

// @desc    Request return
// @route   POST /api/orders/:id/return
// @access  Private
export const requestReturn = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { reason, comment, images } = req.body;

    const order = await Order.findOne({ _id: id, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Only delivered orders can be returned'
      });
    }

    // Check if return window is still open (e.g., 7 days)
    const daysSinceDelivery = (Date.now() - order.deliveredAt) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 7) {
      return res.status(400).json({
        success: false,
        message: 'Return window has expired (7 days from delivery)'
      });
    }

    order.returnRequest = {
      reason: reason || 'Product issue',
      comment: comment || '',
      images: images || [],
      requestedAt: Date.now(),
      status: 'pending'
    };

    await order.save();

    // Send notification
    await sendNotification(userId, {
      type: 'system',
      title: 'Return Request Submitted',
      message: `Return request for order #${order.orderNumber} is being processed`,
      icon: '🔄',
      priority: 'medium'
    });

    res.status(200).json({
      success: true,
      message: 'Return request submitted successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Request Return Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request return',
      error: error.message
    });
  }
};

// @desc    Track order
// @route   GET /api/orders/:id/track
// @access  Private
export const trackOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId })
      .select('orderNumber status statusHistory tracking estimatedDelivery');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { tracking: order }
    });
  } catch (error) {
    console.error('Track Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track order',
      error: error.message
    });
  }
};

// @desc    Get order invoice
// @route   GET /api/orders/:id/invoice
// @access  Private
export const getInvoice = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId })
      .populate('items.product', 'name')
      .populate('items.shop', 'name address gstNumber');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // In a real app, you'd generate a PDF invoice here
    res.status(200).json({
      success: true,
      data: {
        invoice: {
          orderNumber: order.orderNumber,
          invoiceNumber: order.invoiceNumber || `INV${order.orderNumber}`,
          date: order.createdAt,
          customer: order.deliveryAddress,
          items: order.items,
          pricing: order.pricing
        }
      }
    });
  } catch (error) {
    console.error('Get Invoice Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get invoice',
      error: error.message
    });
  }
};
