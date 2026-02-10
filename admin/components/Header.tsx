'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Header() {
    const router = useRouter();
    const { email, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        router.push('/');
    };

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-secondary">Admin Dashboard</h2>
                    <p className="text-sm text-accent">Manage your platform</p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
                        <User className="w-5 h-5 text-accent" />
                        <span className="text-sm font-medium text-secondary">{email}</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
