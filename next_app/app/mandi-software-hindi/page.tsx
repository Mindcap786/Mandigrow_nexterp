import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'मंडी सॉफ्टवेयर | फल सब्जी अनाज मंडी बिलिंग सॉफ्टवेयर | MandiGrow',
    description: 'भारत का सबसे बेहतरीन मंडी सॉफ्टवेयर। फल मंडी, सब्जी मंडी, अनाज मंडी के लिए बिलिंग, खाता और ERP सॉफ्टवेयर। आज ही मुफ्त ट्रायल शुरू करें।',
    keywords: [
        'मंडी सॉफ्टवेयर',
        'फल मंडी सॉफ्टवेयर',
        'सब्जी मंडी सॉफ्टवेयर',
        'अनाज मंडी सॉफ्टवेयर',
        'मंडी बिलिंग सॉफ्टवेयर',
        'कमीशन एजेंट सॉफ्टवेयर',
        'आढ़तिया सॉफ्टवेयर',
        'मंडी खाता सॉफ्टवेयर',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-hindi' },
};

const FEATURES = [
    { title: 'मंडी बिलिंग', desc: 'एक क्लिक में खरीदार और किसान दोनों के लिए बिल बनाएं। हिंदी में पर्ची और पट्टी का प्रिंट लें।' },
    { title: 'डिजिटल खाता', desc: 'कागज़ का खाता छोड़ें। MandiGrow पर हर किसान और व्यापारी का ऑनलाइन खाता रखें।' },
    { title: 'GST अनुपालन', desc: 'GST बिल, APMC लेवी, और हमाली चार्ज अपने आप कैलकुलेट होते हैं।' },
    { title: 'WhatsApp पर पट्टी', desc: 'किसान को सीधे WhatsApp पर पट्टी/पर्ची भेजें। कोई कागज़ नहीं, कोई झंझट नहीं।' },
];

export default function MandiSoftwareHindiPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'मंडी सॉफ्टवेयर', item: 'https://www.mandigrow.com/mandi-software-hindi' },
                ],
            }) }} />

            <nav className="w-full border-b border-emerald-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white font-black text-xl">M</div>
                        <span className="text-xl font-bold tracking-tighter">MandiGrow</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/subscribe" className="bg-emerald-700 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-800 transition-all">मुफ्त ट्रायल →</Link>
                    </div>
                </div>
            </nav>

            <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-6">
                    भारत का नंबर 1 मंडी ERP
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    <span className="text-emerald-700">मंडी सॉफ्टवेयर</span> जो<br />आपकी भाषा समझे
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
                    फल मंडी, सब्जी मंडी, अनाज मंडी, या कमीशन एजेंट — MandiGrow आपके पूरे व्यापार को डिजिटल बनाता है। किसान की पट्टी से लेकर GST तक, सब कुछ एक जगह।
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition">मुफ्त ट्रायल शुरू करें →</Link>
                    <Link href="/contact" className="px-8 py-4 bg-white border-2 border-emerald-200 text-emerald-800 font-black rounded-2xl hover:border-emerald-400 transition">डेमो बुक करें</Link>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-12">
                <h2 className="text-3xl font-black text-center mb-10">क्या-क्या मिलता है MandiGrow में?</h2>
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
                    <h2 className="text-3xl font-black mb-3">आज ही शुरू करें — बिल्कुल मुफ्त</h2>
                    <p className="text-emerald-100 mb-6">कोई credit card नहीं, कोई झंझट नहीं। 14 दिन का मुफ्त ट्रायल।</p>
                    <Link href="/subscribe" className="inline-block px-8 py-4 bg-white text-emerald-800 font-black rounded-xl hover:bg-emerald-50 transition">मुफ्त ट्रायल शुरू करें →</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
