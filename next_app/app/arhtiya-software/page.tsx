import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'आढ़तिया सॉफ्टवेयर | कमीशन एजेंट मंडी सॉफ्टवेयर | MandiGrow',
    description: 'आढ़तियों के लिए भारत का सबसे बेहतरीन सॉफ्टवेयर। किसान खाता, कमीशन हिसाब, हमाली, APMC लेवी — सब कुछ अपने आप। आज ही मुफ्त ट्रायल लें।',
    keywords: [
        'आढ़तिया सॉफ्टवेयर',
        'कमीशन एजेंट सॉफ्टवेयर',
        'आढ़त हिसाब किताब सॉफ्टवेयर',
        'मंडी आढ़त सॉफ्टवेयर',
        'किसान खाता सॉफ्टवेयर',
        'हमाली कैलकुलेटर सॉफ्टवेयर',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/arhtiya-software' },
};

const FEATURES = [
    { title: 'हमाली और APMC लेवी', desc: 'हर बिल पर हमाली, तुलाई, और APMC मार्केट फीस अपने आप कटती है। एक पैसे का भी नुकसान नहीं।' },
    { title: 'किसान का खाता', desc: 'हर किसान का अलग डिजिटल खाता। कितना माल आया, कितना पैसा दिया — सब रिकॉर्ड।' },
    { title: 'खरीदार का बकाया', desc: 'किस खरीदार पर कितना बकाया है, WhatsApp पर reminder भेजें, सब MandiGrow से।' },
    { title: 'GST पट्टी', desc: 'GST के साथ legal बिल और किसान पट्टी प्रिंट करें। Tally से connect करें।' },
];

export default function ArhtiyaSoftwarePage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'आढ़तिया सॉफ्टवेयर', item: 'https://www.mandigrow.com/arhtiya-software' },
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
                    आढ़तियों के लिए बना ERP
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    <span className="text-emerald-700">आढ़तिया सॉफ्टवेयर</span><br />जो आपका हिसाब खुद रखे
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
                    हमाली, APMC लेवी, किसान खाता, और GST बिलिंग — सब कुछ एक क्लिक में। MandiGrow भारत का एकमात्र सॉफ्टवेयर है जो आढ़त के काम को पूरी तरह समझता है।
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
                    <h2 className="text-3xl font-black mb-3">कागज़ का खाता छोड़िए, MandiGrow अपनाइए</h2>
                    <p className="text-emerald-100 mb-6">14 दिन मुफ्त — कोई credit card नहीं।</p>
                    <Link href="/subscribe" className="inline-block px-8 py-4 bg-white text-emerald-800 font-black rounded-xl hover:bg-emerald-50 transition">अभी शुरू करें →</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
