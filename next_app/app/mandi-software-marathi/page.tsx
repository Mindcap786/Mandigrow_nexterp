import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'मंडी सॉफ्टवेअर | APMC Billing Software in Marathi | MandiGrow',
    description: 'महाराष्ट्रातील वाशी, नाशिक आणि पुणे मार्केटसाठी नंबर 1 मंडी सॉफ्टवेअर. 5 सेकंदात बिल बनवा, हमाली आणि तोलाई ऑटोमॅटिक कॅल्क्युलेट करा. मोफत ट्रायल घ्या.',
    keywords: [
        'मंडी सॉफ्टवेअर',
        'APMC billing software in Marathi',
        'Vashi mandi software',
        'Nashik onion software',
        'Commission agent software Maharashtra',
        'मंडी बिलिंग'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-marathi' },
};

const FEATURES = [
    { title: '५ सेकंदात बिलिंग', desc: 'शेकडो शेतकऱ्यांची बिले काही सेकंदात तयार करा. वेळ वाचवा आणि चुका टाळा.' },
    { title: 'ऑटोमॅटिक हमाली आणि तोलाई', desc: 'महाराष्ट्रातील प्रत्येक मार्केट कमिटीच्या नियमांनुसार टॅक्स आणि कपात ऑटोमॅटिक कॅल्क्युलेट करा.' },
    { title: 'WhatsApp पट्टी', desc: 'शेतकऱ्यांना त्यांची पट्टी आणि पेमेंट डिटेल्स थेट त्यांच्या WhatsApp वर पाठवा.' },
    { title: 'संपूर्ण इन्व्हेंटरी', desc: 'कांदा, बटाटा किंवा फळे — तुमच्या सर्व मालाचा ट्रॅक एकाच ठिकाणी ठेवा.' },
];

export default function MandiSoftwareMarathiPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'मंडी सॉफ्टवेअर', item: 'https://www.mandigrow.com/mandi-software-marathi' },
                ],
            }) }} />

            <nav className="w-full border-b border-emerald-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white font-black text-xl">M</div>
                        <span className="text-xl font-bold tracking-tighter">MandiGrow</span>
                    </Link>
                    <Link href="/subscribe" className="bg-emerald-700 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-800 transition-all">मोफत ट्रायल →</Link>
                </div>
            </nav>

            <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-6">
                    महाराष्ट्रातील नंबर १ APMC ERP
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    तुमचा मंडी व्यवसाय <br /><span className="text-emerald-700">आता डिजिटल करा</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
                    वाशी, नाशिक, आणि पुणे मार्केटमधील अडते (Commission Agents) आणि व्यापाऱ्यांसाठी बनवलेले खास सॉफ्टवेअर.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition">मोफत ट्रायल सुरू करा →</Link>
                    <Link href="/contact" className="px-8 py-4 bg-white border-2 border-emerald-200 text-emerald-800 font-black rounded-2xl hover:border-emerald-400 transition">डेमो बघा</Link>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-2 gap-6">
                    {FEATURES.map((m) => (
                        <div key={m.title} className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                            <h3 className="text-xl font-black text-emerald-800 mb-2">{m.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{m.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-emerald-700 rounded-2xl p-8 text-center text-white">
                    <h2 className="text-3xl font-black mb-3">आजच आपला व्यवसाय आधुनिक बनवा</h2>
                    <p className="text-emerald-100 mb-6">१४ दिवसांचे मोफत ट्रायल, क्रेडिट कार्डची गरज नाही.</p>
                    <Link href="/subscribe" className="inline-block px-8 py-4 bg-white text-emerald-800 font-black rounded-xl hover:bg-emerald-50 transition">आता सुरू करा →</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
