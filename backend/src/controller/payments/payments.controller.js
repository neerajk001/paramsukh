import { 
  createRazorpayOrder, 
  verifyRazorpaySignature,
  fetchPaymentDetails,
  createRefund,
  isTestMode
} from '../../services/razorpayService.js';
import { User } from '../../models/user.models.js';
import Booking from '../../models/booking.models.js';
import Order from '../../models/order.models.js';

/**
 * Create payment order for membership
 * POST /api/payments/create-order
 */
export const createMembershipOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { plan, amount } = req.body;

    // Validate plan
    const validPlans = ['bronze', 'copper', 'silver'];
    if (!validPlans.includes(plan.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid membership plan'
      });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Create Razorpay order
    const order = await createRazorpayOrder({
      amount,
      currency: 'INR',
      receipt: `membership_${userId}_${Date.now()}`,
      notes: {
        type: 'membership',
        plan: plan,
        userId: userId.toString()
      }
    });

    console.log(`✅ Payment order created for user ${userId}, plan: ${plan}`);

    return res.status(200).json({
      success: true,
      message: 'Payment order created',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
        testMode: isTestMode()
      }
    });

  } catch (error) {
    console.error('❌ Create order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

/**
 * Verify payment and activate membership
 * POST /api/payments/verify-membership
 */
export const verifyMembershipPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      plan 
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !plan) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment details'
      });
    }

    // Verify signature (in test mode, accepts test_ prefixed IDs)
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature || 'test_signature'
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Fetch payment details
    let paymentDetails;
    try {
      paymentDetails = await fetchPaymentDetails(razorpay_payment_id);
    } catch (error) {
      console.error('⚠️ Could not fetch payment details:', error.message);
      // Continue with mock data in test mode
      paymentDetails = { amount: 0, status: 'captured' };
    }

    // Update user membership
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Activate membership
    user.subscriptionPlan = plan.toLowerCase();
    user.subscriptionStatus = 'active';
    user.subscriptionStartDate = new Date();
    user.subscriptionEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

    // Store payment info
    user.payments = user.payments || [];
    user.payments.push({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: paymentDetails.amount / 100, // Convert from paise
      plan: plan.toLowerCase(),
      status: 'completed',
      date: new Date()
    });

    await user.save();

    console.log(`✅ Membership activated for user ${userId}: ${plan}`);

    return res.status(200).json({
      success: true,
      message: `${plan} membership activated successfully!`,
      data: {
        plan: user.subscriptionPlan,
        status: user.subscriptionStatus,
        validUntil: user.subscriptionEndDate,
        paymentId: razorpay_payment_id
      }
    });

  } catch (error) {
    console.error('❌ Verify payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

/**
 * Create payment order for counseling booking
 * POST /api/payments/create-booking-order
 */
export const createBookingOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and amount are required'
      });
    }

    // Verify booking exists
    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Create Razorpay order
    const order = await createRazorpayOrder({
      amount,
      currency: 'INR',
      receipt: `booking_${bookingId}_${Date.now()}`,
      notes: {
        type: 'booking',
        bookingId: bookingId.toString(),
        userId: userId.toString()
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Booking payment order created',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
        testMode: isTestMode()
      }
    });

  } catch (error) {
    console.error('❌ Create booking order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking payment order',
      error: error.message
    });
  }
};

/**
 * Webhook handler for payment events
 * POST /api/payments/webhook
 */
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const payload = req.body;

    console.log('📩 Webhook received:', payload.event);

    // Handle different events
    switch (payload.event) {
      case 'payment.captured':
        console.log('✅ Payment captured:', payload.payload.payment.entity.id);
        break;
      
      case 'payment.failed':
        console.log('❌ Payment failed:', payload.payload.payment.entity.id);
        break;
      
      case 'refund.created':
        console.log('💰 Refund created:', payload.payload.refund.entity.id);
        break;
      
      default:
        console.log('ℹ️ Unhandled event:', payload.event);
    }

    return res.status(200).json({ status: 'ok' });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

/**
 * Get payment history for user
 * GET /api/payments/history
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('payments');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const payments = user.payments || [];

    return res.status(200).json({
      success: true,
      data: {
        payments: payments.reverse(), // Most recent first
        totalPayments: payments.length
      }
    });

  } catch (error) {
    console.error('❌ Get payment history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};

export default {
  createMembershipOrder,
  verifyMembershipPayment,
  createBookingOrder,
  handleWebhook,
  getPaymentHistory
};
