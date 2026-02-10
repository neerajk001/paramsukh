'use client';

import {
    Users,
    BookOpen,
    Calendar,
    ShoppingCart,
    Package,
    MessageSquare,
    Bell,
    ClipboardList,
    Home,
    Crown,
    X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Users', href: '/dashboard/users' },
    { icon: Crown, label: 'Memberships', href: '/dashboard/memberships' },
    { icon: BookOpen, label: 'Courses', href: '/dashboard/courses' },
    { icon: Calendar, label: 'Events', href: '/dashboard/events' },
    { icon: ShoppingCart, label: 'Products', href: '/dashboard/products' },
    { icon: Package, label: 'Orders', href: '/dashboard/orders' },
    { icon: ClipboardList, label: 'Bookings', href: '/dashboard/bookings' },
    { icon: MessageSquare, label: 'Community', href: '/dashboard/community' },
    { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-secondary text-white flex flex-col 
                transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Close Button (Mobile Only) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white md:hidden"
                >
                    <X className="w-6 h-6" />
                </button>
                {/* Logo */}
                <div className="p-6 border-b border-secondary-light flex flex-col items-center">
                    <div className="relative w-full h-24 mb-2">
                        <Image
                            src="/paramsukh.png"
                            alt="ParamSukh Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <p className="text-sm text-accent-light">Admin Panel</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'text-accent-light hover:bg-secondary-light hover:text-white'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-secondary-light">
                    <p className="text-xs text-accent-light text-center">
                        © 2026 ParamSukh
                    </p>
                </div>
            </aside>
        </>
    );
}
