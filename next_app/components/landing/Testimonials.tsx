'use client'

import { Star, Quote } from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/components/i18n/language-provider'

const TESTIMONIALS = [
    {
        name: "Suresh Gupta",
        role: "Commission Agent, Azadpur Mandi",
        text: "Before MandiGrow, we had 3 accountants working until midnight matching khata balances. Now, the moment the auction ends, the farmer's patti and buyer's udhar are instantly updated. We save 5 hours every single day.",
        rating: 5,
        commodity: "Fruit Traders",
        imageColor: "bg-blue-600"
    },
    {
        name: "Ramesh Reddy",
        role: "Vegetable Wholesaler, Bowenpally",
        text: "The crate (jali) management feature alone is worth the price. We used to lose thousands of rupees every month because buyers wouldn't return empty plastic crates. Now everything is tracked directly on their ledger.",
        rating: 5,
        commodity: "Sabji Mandi",
        imageColor: "bg-emerald-600"
    },
    {
        name: "Prakash Patel",
        role: "Arhtiya, Vashi APMC",
        text: "My entire staff is not very educated, but they learned the Android billing app in 10 minutes. The Hindi printouts for farmers build so much trust. It's the best mandi software I have seen in 20 years of trading.",
        rating: 5,
        commodity: "Onion/Potato",
        imageColor: "bg-orange-600"
    }
]

export function Testimonials() {
    const { t } = useLanguage();
    return (
        <section className="py-24 px-6 bg-white relative z-10 border-t border-emerald-100">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-gray-900" dangerouslySetInnerHTML={{__html: t('landing.trust_title_p1') + '<span className="text-emerald-700">' + t('landing.trust_title_p2') + '</span>' + t('landing.trust_title_p3')}} />
                    <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
                        {t('landing.trust_desc')}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t, i) => (
                        <div key={i} className="bg-[#f7fbf3] border border-emerald-100 rounded-3xl p-8 shadow-sm relative group hover:border-emerald-300 transition-colors">
                            <Quote className="absolute top-6 right-6 w-10 h-10 text-emerald-100 group-hover:text-emerald-200 transition-colors z-0" />
                            
                            <div className="flex items-center gap-1 mb-6 relative z-10">
                                {[...Array(t.rating)].map((_, idx) => (
                                    <Star key={idx} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            
                            <p className="text-gray-700 text-lg leading-relaxed mb-8 relative z-10 font-medium">
                                "{t.text}"
                            </p>
                            
                            <div className="flex items-center gap-4 relative z-10 mt-auto border-t border-emerald-200/50 pt-6">
                                <div className={`w-12 h-12 rounded-full ${t.imageColor} flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-inner`}>
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{t.name}</div>
                                    <div className="text-xs text-gray-500 font-medium">{t.role}</div>
                                </div>
                            </div>
                            
                            {/* Small commodity badge */}
                            <div className="absolute -bottom-3 -right-3 bg-emerald-800 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">
                                {t.commodity}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
