'use client'

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export function SeoExpandedContent() {
    return (
        <section className="py-24 px-6 bg-white border-t border-emerald-100">
            <div className="max-w-4xl mx-auto prose prose-lg prose-emerald text-gray-700">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-8">
                    Why MandiGrow is the Complete Mandi ERP System
                </h2>
                
                <p className="lead text-xl text-gray-600 font-medium mb-8">
                    Operating a wholesale commission agency in India's APMC markets requires extreme speed, accuracy, and trust. A generic accounting software cannot handle the unique challenges of a bustling mandi. That is why thousands of Arhtiyas are upgrading to specialized <strong>Mandi ERP software</strong>.
                </p>

                <div className="bg-[#f7fbf3] p-8 rounded-3xl border border-emerald-100 my-10">
                    <h3 className="text-2xl font-black text-gray-900 mt-0 mb-4">The Complexity of Mandi Billing</h3>
                    <p className="mb-4">
                        In a typical morning, a commission agent might auction 50 different lots from 20 different farmers to 30 different buyers. They must calculate:
                    </p>
                    <ul className="space-y-2 mb-0 font-medium text-gray-700">
                        <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" /> Variable commission percentages per farmer</li>
                        <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" /> Market Cess (Mandi Tax) deductions</li>
                        <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" /> Hamali and weighing charges</li>
                        <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" /> Advance payments and outstanding Udhar</li>
                    </ul>
                </div>

                <p>
                    MandiGrow is designed from the ground up as a dedicated <Link href="/commission-agent-software" className="text-emerald-700 font-bold underline hover:text-emerald-800">commission agent software</Link>. When an auction ends, our system automatically applies all these calculations in milliseconds. It generates a clean, transparent Patti (farmer's bill) and updates both the farmer's and the buyer's ledger instantly.
                </p>

                <h3 className="text-2xl font-black text-gray-900 mt-12 mb-4">Tailored for Every Commodity</h3>
                <p>
                    Different markets have different rules. MandiGrow adapts to your specific trade:
                </p>
                <div className="grid sm:grid-cols-2 gap-6 my-8">
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-2 mt-0">Vegetable Traders</h4>
                        <p className="text-sm m-0">Need fast gate billing and accurate weight deductions? Explore our <Link href="/sabji-mandi-software" className="text-emerald-700 font-bold hover:underline">Sabji Mandi software</Link> features.</p>
                    </div>
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-2 mt-0">Fruit Wholesalers</h4>
                        <p className="text-sm m-0">Struggling with empty plastic crate (jali) tracking? Read about our specialized <Link href="/fruit-mandi-software" className="text-emerald-700 font-bold hover:underline">Fruit Mandi software</Link>.</p>
                    </div>
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-2 mt-0">Grain Arhtiyas</h4>
                        <p className="text-sm m-0">Managing massive quintal volumes and J-Forms? Discover our <Link href="/anaj-mandi-erp-software" className="text-emerald-700 font-bold hover:underline">Anaj Mandi ERP</Link>.</p>
                    </div>
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-2 mt-0">Digital Khata</h4>
                        <p className="text-sm m-0">Just want to replace your paper bahis? Check out our <Link href="/mandi-khata-software" className="text-emerald-700 font-bold hover:underline">Digital Mandi Khata app</Link>.</p>
                    </div>
                </div>

                <h3 className="text-2xl font-black text-gray-900 mt-12 mb-4">Trusted Across India's Largest Markets</h3>
                <p>
                    From Azadpur Mandi in Delhi to Vashi APMC in Maharashtra, the modern wholesale agricultural trade relies on rapid digitisation. By implementing a robust Mandi ERP system, you eliminate late-night accounting, prevent leakage from missing crates, and build long-lasting trust with your farmers by providing professional, instant WhatsApp receipts.
                </p>
            </div>
        </section>
    )
}
