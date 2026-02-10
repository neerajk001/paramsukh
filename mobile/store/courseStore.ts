import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config/api';

export interface Video {
    _id: string;
    title: string;
    description?: string;
    duration: string; // "15:30"
    videoUrl: string;
    thumbnailUrl?: string;
    order: number;
    isFree: boolean;
}

export interface Pdf {
    _id: string;
    title: string;
    description?: string;
    pdfUrl: string;
    thumbnailUrl?: string;
    order: number;
    isFree: boolean;
}

export interface LiveSession {
    _id: string;
    title: string;
    description?: string;
    scheduledAt: string;
    durationInMinutes: number;
    meetingPlatform: string;
    meetingLink: string;
    status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Course {
    _id: string;
    title: string;
    description: string;
    shortDescription?: string;
    icon: string;
    color: string;
    thumbnailUrl?: string;
    bannerUrl?: string;
    duration: string; // "6 weeks"
    category: string;
    tags: string[];
    status: 'draft' | 'published' | 'archived';

    // Content Statistics
    totalVideos: number;
    totalPdfs: number;

    // Content Arrays (populated when fetching detail)
    videos?: Video[];
    pdfs?: Pdf[];
    liveSessions?: LiveSession[];

    createdAt: string;
}

export interface EnrollmentProgress {
    progress: number;
    completedVideos: string[];
    completedPdfs: string[];
    currentVideoId: string | null;
    isCompleted: boolean;
    lastAccessedAt: string;
}

interface CourseState {
    courses: Course[];
    currentCourse: Course | null;
    enrollmentProgress: EnrollmentProgress | null;
    isLoading: boolean;
    error: string | null;

    fetchCourses: () => Promise<void>;
    fetchCourseById: (id: string) => Promise<void>;
    fetchCourseBySlug: (slug: string) => Promise<void>;
    fetchEnrollmentProgress: (courseId: string) => Promise<void>;
    markVideoComplete: (courseId: string, videoId: string) => Promise<boolean>;
    markPdfComplete: (courseId: string, pdfId: string) => Promise<boolean>;
    clearCurrentCourse: () => void;
}

export const useCourseStore = create<CourseState>((set) => ({
    courses: [],
    currentCourse: null,
    enrollmentProgress: null,
    isLoading: false,
    error: null,

    fetchCourses: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/courses/all`);
            if (response.data.success) {
                set({ courses: response.data.courses, isLoading: false });
            } else {
                // Fallback or error 
                set({ isLoading: false, error: response.data.message });
            }
        } catch (error: any) {
            console.error('Fetch Courses Error:', error);
            // Fallback for demo purposes if backend fails/is empty
            set({ isLoading: false, error: error.message || 'Failed to fetch courses' });
        }
    },

    fetchCourseById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/courses/${id}`);
            if (response.data.success) {
                set({ currentCourse: response.data.course, isLoading: false });
            } else {
                set({ isLoading: false, error: response.data.message });
            }
        } catch (error: any) {
            console.error('Fetch Course Detail Error:', error);
            set({ isLoading: false, error: error.message || 'Failed to fetch course details' });
        }
    },

    fetchCourseBySlug: async (slug: string) => {
        set({ isLoading: true, error: null });
        try {
            // Note: Add endpoint for slug if needed, using custom query for now or by-id pattern if slug unsupported
            // Backend Controller has getCourseBySlug, so assuming route exists
            // Since our backend route might be /courses/slug/:slug or similar, check routes.
            // For now assuming we might not need this immediately for mobile, can skip or assume generic route
            set({ isLoading: false }); // Placeholder
        } catch (error) {
            set({ isLoading: false, error: 'Failed to fetch course' });
        }
    },

    fetchEnrollmentProgress: async (courseId: string) => {
        try {
            const response = await axios.get(`${API_URL}/courses/${courseId}/progress`);
            if (response.data.success) {
                set({ enrollmentProgress: response.data.data });
            }
        } catch (error: any) {
            console.error('Fetch Progress Error:', error);
            // Don't set error state, just log it
        }
    },

    markVideoComplete: async (courseId: string, videoId: string) => {
        try {
            const response = await axios.post(`${API_URL}/courses/${courseId}/progress/video/${videoId}`);
            if (response.data.success) {
                set({ enrollmentProgress: response.data.data });
                return true;
            }
            return false;
        } catch (error: any) {
            console.error('Mark Video Complete Error:', error);
            return false;
        }
    },

    markPdfComplete: async (courseId: string, pdfId: string) => {
        try {
            const response = await axios.post(`${API_URL}/courses/${courseId}/progress/pdf/${pdfId}`);
            if (response.data.success) {
                set({ enrollmentProgress: response.data.data });
                return true;
            }
            return false;
        } catch (error: any) {
            console.error('Mark PDF Complete Error:', error);
            return false;
        }
    },

    clearCurrentCourse: () => set({ currentCourse: null, enrollmentProgress: null })
}));
