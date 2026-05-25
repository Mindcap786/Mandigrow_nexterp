import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { ScanBarcode, Scale, MonitorSmartphone, Usb, CheckCircle2, Zap } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Weighbridge & Barcode Integration for APMC Mandi Software',
    description: 'Eliminate manual entry at the gate. Connect electronic weighbridges (scales) directly to your browser via Web Serial API and use barcode scanners for instant lot selection in APMC mandis.',
    keywords: [
        'weighbridge integration mandi software',
        'APMC barcode POS',
        'agricultural scale integration software',
        'electronic weighbridge ERP',
        'mandi gate entry automation'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/weighbridge-barcode-integration-mandi-software' },
    openGraph: {
        title: 'Weighbridge & Barcode Integration for APMC Mandi Software',
        description: 'Connect electronic weighbridges directly to your browser via Web Serial API. Eliminate manual weight entry errors at the APMC gate.',
        url: 'https://www.mandigrow.com/weighbridge-barcode-integration-mandi-software',
        type: 'website',
    },
};

export default function HardwareIntegrationPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            {/* JSON-LD for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebPage',
                        name: 'Weighbridge & Barcode Integration for APMC Mandi Software',
                        description: 'Connect electronic weighbridges directly to your browser via Web Serial API. Eliminate manual weight entry errors at the APMC gate.',
                        url: 'https://www.mandigrow.com/weighbridge-barcode-integration-mandi-software',
                    }),
                }}
            />
            
            {/* Nav */}
            <nav className="w-full border-b border-emerald-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white font-black text-xl">M</div>
                        <span className="text-xl font-bold tracking-tighter">MandiGrow</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/features" className="text-sm font-bold text-gray-700 hover:text-emerald-800 hidden md:block">Features</Link>
                        <Link href="/pricing" className="text-sm font-bold text-gray-700 hover:text-emerald-800 hidden md:block">Pricing</Link>
                        <Link href="/subscribe" className="bg-emerald-700 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-800 transition-all">Free Trial →</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-6 border border-emerald-200">
                    HARDWARE AUTOMATION · WEIGHBRIDGE · BARCODE
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.1]">
                    Direct <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-800">Weighbridge & Barcode</span> Integration
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mb-10 font-medium leading-relaxed">
                    Stop manually typing weights from the scale indicator. MandiGrow's Web Serial API integration reads electronic weighbridge data directly into the browser. Combined with our Keyboard Wedge barcode listener, your APMC gate entries and POS checkout become instantly faster and 100% error-free.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 transition-all hover:-translate-y-0.5">Start 14-Day Free Trial →</Link>
                    <Link href="/contact" className="px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition-all">Book a Hardware Demo</Link>
                </div>
            </section>

            {/* Features Detail */}
            <section className="bg-white border-y border-emerald-100 py-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-black mb-6 tracking-tight">Zero Manual Entry. Maximum Speed.</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            During peak season at a busy APMC, every second counts. Typing gross and tare weights manually leads to devastating financial errors. MandiGrow fixes this with direct hardware connectivity built natively for the web.
                        </p>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Usb className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Web Serial API for Scales</h3>
                                    <p className="text-gray-600 text-sm mt-1">Connect your RS232 or USB electronic scale directly to Chrome or Edge. MandiGrow reads the live streaming weight seamlessly without installing complex middleware.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <ScanBarcode className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Global Barcode Listening</h3>
                                    <p className="text-gray-600 text-sm mt-1">Scan a lot's QR code or barcode anywhere on the POS screen. The system instantly intercepts the scan, searches inventory, and selects the lot for rapid checkout.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Zap className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Per-Device Configuration</h3>
                                    <p className="text-gray-600 text-sm mt-1">Hardware settings are saved locally to the specific computer. Turn the scale on for the gate-entry PC, and turn the barcode scanner on for the checkout counter.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200 to-emerald-50 rounded-3xl transform rotate-3"></div>
                        <div className="relative bg-white border border-emerald-100 rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-black mb-6 border-b pb-4">Perfect For:</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">High-Volume Grain & Onion Mandis</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Busy Sabji / Vegetable Auctions</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Cold Storage Gate Entries</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Crate Tracking & Returns</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* CTA Section */}
            <section className="bg-emerald-900 text-white py-20 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black tracking-tighter mb-6">Upgrade Your Mandi Infrastructure Today</h2>
                    <p className="text-emerald-100 mb-10 text-lg">Don't let manual entry slow down your peak trading hours. Equip your mandi with the modern software it deserves.</p>
                    <Link href="/subscribe" className="inline-block px-10 py-5 bg-white text-emerald-900 font-black rounded-2xl shadow-xl hover:scale-105 transition-transform">
                        Start Your 14-Day Free Trial
                    </Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
