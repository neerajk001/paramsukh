import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config/api';

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
            const response = await axios.get(`${API_URL}/user/subscription`);
            if (response.data.success) {
                set({
                    currentSubscription: response.data.subscription,
                    isLoading: false
                });
            } else {
                set({ isLoading: false, error: response.data.message });
            }
        } catch (error: any) {
            console.error('Fetch Subscription Error:', error);
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to load subscription'
            });
        }
    },

    purchaseMembership: async (planId: string, paymentId: string) => {
        set({ isPurchasing: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/user/membership/purchase`, {
                plan: planId,
                paymentId // For verification (test mode will accept any string)
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
            set({
                isPurchasing: false,
                error: error.response?.data?.message || 'Failed to purchase membership'
            });
            return false;
        }
    },

    clearError: () => set({ error: null })
}));
