'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import { Search, Calendar, Clock, User, Phone, Mail, CheckCircle, X, Trash2, MapPin } from 'lucide-react';

interface Booking {
    _id: string;
    bookingTitle: string;
    counselorName: string;
    counselorType: string;
    user: { displayName: string; email: string; phoneNumber: string };
    bookingDate: string;
    bookingTime: string;
    status: string;
    userNotes?: string;
    amount: number;
    paymentStatus: string;
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await apiClient.get('/api/counseling/all');
            setBookings(response.data.data?.bookings || response.data.bookings || response.data || []);
        } catch (error: any) {
            if (error.response?.status !== 404) {
                console.error('Error fetching bookings:', error);
            }
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (status: string) => {
        if (!selectedBooking) return;
        setIsUpdating(true);
        try {
            await apiClient.patch(`/api/counseling/admin/${selectedBooking._id}/status`, { status });
            toast.success(`Booking marked as ${status}`);
            setSelectedBooking(prev => prev ? { ...prev, status } : null);
            fetchBookings();
        } catch (error: any) {
            console.error('Error updating booking:', error);
            toast.error('Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedBooking || !confirm('Are you sure you want to delete this booking? This cannot be undone.')) return;

        try {
            await apiClient.delete(`/api/counseling/admin/${selectedBooking._id}`);
            toast.success('Booking deleted successfully');
            setSelectedBooking(null);
            setBookings(prev => prev.filter(b => b._id !== selectedBooking._id));
        } catch (error: any) {
            console.error('Error deleting booking:', error);
            toast.error('Failed to delete booking');
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
        booking.user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bookingTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.counselorName?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        placeholder="Search by user, counselor or title..."
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
                        <div
                            key={booking._id}
                            onClick={() => setSelectedBooking(booking)}
                            className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow card-hover cursor-pointer group"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-secondary group-hover:text-primary transition-colors">
                                        {booking.bookingTitle || 'Counseling Session'}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                        {booking.status || 'Pending'}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-accent" />
                                        <span className="font-medium">{booking.user?.displayName || 'Guest'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-primary" />
                                        <span>Counselor: {booking.counselorName}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-accent" />
                                        <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4 text-accent" />
                                        <span>{booking.bookingTime}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-bold text-secondary">Booking Details</h2>
                                <p className="text-sm text-gray-500">
                                    ID: {selectedBooking._id.slice(-8).toUpperCase()}
                                </p>
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Session Info */}
                            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                                <h3 className="text-lg font-bold text-secondary mb-2">{selectedBooking.bookingTitle}</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Counselor</p>
                                        <p className="font-medium">{selectedBooking.counselorName} ({selectedBooking.counselorType})</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Date & Time</p>
                                        <p className="font-medium">
                                            {new Date(selectedBooking.bookingDate).toLocaleDateString()} at {selectedBooking.bookingTime}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Amount</p>
                                        <p className="font-medium">₹{selectedBooking.amount} ({selectedBooking.paymentStatus})</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Current Status</p>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                                            {selectedBooking.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="border rounded-xl p-4 space-y-3">
                                <h3 className="font-semibold text-gray-900 border-b pb-2">User Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span>{selectedBooking.user?.displayName || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span>{selectedBooking.user?.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{selectedBooking.user?.phoneNumber || 'N/A'}</span>
                                    </div>
                                </div>
                                {selectedBooking.userNotes && (
                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-xs text-gray-500 mb-1">User Notes:</p>
                                        <p className="text-sm bg-gray-50 p-2 rounded">{selectedBooking.userNotes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="border-t pt-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Manage Booking</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['confirmed', 'rescheduled', 'completed', 'cancelled'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusUpdate(status)}
                                            disabled={isUpdating || selectedBooking.status === status}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors border
                                                ${selectedBooking.status === status
                                                    ? 'bg-primary text-white border-primary'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-6 pt-4 border-t flex justify-end">
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center space-x-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete Booking</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
