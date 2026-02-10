'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, Calendar, ShoppingCart, TrendingUp, Package } from 'lucide-react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';

interface Stats {
    users: number;
    courses: number;
    events: number;
    products: number;
    orders: number;
    bookings: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({
        users: 0,
        courses: 0,
        events: 0,
        products: 0,
        orders: 0,
        bookings: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch counts from various endpoints - using admin routes where available
            const [usersRes, coursesRes, eventsRes, productsRes, ordersRes, bookingsRes] = await Promise.allSettled([
                apiClient.get('/api/user/all').catch(() => ({ data: { users: [] } })),
                apiClient.get('/api/courses/all').catch(() => ({ data: { courses: [] } })),
                apiClient.get('/api/events/all').catch(() => ({ data: { events: [] } })),
                apiClient.get('/api/products').catch(() => ({ data: { products: [] } })),
                apiClient.get('/api/orders/all').catch(() => ({ data: { data: { orders: [] } } })),
                apiClient.get('/api/counseling/all').catch(() => ({ data: { data: { bookings: [] } } })),
            ]);

            setStats({
                users: usersRes.status === 'fulfilled' ? (usersRes.value.data.users?.length || 0) : 0,
                courses: coursesRes.status === 'fulfilled' ? (coursesRes.value.data.courses?.length || 0) : 0,
                events: eventsRes.status === 'fulfilled' ? (eventsRes.value.data.events?.length || 0) : 0,
                products: productsRes.status === 'fulfilled' ? (productsRes.value.data.products?.length || 0) : 0,
                orders: ordersRes.status === 'fulfilled' ? (ordersRes.value.data.data?.orders?.length || 0) : 0,
                bookings: bookingsRes.status === 'fulfilled' ? (bookingsRes.value.data.data?.bookings?.length || 0) : 0,
            });
        } catch (error) {
            toast.error('Failed to fetch statistics');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { icon: Users, label: 'Total Users', value: stats.users, color: 'bg-blue-500' },
        { icon: BookOpen, label: 'Courses', value: stats.courses, color: 'bg-green-500' },
        { icon: Calendar, label: 'Events', value: stats.events, color: 'bg-purple-500' },
        { icon: ShoppingCart, label: 'Products', value: stats.products, color: 'bg-primary' },
        { icon: Package, label: 'Orders', value: stats.orders, color: 'bg-yellow-500' },
        { icon: TrendingUp, label: 'Bookings', value: stats.bookings, color: 'bg-pink-500' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Welcome to ParamSukh Admin</h1>
                <p className="text-white/90">Manage your platform efficiently from this dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 card-hover"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-accent text-sm font-medium mb-1">{card.label}</p>
                                    <p className="text-3xl font-bold text-secondary">{card.value}</p>
                                </div>
                                <div className={`${card.color} p-4 rounded-full`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-bold text-secondary mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition duration-200 font-medium">
                        Add User
                    </button>
                    <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-200 font-medium">
                        Create Course
                    </button>
                    <button className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition duration-200 font-medium">
                        New Event
                    </button>
                    <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-200 font-medium">
                        Add Product
                    </button>
                </div>
            </div>
        </div>
    );
}
