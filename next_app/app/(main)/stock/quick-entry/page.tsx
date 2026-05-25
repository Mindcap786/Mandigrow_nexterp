"use client"

import { QuickPurchaseForm } from "@/components/inventory/quick-consignment-form"
import { useLanguage } from "@/components/i18n/language-provider"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function QuickPurchaseEntryPage() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden pt-8 px-6 sm:px-8 relative">
            <div className="max-w-[1400px] mx-auto space-y-6 relative z-10">
                {/* Header */}
                <div className="space-y-2">
                    <Link
                        href="/stock"
                        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Inventory
                    </Link>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                Quick Purchase
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">
                                Enter purchase arrivals from various suppliers.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Component */}
                <QuickPurchaseForm />
            </div>
        </div>
    )
}
