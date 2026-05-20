'use client';

import { Bell, Search, Menu, UserCircle } from 'lucide-react';

export function DashboardHeader() {
    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 relative z-10 shadow-sm">
            
            {/* Mobile Menu Toggle & Search */}
            <div className="flex items-center gap-4 flex-1">
                <button className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                    <Menu className="w-5 h-5" />
                </button>
                
                <div className="hidden md:flex items-center w-full max-w-md relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3" />
                    <input 
                        type="text" 
                        placeholder="Search farmers, buyers, or bills..." 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
                <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
                </button>
                
                <div className="h-8 w-px bg-gray-200 mx-1"></div>
                
                <button className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                        JS
                    </div>
                    <div className="hidden sm:block text-left text-sm">
                        <p className="font-bold text-gray-900 leading-none">Jai Sharma</p>
                        <p className="text-xs text-gray-500 font-medium">Mandi Merchant</p>
                    </div>
                </button>
            </div>
        </header>
    );
}
