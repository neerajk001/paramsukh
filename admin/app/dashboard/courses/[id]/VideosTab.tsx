'use client';

import { useState } from 'react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, GripVertical, Play, X } from 'lucide-react';

interface Video {
    _id: string;
    title: string;
    url: string;
    duration: number;
    thumbnailUrl?: string;
    order?: number;
    description?: string;
}

interface VideosTabProps {
    courseId: string;
    videos: Video[];
    onUpdate: () => void;
}

export default function VideosTab({ courseId, videos, onUpdate }: VideosTabProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        duration: 0,
        thumbnailUrl: '',
        description: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    const sortedVideos = [...videos].sort((a, b) => (a.order || 0) - (b.order || 0));

    const openModal = (video?: Video) => {
        if (video) {
            setEditingVideo(video);
            setFormData({
                title: video.title,
                url: video.url,
                duration: video.duration,
                thumbnailUrl: video.thumbnailUrl || '',
                description: video.description || '',
            });
        } else {
            setEditingVideo(null);
            setFormData({
                title: '',
                url: '',
                duration: 0,
                thumbnailUrl: '',
                description: '',
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingVideo(null);
        setFormData({
            title: '',
            url: '',
            duration: 0,
            thumbnailUrl: '',
            description: '',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingVideo) {
                await apiClient.put(`/api/courses/${courseId}/videos/${editingVideo._id}`, formData);
                toast.success('Video updated successfully');
            } else {
                await apiClient.post(`/api/courses/${courseId}/videos`, formData);
                toast.success('Video added successfully');
            }
            closeModal();
            onUpdate();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save video');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (videoId: string) => {
        if (!confirm('Are you sure you want to delete this video?')) return;

        setDeleting(videoId);
        try {
            await apiClient.delete(`/api/courses/${courseId}/videos/${videoId}`);
            toast.success('Video deleted successfully');
            onUpdate();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete video');
            console.error(error);
        } finally {
            setDeleting(null);
        }
    };

    const handleReorder = async (videoId: string, newOrder: number) => {
        try {
            await apiClient.put(`/api/courses/${courseId}/videos/${videoId}`, { order: newOrder });
            toast.success('Video order updated');
            onUpdate();
        } catch (error: any) {
            toast.error('Failed to reorder video');
            console.error(error);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Course Videos</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage video content for this course
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Video
                </button>
            </div>

            {/* Videos List */}
            {sortedVideos.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Play className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No videos added yet</p>
                    <button
                        onClick={() => openModal()}
                        className="text-blue-600 hover:underline"
                    >
                        Add your first video
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedVideos.map((video, index) => (
                        <div
                            key={video._id}
                            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                            <button className="cursor-move text-gray-400 hover:text-gray-600">
                                <GripVertical className="w-5 h-5" />
                            </button>

                            {video.thumbnailUrl ? (
                                <img
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    className="w-32 h-20 rounded object-cover"
                                />
                            ) : (
                                <div className="w-32 h-20 bg-gray-200 rounded flex items-center justify-center">
                                    <Play className="w-8 h-8 text-gray-400" />
                                </div>
                            )}

                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{video.title}</h3>
                                        {video.description && (
                                            <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            <span>{video.duration} mins</span>
                                            <span>Order: {video.order || index + 1}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openModal(video)}
                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(video._id)}
                                            disabled={deleting === video._id}
                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingVideo ? 'Edit Video' : 'Add New Video'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Video Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Introduction to the Course"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Video URL *
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://vimeo.com/..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration (minutes) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="30"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Thumbnail URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.thumbnailUrl}
                                        onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Brief description of the video content..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : editingVideo ? 'Update Video' : 'Add Video'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
