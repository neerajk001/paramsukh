import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    isAuthenticated: boolean;
    email: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            email: null,
            login: async (email: string, password: string) => {
                // Simple authentication - in production, this should call an API
                const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@paramsukh.com';
                const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

                if (email === adminEmail && password === adminPassword) {
                    set({ isAuthenticated: true, email });
                    return true;
                }
                return false;
            },
            logout: () => {
                set({ isAuthenticated: false, email: null });
            },
        }),
        {
            name: 'admin-auth-storage',
        }
    )
);
