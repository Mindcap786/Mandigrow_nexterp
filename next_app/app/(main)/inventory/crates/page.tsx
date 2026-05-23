'use client'

import { useState } from 'react'
import { CrateTypesView } from '@/components/crates/crate-types-view'
import { CrateTrackerView } from '@/components/crates/crate-tracker-view'
import { Package, ArrowRightLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function UnifiedCratePage() {
    const [tab, setTab] = useState<'types' | 'tracker'>('types')

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Unified Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-4 md:px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Crate Management</h1>
                            <p className="text-slate-500 text-sm">Manage crate types, add stock, and track crate distribution</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 mt-6 border-b border-slate-200">
                    <button
                        onClick={() => setTab('types')}
                        className={cn(
                            "pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2",
                            tab === 'types' 
                                ? "border-orange-500 text-orange-600" 
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                        )}
                    >
                        <Package className="w-4 h-4" />
                        Crate Types & Stock
                    </button>
                    <button
                        onClick={() => setTab('tracker')}
                        className={cn(
                            "pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2",
                            tab === 'tracker' 
                                ? "border-emerald-500 text-emerald-600" 
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                        )}
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                        Tracker (Issue & Receive)
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 md:p-6 -mt-6">
                {tab === 'types' && <CrateTypesView />}
                {tab === 'tracker' && <CrateTrackerView />}
            </div>
        </div>
    )
}
