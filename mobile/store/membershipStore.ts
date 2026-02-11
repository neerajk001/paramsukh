import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useAuthStore } from './authStore';

export interface MembershipPlan {
    id: string;
    name: string;
    regularPrice: number;
    offerPrice: number;
    emoji: string;
    color: string;
    gradient: string[];
    tagline: string;
    features: { text: string; included: boolean }[];
    popular: boolean;
    courseAccess: string[];
}

export interface Subscription {
    plan: string;
    status: 'trial' | 'active' | 'expired' | 'cancelled';
    trialEndsAt?: string;
    isTrialActive: boolean;
    trialDaysLeft: number;
    hasProAccess: boolean;
}

interface MembershipState {
    currentSubscription: Subscription | null;
    isLoading: boolean;
    error: string | null;
    isPurchasing: boolean;

    fetchCurrentSubscription: () => Promise<void>;
    purchaseMembership: (planId: string, paymentId: string) => Promise<boolean>;
    clearError: () => void;
}

export const useMembershipStore = create<MembershipState>((set) => ({
    currentSubscription: null,
    isLoading: false,
    error: null,
    isPurchasing: false,

    fetchCurrentSubscription: async () => {
        set({ isLoading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            if (!token) {
                // Not logged in, can't fetch subscription
                set({ isLoading: false, currentSubscription: null });
                return;
            }

            const response = await axios.get(`${API_URL}/user/subscription`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.success) {
                set({
                    currentSubscription: response.data.subscription,
                    isLoading: false
                });
            } else {
                console.log('Fetch subscription response:', response.data);
                // Maybe no subscription yet, so null is valid
                set({ isLoading: false, currentSubscription: null, error: null });
            }
        } catch (error: any) {
            console.error('Fetch Subscription Error:', error);
            if (error.response?.status === 401) {
                // Handle 401 Unauthorized - logout user
                useAuthStore.getState().logout();
            }
            // Don't show critical error, user might just be on free tier/not logged in properly yet
            set({
                isLoading: false,
                currentSubscription: null,
                error: null
            });
        }
    },

    purchaseMembership: async (planId: string, paymentId: string) => {
        set({ isPurchasing: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            if (!token) {
                set({ isPurchasing: false, error: 'You must be logged in to purchase.' });
                return false;
            }

            const response = await axios.post(`${API_URL}/user/membership/purchase`, {
                plan: planId,
                paymentId // For verification (test mode will accept any string)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                // Update current subscription
                set({
                    currentSubscription: response.data.subscription,
                    isPurchasing: false
                });
                return true;
            } else {
                set({ isPurchasing: false, error: response.data.message });
                return false;
            }
        } catch (error: any) {
            console.error('Purchase Membership Error:', error);
            if (error.response?.status === 401) {
                useAuthStore.getState().logout();
            }
            set({
                isPurchasing: false,
                error: error.response?.data?.message || 'Failed to purchase membership'
            });
            return false;
        }
    },

    clearError: () => set({ error: null })
}));
