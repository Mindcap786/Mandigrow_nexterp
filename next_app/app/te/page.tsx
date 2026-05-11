import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'MandiGrow — భారతదేశంలో అత్యుత్తమ మండి ERP సాఫ్ట్‌వేర్',
    description:
        'MandiGrow భారతదేశంలో #1 మండి ERP సాఫ్ట్‌వేర్. కమిషన్ నిర్వహణ, రైతు ఖాత, APMC బిల్లింగ్, GST ఇన్వాయిస్ — అన్నీ ఒకే చోట. ఆంధ్ర ప్రదేశ్ మరియు తెలంగాణ మండులకు ప్రత్యేకంగా నిర్మించబడింది.',
    keywords: [
        'మండి ERP సాఫ్ట్‌వేర్ తెలుగు',
        'APMC సాఫ్ట్‌వేర్ తెలుగు',
        'mandi software Telugu',
        'APMC software Telugu',
        'commission agent software Telugu',
        'mandi ERP Andhra Pradesh Telugu',
        'MandiGrow Telugu',
    ],
    alternates: {
        canonical: 'https://www.mandigrow.com/te',
        languages: {
            'en': 'https://www.mandigrow.com',
            'te': 'https://www.mandigrow.com/te',
        },
    },
    openGraph: {
        title: 'MandiGrow — భారతదేశంలో #1 మండి ERP సాఫ్ట్‌వేర్',
        description: 'కమిషన్ నిర్వహణ, రైతు ఖాత, APMC బిల్లింగ్ — అన్నీ ఒకే యాప్‌లో.',
        url: 'https://www.mandigrow.com/te',
        locale: 'te_IN',
        type: 'website',
    },
};

const FEATURES_TE = [
    { icon: '💰', title: 'స్వయంచాలక కమిషన్ లెక్కింపు', desc: 'ప్రతి అమ్మకంపై కమిషన్, మార్కెట్ ఫీజు, హమాలీ స్వయంచాలకంగా లెక్కించబడతాయి. మానవ తప్పిదాలు శూన్యం.' },
    { icon: '📒', title: 'రైతు & వ్యాపారి ఖాత (లైవ్)', desc: 'ప్రతి లావాదేవీ నమోదైన వెంటనే ఖాత అప్‌డేట్ అవుతుంది. WhatsApp ద్వారా పట్టీ పంచుకోండి.' },
    { icon: '🧾', title: 'GST బిల్లింగ్ & APMC లెవీ', desc: 'GST-కంప్లయంట్ ఇన్వాయిస్‌లు మరియు APMC చెల్లింపులు స్వయంచాలకంగా నిర్వహించబడతాయి.' },
    { icon: '📱', title: 'Android మొబైల్ యాప్', desc: 'మండి గేట్ వద్ద Android ఫోన్‌లో బిల్లింగ్. ఆఫీస్‌లో డెస్క్‌టాప్‌లో రిపోర్ట్‌లు. ఒకే డేటా, ఎక్కడైనా.' },
    { icon: '🌾', title: 'లాట్ & గేట్ ఎంట్రీ', desc: 'వాహన రాక నుండి రైతు చెల్లింపు వరకు — పూర్తి లాట్ జీవిత చక్రం ఒకే వ్యవస్థలో.' },
    { icon: '📊', title: 'డే బుక్ & P&L రిపోర్ట్', desc: 'రోజువారీ లావాదేవీలు, లాభ నష్టాల లెక్క — క్లిక్‌తో రెడీ.' },
];

export default function TeluguHomePage() {
    return (
        <html lang="te" dir="ltr">
            <body>
                <main className="min-h-screen bg-[#dce7c8] text-gray-900 font-sans overflow-x-hidden">
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebPage',
                        name: 'MandiGrow — మండి ERP సాఫ్ట్‌వేర్ తెలుగు',
                        inLanguage: 'te',
                        url: 'https://www.mandigrow.com/te',
                        description: 'MandiGrow — భారతదేశంలో #1 మండి ERP సాఫ్ట్‌వేర్. కమిషన్ నిర్వహణ, రైతు ఖాత, APMC బిల్లింగ్.',
                        publisher: { '@type': 'Organization', name: 'MandiGrow', url: 'https://www.mandigrow.com' },
                    }) }} />

                    {/* Nav */}
                    <nav className="w-full border-b border-[#c8d6b0] bg-[#dce7c8]/90 backdrop-blur-md sticky top-0 z-50" aria-label="ప్రధాన నావిగేషన్">
                        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                            <Link href="/te" className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white font-black text-xl">M</div>
                                <span className="text-xl font-bold tracking-tighter text-gray-900">MandiGrow</span>
                            </Link>
                            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
                                <Link href="/te#features" className="hover:text-emerald-800 transition-colors">ఫీచర్లు</Link>
                                <Link href="/pricing" className="hover:text-emerald-800 transition-colors">ధర</Link>
                                <Link href="/" className="hover:text-emerald-800 transition-colors">English</Link>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-emerald-800">లాగిన్</Link>
                                <Link href="/subscribe" className="bg-emerald-700 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-800 transition-all">
                                    ఉచిత ట్రయల్ →
                                </Link>
                            </div>
                        </div>
                    </nav>

                    {/* Hero */}
                    <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-white/60 text-xs font-bold text-emerald-800 mb-8 backdrop-blur-sm shadow-sm">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                            </span>
                            భారతదేశంలో #1 మండి ERP · ఇప్పుడు లైవ్
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.1]">
                            భారతదేశంలో అత్యుత్తమ{' '}
                            <span className="text-emerald-700">మండి ERP సాఫ్ట్‌వేర్</span>
                        </h1>

                        <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10 font-medium leading-relaxed">
                            MandiGrow తో కమిషన్ నిర్వహణ, రైతు ఖాత, APMC బిల్లింగ్, GST ఇన్వాయిస్, డే బుక్ — అన్నీ ఒకే చోట. ఆంధ్ర ప్రదేశ్ మరియు తెలంగాణ మండులకు ప్రత్యేకంగా నిర్మించబడింది.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/subscribe" className="w-full sm:w-auto bg-emerald-700 text-white px-8 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg">
                                14 రోజులు ఉచిత ట్రయల్ →
                            </Link>
                            <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg text-emerald-800 border border-emerald-300 hover:bg-white/50 transition-all flex items-center justify-center">
                                ఇప్పటికే అకౌంట్ ఉందా? లాగిన్
                            </Link>
                        </div>

                        <p className="text-sm text-gray-500 mt-6">క్రెడిట్ కార్డ్ అవసరం లేదు · తెలుగులో డెమో అందుబాటులో ఉంది</p>
                    </section>

                    {/* Features */}
                    <section id="features" className="py-20 px-6 bg-[#e8f1d4] border-t border-[#c8d6b0]">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-4">
                                    MandiGrow ఫీచర్లు — మీ మండికి కావలసినవన్నీ
                                </h2>
                                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                    రైతు వచ్చినప్పటి నుండి సెటిల్‌మెంట్ వరకు — మొత్తం వ్యాపారం ఒకే యాప్‌లో నిర్వహించండి.
                                </p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-8">
                                {FEATURES_TE.map((f) => (
                                    <div key={f.title} className="bg-white border border-emerald-100 rounded-3xl p-8 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all">
                                        <div className="text-4xl mb-4">{f.icon}</div>
                                        <h3 className="text-xl font-black text-gray-900 mb-3">{f.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{f.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Trust */}
                    <section className="py-16 px-6 bg-white border-t border-emerald-100">
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-12 text-center">
                                MandiGrow ఎందుకు ఎంచుకోవాలి?
                            </h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-emerald-900 text-white p-8 rounded-3xl">
                                    <h3 className="text-2xl font-black mb-4">ఆంధ్ర ప్రదేశ్ & తెలంగాణ మండులకు</h3>
                                    <ul className="space-y-3 text-emerald-100">
                                        {['గుంటూర్, కర్నూల్, విజయవాడ, రాజమహేంద్రవరం', 'హైదరాబాద్, వరంగల్, నిజామాబాద్, కరీంనగర్', 'మిర్చి, వేరుశెనగ, ఉల్లి, వరి — అన్ని పంటలు', 'తెలుగు మరియు ఉర్దూ మద్దతు'].map((i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-emerald-400 flex-shrink-0">✓</span> {i}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl">
                                    <h3 className="text-2xl font-black text-gray-900 mb-4">ఇతర రాష్ట్రాలలో కూడా</h3>
                                    <ul className="space-y-3 text-gray-700">
                                        {['మహారాష్ట్ర — పుణే, ముంబై వాషి, నాశిక్', 'కర్ణాటక — బెంగళూరు, హుబ్బళ్ళి', 'మధ్యప్రదేశ్ — ఇండోర్, భోపాల్', '7 భాషలలో — హిందీ, ఇంగ్లీష్, తెలుగు మరియు మరిన్ని'].map((i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-emerald-600 flex-shrink-0">✓</span> {i}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="py-20 px-6 bg-[#dce7c8]">
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-6">
                                ఇప్పుడే ప్రారంభించండి — 14 రోజులు ఉచితం
                            </h2>
                            <p className="text-xl text-gray-600 mb-8">
                                క్రెడిట్ కార్డ్ అవసరం లేదు. తెలుగులో డెమో. మీ మండి 30 నిమిషాల్లో లైవ్ అవుతుంది.
                            </p>
                            <Link href="/subscribe" className="inline-block px-10 py-5 bg-emerald-700 text-white font-black text-xl rounded-2xl shadow-xl hover:bg-emerald-800 transition hover:scale-105">
                                ఉచిత ట్రయల్ ప్రారంభించండి →
                            </Link>
                            <p className="mt-6 text-sm text-gray-500">
                                ఇప్పటికే అకౌంట్ ఉందా?{' '}
                                <Link href="/login" className="text-emerald-700 font-bold hover:underline">లాగిన్ చేయండి</Link>
                            </p>
                        </div>
                    </section>

                    {/* Language switcher note */}
                    <div className="bg-emerald-50 border-t border-emerald-100 py-4 px-6 text-center text-sm text-gray-500">
                        Looking for the English version?{' '}
                        <Link href="/" className="text-emerald-700 font-bold hover:underline">Visit mandigrow.com →</Link>
                    </div>

                    <LandingFooter />
                </main>
            </body>
        </html>
    );
}
