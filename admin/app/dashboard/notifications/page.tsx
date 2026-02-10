'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import { Bell, Trash2, CheckCircle } from 'lucide-react';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await apiClient.get('/api/notifications/all');
            setNotifications(response.data.data?.notifications || response.data.notifications || response.data || []);
        } catch (error: any) {
            // Only show error for server errors, not for empty data
            if (error.response?.status !== 404) {
                console.error('Error fetching notifications:', error);
                if (error.response?.status >= 500) {
                    toast.error('Server error. Please try again later.');
                }
            }
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'success': return 'bg-green-100 text-green-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'error': return 'bg-red-100 text-red-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">Notifications</h1>
                    <p className="text-accent mt-1">Manage system notifications</p>
                </div>
                <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition duration-200 font-medium">
                    Send Notification
                </button>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center text-accent shadow-md">
                        <Bell className="w-16 h-16 mx-auto mb-4 text-accent/30" />
                        <p>No notifications found</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow ${!notification.read ? 'border-l-4 border-primary' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center space-x-3">
                                        <h3 className="font-bold text-secondary">{notification.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                                            {notification.type || 'Info'}
                                        </span>
                                        {!notification.read && (
                                            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-accent">{notification.message}</p>
                                    <p className="text-sm text-accent/70">{new Date(notification.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                                        <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
