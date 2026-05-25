'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    Users, 
    BookOpen, 
    PackageSearch, 
    Receipt, 
    Settings,
    Store
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAVIGATION = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Farmer Khata', href: '/dashboard/farmers', icon: BookOpen },
    { name: 'Buyer Khata', href: '/dashboard/buyers', icon: Users },
    { name: 'Billing (Patti)', href: '/dashboard/billing', icon: Receipt },
    { name: 'Inventory', href: '/dashboard/inventory', icon: PackageSearch },
    { name: 'Market Info', href: '/dashboard/market', icon: Store },
    { name: '3rd-Party Expenses', href: '/reports/expense-recovery', icon: Receipt },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="h-full flex flex-col pt-6 pb-4">
            {/* Logo */}
            <div className="px-6 mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white font-black text-xl shadow-inner shadow-emerald-900/20">
                    M
                </div>
                <span className="text-xl font-bold tracking-tighter text-gray-900">MandiGrow</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-1.5">
                {NAVIGATION.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link 
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all",
                                isActive 
                                    ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100" 
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive ? "text-emerald-600" : "text-gray-400")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User Upgrade Promo (Bottom) */}
            <div className="px-4 mt-auto">
                <div className="bg-gradient-to-tr from-emerald-900 to-emerald-800 p-4 rounded-2xl text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                    <h4 className="text-sm font-black mb-1">Trial Active</h4>
                    <p className="text-xs text-emerald-200 mb-3">14 days remaining on your Pro account.</p>
                    <button className="w-full bg-white text-emerald-900 text-xs font-bold py-2 rounded-lg hover:bg-emerald-50 transition-colors">
                        Upgrade Now
                    </button>
                </div>
            </div>
        </div>
    );
}
