'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';

interface Course {
    _id?: string;
    title: string;
    description: string;
    color: string;
    icon: string;
    thumbnailUrl: string;
    bannerUrl: string;
    duration: number;
    tags: string[];
    status: string;
}

interface CourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    course?: Course | null;
    onSuccess: () => void;
}

export default function CourseModal({ isOpen, onClose, course, onSuccess }: CourseModalProps) {
    const [formData, setFormData] = useState<Course>({
        title: '',
        description: '',
        color: '#000000',
        icon: '',
        thumbnailUrl: '',
        bannerUrl: '',
        duration: 0,
        tags: [],
        status: 'draft',
    });
    const [tagsInput, setTagsInput] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (course) {
            setFormData(course);
            setTagsInput(course.tags ? course.tags.join(', ') : '');
        } else {
            setFormData({
                title: '',
                description: '',
                color: '#000000',
                icon: '',
                thumbnailUrl: '',
                bannerUrl: '',
                duration: 0,
                tags: [],
                status: 'draft',
            });
            setTagsInput('');
        }
    }, [course]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create a payload derived from formData
            // Ensure tags is an array
            const payload = {
                ...formData,
                tags: tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            };

            if (course?._id) {
                // Update existing course
                await apiClient.put(`/api/courses/update/${course._id}`, payload);
                toast.success('Course updated successfully!');
            } else {
                // Create new course
                await apiClient.post('/api/courses/create', payload);
                toast.success('Course created successfully!');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save course');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'duration' ? Number(value) : value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-secondary">
                        {course ? 'Edit Course' : 'Create New Course'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="w-6 h-6 text-accent" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                            Course Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="e.g., Complete Web Development Bootcamp"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                            placeholder="Describe what students will learn..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Color */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">
                                Color (Hex) *
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="color"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    className="h-12 w-12 border border-gray-300 rounded-lg cursor-pointer"
                                    required
                                />
                                <input
                                    type="text"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg outline-none uppercase"
                                    placeholder="#000000"
                                    pattern="^#[0-9A-Fa-f]{6}$"
                                    required
                                />
                            </div>
                        </div>

                        {/* Icon */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">
                                Icon (URL or Name) *
                            </label>
                            <input
                                type="text"
                                name="icon"
                                value={formData.icon}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                placeholder="e.g., code, book, or URL"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">
                                Duration (hours) *
                            </label>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                placeholder="10"
                                required
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">
                                Status *
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                required
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                            Tags (comma separated) *
                        </label>
                        <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="e.g., web, development, coding"
                            required
                        />
                    </div>

                    {/* Thumbnail URL */}
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                            Thumbnail URL *
                        </label>
                        <input
                            type="url"
                            name="thumbnailUrl"
                            value={formData.thumbnailUrl}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="https://example.com/image.jpg"
                            required
                        />
                    </div>

                    {/* Banner URL */}
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                            Banner URL *
                        </label>
                        <input
                            type="url"
                            name="bannerUrl"
                            value={formData.bannerUrl}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="https://example.com/banner.jpg"
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 text-secondary rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>{course ? 'Update Course' : 'Create Course'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
