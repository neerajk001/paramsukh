'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import { Search, Calendar, Clock, User } from 'lucide-react';

interface Booking {
    _id: string;
    user: { name: string; email: string };
    date: string;
    time: string;
    service: string;
    status: string;
    notes?: string;
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await apiClient.get('/api/counseling/all');
            setBookings(response.data.data?.bookings || response.data.bookings || response.data || []);
        } catch (error: any) {
            // Only show error for server errors, not for empty data
            if (error.response?.status !== 404) {
                console.error('Error fetching bookings:', error);
                if (error.response?.status >= 500) {
                    toast.error('Server error. Please try again later.');
                }
            }
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredBookings = bookings.filter(booking =>
        booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="text-3xl font-bold text-secondary">Bookings Management</h1>
                    <p className="text-accent mt-1">Manage counseling bookings</p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                    <input
                        type="text"
                        placeholder="Search bookings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookings.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-accent">No bookings found</div>
                ) : (
                    filteredBookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow card-hover">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-secondary">{booking.service || 'Counseling'}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                        {booking.status || 'Pending'}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center space-x-2 text-accent">
                                        <User className="w-4 h-4" />
                                        <span>{booking.user?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-accent">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(booking.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-accent">
                                        <Clock className="w-4 h-4" />
                                        <span>{booking.time || 'N/A'}</span>
                                    </div>
                                </div>

                                {booking.notes && (
                                    <p className="text-sm text-accent pt-2 border-t line-clamp-2">{booking.notes}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
