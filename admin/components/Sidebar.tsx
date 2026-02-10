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
    Crown
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-secondary text-white flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-secondary-light">
                <h1 className="text-2xl font-bold text-primary">ParamSukh</h1>
                <p className="text-sm text-accent-light mt-1">Admin Panel</p>
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
    );
}
