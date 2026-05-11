'use client';

import React from 'react';
import Link from 'next/link';

export default function PartnerPortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-inner">
                            <svg viewBox="0 0 36 36" fill="none" className="w-5 h-5">
                                <path d="M18 6 C18 6 10 10 10 18 C10 24 13.5 28 18 29 C22.5 28 26 24 26 18 C26 10 18 6 18 6Z" fill="white" opacity="0.9"/>
                            </svg>
                        </div>
                        <span className="font-black text-xl text-slate-900 tracking-tight">
                            MandiGrow <span className="text-indigo-600 font-bold ml-1 text-sm bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-widest">Partner</span>
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col">
                {children}
            </main>
        </div>
    );
}
