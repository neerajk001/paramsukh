// Razorpay Payment Service for React Native
import { Alert } from 'react-native';
// import RazorpayCheckout from 'react-native-razorpay'; // Install: npm install react-native-razorpay

import { API_BASE_URL as API_URL } from '../config/api';

/**
 * Purchase membership plan
 */
export const purchaseMembership = async (authToken, plan, amount, userDetails) => {
  try {
    // Step 1: Create payment order from backend
    const orderResponse = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan, amount }),
    });

    const orderData = await orderResponse.json();

    if (!orderData.success) {
      throw new Error(orderData.message);
    }

    const { orderId, amount: orderAmount, currency, keyId, testMode } = orderData.data;

    // Step 2: Open Razorpay checkout
    if (testMode) {
      // Test mode - simulate payment
      return await simulateTestPayment(authToken, orderId, plan);
    }

    // Production mode - use real Razorpay
    // Uncomment when you add react-native-razorpay
    /*
    const options = {
      description: `${plan.toUpperCase()} Membership`,
      image: 'https://your-logo-url.png',
      currency: currency,
      key: keyId,
      amount: orderAmount,
      name: 'ParamSukh',
      order_id: orderId,
      prefill: {
        email: userDetails.email || '',
        contact: userDetails.phone || '',
        name: userDetails.displayName || '',
      },
      theme: { color: '#6366F1' }
    };

    const paymentData = await RazorpayCheckout.open(options);

    // Step 3: Verify payment on backend
    const verifyResponse = await fetch(`${API_URL}/payments/verify-membership`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        plan: plan,
      }),
    });

    const verifyData = await verifyResponse.json();

    if (verifyData.success) {
      Alert.alert('Success! 🎉', `${plan.toUpperCase()} membership activated!`);
      return verifyData.data;
    } else {
      throw new Error(verifyData.message);
    }
    */

    // For now, use test mode
    Alert.alert('Info', 'Using test mode payment. Add react-native-razorpay for production.');
    return await simulateTestPayment(authToken, orderId, plan);

  } catch (error) {
    console.error('Purchase membership error:', error);
    Alert.alert('Payment Failed', error.message || 'Failed to process payment');
    return null;
  }
};

/**
 * Simulate test payment (for development)
 */
const simulateTestPayment = async (authToken, orderId, plan) => {
  try {
    const mockPaymentData = {
      razorpay_order_id: orderId,
      razorpay_payment_id: `pay_test_${Date.now()}`,
      razorpay_signature: 'test_signature',
      plan: plan,
    };

    const response = await fetch(`${API_URL}/payments/verify-membership`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockPaymentData),
    });

    const data = await response.json();

    if (data.success) {
      Alert.alert('Success! 🎉', `${plan.toUpperCase()} membership activated! (Test Mode)`);
      return data.data;
    } else {
      throw new Error(data.message);
    }

  } catch (error) {
    console.error('Test payment error:', error);
    throw error;
  }
};

/**
 * Create booking payment order
 */
export const createBookingPayment = async (authToken, bookingId, amount) => {
  try {
    const response = await fetch(`${API_URL}/payments/create-booking-order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookingId, amount }),
    });

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }

  } catch (error) {
    console.error('Create booking payment error:', error);
    Alert.alert('Error', error.message);
    return null;
  }
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (authToken) => {
  try {
    const response = await fetch(`${API_URL}/payments/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.data.payments;
    } else {
      throw new Error(data.message);
    }

  } catch (error) {
    console.error('Get payment history error:', error);
    return [];
  }
};

/**
 * Membership plans configuration
 */
export const MEMBERSHIP_PLANS = {
  bronze: {
    name: 'Bronze',
    price: 999,
    features: [
      'Physical Wellness Course',
      'Community Access',
      'Basic Support',
    ],
    color: '#CD7F32',
  },
  copper: {
    name: 'Copper',
    price: 1999,
    features: [
      '3 Premium Courses',
      'Community Access',
      'Priority Support',
      '10% Counseling Discount',
    ],
    color: '#B87333',
  },
  silver: {
    name: 'Silver',
    price: 2999,
    features: [
      '5 Premium Courses',
      'Community Access',
      'Priority Support',
      '20% Counseling Discount',
      'Exclusive Events',
    ],
    color: '#C0C0C0',
  },
};

export default {
  purchaseMembership,
  createBookingPayment,
  getPaymentHistory,
  MEMBERSHIP_PLANS,
};
