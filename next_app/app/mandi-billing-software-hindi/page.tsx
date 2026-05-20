import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'मंडी बिलिंग सॉफ्टवेयर | फल सब्जी मंडी बिल सॉफ्टवेयर | MandiGrow',
    description: 'भारत का सबसे तेज़ मंडी बिलिंग सॉफ्टवेयर। 5 सेकंड में बिल बनाएं, WhatsApp पर पट्टी भेजें, GST बिल प्रिंट करें। मुफ्त ट्रायल लें।',
    keywords: [
        'मंडी बिलिंग सॉफ्टवेयर',
        'फल मंडी बिलिंग',
        'सब्जी मंडी बिल',
        'मंडी बिल सॉफ्टवेयर',
        'GST मंडी बिल',
        'खरीदार बिल सॉफ्टवेयर',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-billing-software-hindi' },
};

const FEATURES = [
    { title: '5 सेकंड में बिल', desc: 'keyboard shortcut से 5 सेकंड में खरीदार का बिल तैयार। बड़ी मंडी में सैकड़ों बिल रोज़ बनाएं।' },
    { title: 'WhatsApp पट्टी', desc: 'बिल बनते ही किसान को WhatsApp पर PDF पट्टी। प्रिंट की ज़रूरत नहीं।' },
    { title: 'Auto हमाली कटौती', desc: 'हर बिल में हमाली, तुलाई, मार्केट फीस अपने आप calculate होती है।' },
    { title: 'GST Legal बिल', desc: 'GST नंबर के साथ fully legal बिल। Income Tax और APMC audit में कोई दिक्कत नहीं।' },
];

export default function MandiBillingHindiPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'मंडी बिलिंग सॉफ्टवेयर', item: 'https://www.mandigrow.com/mandi-billing-software-hindi' },
                ],
            }) }} />

            <nav className="w-full border-b border-emerald-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white font-black text-xl">M</div>
                        <span className="text-xl font-bold tracking-tighter">MandiGrow</span>
                    </Link>
                    <Link href="/subscribe" className="bg-emerald-700 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-800 transition-all">मुफ्त ट्रायल →</Link>
                </div>
            </nav>

            <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-6">
                    भारत का सबसे तेज़ बिलिंग ERP
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    <span className="text-emerald-700">मंडी बिलिंग</span> अब<br />5 सेकंड में
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
                    फल मंडी, सब्जी मंडी या अनाज मंडी — MandiGrow से बिल बनाना इतना आसान है जितना कभी नहीं था। हमाली, GST, और WhatsApp पट्टी — सब एक जगह।
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition">मुफ्त ट्रायल शुरू करें →</Link>
                    <Link href="/contact" className="px-8 py-4 bg-white border-2 border-emerald-200 text-emerald-800 font-black rounded-2xl hover:border-emerald-400 transition">डेमो देखें</Link>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-2 gap-6">
                    {FEATURES.map((m) => (
                        <div key={m.title} className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-black text-emerald-800 mb-2">{m.title}</h3>
                            <p className="text-gray-600">{m.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-emerald-700 rounded-2xl p-8 text-center text-white">
                    <h2 className="text-3xl font-black mb-3">आज ही डिजिटल बनें — बिल्कुल मुफ्त</h2>
                    <p className="text-emerald-100 mb-6">14 दिन का मुफ्त ट्रायल, कोई credit card नहीं।</p>
                    <Link href="/subscribe" className="inline-block px-8 py-4 bg-white text-emerald-800 font-black rounded-xl hover:bg-emerald-50 transition">अभी शुरू करें →</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
