'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import { Bell, Trash2, CheckCircle, X, Send } from 'lucide-react';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    user?: { displayName: string; email: string };
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sending, setSending] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'general',
        priority: 'medium'
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await apiClient.get('/api/notifications/all');
            setNotifications(response.data.data?.notifications || response.data.notifications || response.data || []);
        } catch (error: any) {
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

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            await apiClient.post('/api/notifications/broadcast', formData);
            toast.success('Broadcast notification sent successfully');
            setIsModalOpen(false);
            setFormData({ title: '', message: '', type: 'general', priority: 'medium' });
            fetchNotifications();
        } catch (error: any) {
            console.error('Error sending notification:', error);
            toast.error(error.response?.data?.message || 'Failed to send notification');
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this notification?')) return;

        try {
            await apiClient.delete(`/api/notifications/${id}/admin`);
            toast.success('Notification deleted');
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error: any) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await apiClient.patch(`/api/notifications/${id}/read/admin`);
            toast.success('Marked as read');
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
        } catch (error: any) {
            console.error('Error marking as read:', error);
            toast.error('Failed to mark as read');
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
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition duration-200 font-medium flex items-center space-x-2"
                >
                    <Send className="w-4 h-4" />
                    <span>Send Broadcast</span>
                </button>
            </div>

            {/* Broadcast Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-secondary">Send Broadcast</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSendNotification} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Notification Title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="general">General</option>
                                    <option value="success">Success</option>
                                    <option value="warning">Warning</option>
                                    <option value="error">Error</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Notification message..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition disabled:opacity-50 flex items-center space-x-2"
                                >
                                    {sending ? 'Sending...' : 'Send Broadcast'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                            className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow ${!notification.isRead ? 'border-l-4 border-primary' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center space-x-3">
                                        <h3 className="font-bold text-secondary">{notification.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                                            {notification.type || 'Info'}
                                        </span>
                                        {!notification.isRead && (
                                            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-accent">{notification.message}</p>
                                    <div className="flex items-center space-x-4 text-sm text-accent/70">
                                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                                        {notification.user && (
                                            <span className="flex items-center space-x-1">
                                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                                <span>To: {notification.user.displayName || notification.user.email}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification._id)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                            title="Mark as read"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(notification._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Delete"
                                    >
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
