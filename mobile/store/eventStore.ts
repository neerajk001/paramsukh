import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config/api';

export interface EventPhoto {
    id: string;
    url: string;
    thumbnailUrl?: string; // Optional if backend doesn't provide
    caption?: string;
}

export interface EventVideo {
    id: string;
    url: string;
    thumbnailUrl?: string;
    title?: string;
    description?: string;
    duration?: string;
}

interface Event {
    _id: string;
    title: string;
    description: string;
    images: string[]; // Backend likely stores array of strings (URLs)
    videos: string[]; // Backend likely stores array of strings (URLs or YouTube IDs)
    // ... other fields
}

interface EventState {
    currentEvent: Event | null;
    photos: EventPhoto[];
    videos: EventVideo[];
    isLoading: boolean;
    error: string | null;

    fetchEventDetails: (eventId: string) => Promise<void>;
    fetchEventPhotos: (eventId: string) => Promise<void>; // Convenience wrapper
    fetchEventVideos: (eventId: string) => Promise<void>; // Convenience wrapper
}

export const useEventStore = create<EventState>((set, get) => ({
    currentEvent: null,
    photos: [],
    videos: [],
    isLoading: false,
    error: null,

    fetchEventDetails: async (eventId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/events/${eventId}`);
            if (response.data.success) {
                const event = response.data.data; // Adjust based on actual response structure

                // Map images to EventPhoto interface
                const photos: EventPhoto[] = (event.images || []).map((url: string, index: number) => ({
                    id: `img-${index}`,
                    url: url,
                    thumbnailUrl: url,
                    caption: `Photo from ${event.title}`
                }));

                // Map videos to EventVideo interface
                const videos: EventVideo[] = (event.videos || []).map((url: string, index: number) => ({
                    id: `vid-${index}`,
                    url: url,
                    title: `Video from ${event.title}`
                }));

                set({ currentEvent: event, photos, videos, isLoading: false });
            } else {
                set({ isLoading: false, error: 'Failed to fetch event details' });
            }
        } catch (error: any) {
            console.error('Fetch Event Details Error:', error);
            set({ isLoading: false, error: 'Failed to load event' });
        }
    },

    fetchEventPhotos: async (eventId: string) => {
        await get().fetchEventDetails(eventId);
    },

    fetchEventVideos: async (eventId: string) => {
        await get().fetchEventDetails(eventId);
    }
}));
