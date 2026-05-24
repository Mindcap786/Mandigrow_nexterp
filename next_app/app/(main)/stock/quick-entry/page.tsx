"use client"

import { QuickPurchaseForm } from "@/components/inventory/quick-consignment-form"
import { useLanguage } from "@/components/i18n/language-provider"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function QuickPurchaseEntryPage() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 overflow-x-hidden pt-10 px-6 sm:px-12 relative">
            {/* Ambient background glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-[120px]" />
            </div>
            
            <div className="max-w-[1700px] mx-auto space-y-8 relative z-10">
                {/* Header */}
                <div className="space-y-4">
                    <Link
                        href="/stock"
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-600 transition-colors group w-fit"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        Back to Inventory
                    </Link>

                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-indigo-600 font-black tracking-widest text-[10px] uppercase">
                            <div className="h-[2px] w-8 bg-indigo-600 rounded-full" />
                            Inventory Operations
                        </div>
                        <h1 className="text-5xl font-[1000] text-slate-900 tracking-tighter uppercase italic leading-none">
                            Quick <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Purchase</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm max-w-2xl">
                            Rapidly enter multiple purchase arrivals from various suppliers.
                            Supports both Direct and Farmer purchases with rate and commission tracking.
                        </p>
                    </div>
                </div>

                {/* Form Component */}
                <QuickPurchaseForm />
            </div>
        </div>
    )
}
