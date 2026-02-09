import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config/api';

interface CounselorType {
    id: string;
    title: string;
    icon: string;
    color: string;
    bgColor: string;
    description: string;
    duration: string;
    isFree?: boolean;
}

interface CounselingState {
    counselingTypes: CounselorType[];
    isLoading: boolean;
    error: string | null;
    fetchCounselingTypes: () => Promise<void>;
    checkAvailability: (date: string, counselorType: string) => Promise<string[]>;
    bookSession: (bookingData: any) => Promise<{ success: boolean; message?: string }>;
}

export const useCounselingStore = create<CounselingState>((set) => ({
    counselingTypes: [],
    isLoading: false,
    error: null,

    fetchCounselingTypes: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/counseling/types`);
            if (response.data.success) {
                set({ counselingTypes: response.data.data.types, isLoading: false });
            } else {
                set({ isLoading: false, error: 'Failed to fetch counseling types' });
            }
        } catch (error: any) {
            console.error('Fetch Counseling Types Error:', error);
            // Fallback to static if endpoint doesn't exist yet/fails
            set({ isLoading: false, error: 'Failed to load counseling services' });
        }
    },

    checkAvailability: async (date: string, counselorType: string) => {
        set({ isLoading: true, error: null });
        try {
            // Check if backend supports this, otherwise return mock slots for now to not block UI
            // In real scenario: const response = await axios.get(...)
            // For now, let's simulate a network call that returns standardized slots
            // This simulation helps verifying the UI connection flow
            await new Promise(resolve => setTimeout(resolve, 500));

            // Return dummy slots for testing "live" connection flow until backend endpoint is confirmed ready
            set({ isLoading: false });
            return [
                '09:00 AM', '10:00 AM', '11:00 AM',
                '02:00 PM', '03:00 PM', '04:00 PM'
            ];
            /* 
            // REAL IMPLEMENTATION ONCE ENDPOINT READY:
            const response = await axios.get(`${API_URL}/counseling/availability`, {
                 params: { date, counselorType }
            });
            set({ isLoading: false });
            return response.data.data.slots;
            */
        } catch (error: any) {
            console.error('Check Availability Error:', error);
            set({ isLoading: false, error: 'Failed to check availability' });
            return [];
        }
    },

    bookSession: async (bookingData: any) => {
        set({ isLoading: true, error: null });
        try {
            // Use specific endpoint for booking
            const response = await axios.post(`${API_URL}/counseling/book`, bookingData);
            set({ isLoading: false });
            if (response.data.success) {
                return { success: true, message: 'Booking confirmed' };
            }
            return { success: false, message: response.data.message || 'Booking failed' };
        } catch (error: any) {
            console.error('Book Session Error:', error);
            // Fallback for demo if backend not ready (so you can test UI flow)
            // Remove this fallback when backend is strictly required
            /*
            set({ isLoading: false });
            return { success: true, message: 'Booking confirmed (Demo)' };
            */

            const msg = error.response?.data?.message || 'Booking failed';
            set({ isLoading: false, error: msg });
            return { success: false, message: msg };
        }
    }
}));
