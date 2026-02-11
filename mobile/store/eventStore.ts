import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config/api';

export interface EventPhoto {
    id: string;
    url: string;
    thumbnailUrl?: string;
    caption?: string;
}

export interface EventVideo {
    id: string;
    url: string;
    thumbnailUrl?: string; // YouTube thumbnail
    title?: string;
    description?: string;
    duration?: string;
}

export interface Event {
    _id: string;
    title: string;
    description: string;
    shortDescription?: string;
    icon: string;
    color: string;
    emoji: string;
    eventDate: string; // ISO string
    eventTime: string;
    startTime: string; // ISO string
    location: string;
    category: string;
    isPaid: boolean;
    price: number;
    attendees?: number; // mapped from currentAttendees
    currentAttendees: number;
    images: { _id?: string; url: string; caption: string }[];
    youtubeVideos: { _id?: string; url: string; title: string; description: string; thumbnailUrl: string }[];
    hasRecording: boolean;
    imageCount: number;
    notificationEnabled: boolean;
    // ... other fields as needed
}

interface EventState {
    events: Event[];
    currentEvent: Event | null;
    photos: EventPhoto[];
    videos: EventVideo[];
    isLoading: boolean;
    error: string | null;

    fetchEvents: (tab: 'upcoming' | 'past') => Promise<void>;
    fetchEventDetails: (eventId: string) => Promise<void>;
    fetchEventPhotos: (eventId: string) => Promise<void>;
    fetchEventVideos: (eventId: string) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
    events: [],
    currentEvent: null,
    photos: [],
    videos: [],
    isLoading: false,
    error: null,

    fetchEvents: async (tab: 'upcoming' | 'past') => {
        set({ isLoading: true, error: null });
        try {
            // Use the convenience endpoints from the backend
            // /api/events/upcoming or /api/events/past
            const endpoint = tab === 'upcoming' ? `${API_URL}/events/upcoming` : `${API_URL}/events/past`;
            const response = await axios.get(endpoint);

            if (response.data && response.data.success) {
                // Map backend event to frontend interface if needed, 
                // but direct assignment usually works if keys match enough.
                // We might need to ensure 'attendees' is populated or used from currentAttendees.
                const mappedEvents = response.data.events.map((e: any) => ({
                    ...e,
                    attendees: e.currentAttendees || 0,
                    id: e._id // ensure 'id' is available if UI uses it, though we prefer _id
                }));
                set({ events: mappedEvents, isLoading: false });
            } else {
                console.log(`Fetch ${tab} Events response:`, response.data);
                set({ events: [], isLoading: false, error: null });
            }
        } catch (error: any) {
            console.error(`Fetch ${tab} Events Error:`, error);
            // Don't show error to user, show empty list
            set({ events: [], isLoading: false, error: null });
        }
    },

    fetchEventDetails: async (eventId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/events/${eventId}`);
            if (response.data.success) {
                const event = response.data.event;

                // Map images to EventPhoto interface
                const photos: EventPhoto[] = (event.images || []).map((img: any, index: number) => ({
                    id: img._id || `img-${index}`,
                    url: img.url,
                    thumbnailUrl: img.url,
                    caption: img.caption
                }));

                // Map youtubeVideos to EventVideo interface
                const videos: EventVideo[] = (event.youtubeVideos || []).map((vid: any, index: number) => ({
                    id: vid._id || `vid-${index}`,
                    url: vid.url,
                    title: vid.title,
                    description: vid.description,
                    thumbnailUrl: vid.thumbnailUrl
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
