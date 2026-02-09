import { create } from 'zustand';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

interface User {
  _id: string;
  displayName: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  authProvider: 'google' | 'phone';
  subscriptionPlan: string;
  subscriptionStatus: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  googleSignIn: (idToken: string) => Promise<{ success: boolean; message?: string }>;
  sendOTP: (phone: string) => Promise<{ success: boolean; message?: string; isNewUser?: boolean }>;
  verifyOTP: (phone: string, code: string, displayName?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

// TEMPORARY: Mock user for development (bypass authentication)


export const useAuthStore = create<AuthState>((set) => ({
  // TEMPORARY: Set to null to enable login screen
  user: null,
  isLoading: false,
  error: null,

  googleSignIn: async (idToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/google`, { idToken });

      if (response.data.success) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        set({ user: response.data.user, isLoading: false });
        return { success: true };
      }

      set({ isLoading: false, error: response.data.message });
      return { success: false, message: response.data.message };
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      const msg = error.response?.data?.message || 'Sign in failed';
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  sendOTP: async (phone: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/send-otp`, { phone });

      set({ isLoading: false });
      return {
        success: response.data.success,
        message: response.data.message,
        isNewUser: response.data.isNewUser
      };
    } catch (error: any) {
      console.error('Send OTP Error:', error);
      console.error('Attempted API URL:', `${API_URL}/send-otp`);
      const msg = error.response?.data?.message || 'Failed to send OTP. Check your network connection and API URL.';
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  verifyOTP: async (phone: string, code: string, displayName?: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Verifying OTP with:', { phone, code, displayName }); // Log payload
      const response = await axios.post(`${API_URL}/verify-otp`, {
        phone,
        otp: code,
        displayName
      });

      if (response.data.success) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        set({ user: response.data.user, isLoading: false });
        // Load additional user data if needed
        return { success: true };
      }

      set({ isLoading: false, error: response.data.message });
      return { success: false, message: response.data.message };
    } catch (error: any) {
      console.error('Verify OTP Error:', error);
      const msg = error.response?.data?.message || 'Verification failed';
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('user');
    set({ user: null });
  },

  loadUser: async () => {
    // Load user from AsyncStorage
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        set({ user: JSON.parse(userStr) });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }
}));
