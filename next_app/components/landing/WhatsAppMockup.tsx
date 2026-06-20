'use client'

import { MessageCircle, Check, Image as ImageIcon } from 'lucide-react'

export function WhatsAppMockup() {
    return (
        <section className="py-24 px-6 bg-[#f7fbf3] relative z-10 border-t border-[#c8d6b0] overflow-hidden">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
                
                {/* Text Side */}
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800">
                        <MessageCircle className="w-4 h-4" /> WhatsApp Integration
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 leading-[1.1]">
                        Send Pattis on WhatsApp <span className="text-emerald-600">in 1 Click</span>
                    </h2>
                    <p className="text-xl text-gray-600 font-medium">
                        Stop printing paper. Generate a professional, GST-compliant Patti in Hindi or English, and send it directly to the farmer or buyer's WhatsApp with a single tap.
                    </p>
                    <ul className="space-y-3 font-bold text-gray-700">
                        <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-600" /> Instant PDF generation</li>
                        <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-600" /> Bilingual Support (Hindi, Telugu, English)</li>
                        <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-600" /> Builds trust with farmers through transparency</li>
                    </ul>
                </div>

                {/* Phone Mockup Side */}
                <div className="flex-1 relative w-full flex justify-center">
                    {/* Glow behind phone */}
                    <div className="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-full w-[300px] h-[500px] left-1/2 -translate-x-1/2" />
                    
                    {/* The Phone */}
                    <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden flex flex-col">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>
                        
                        {/* WhatsApp Header */}
                        <div className="bg-[#075e54] text-white pt-10 pb-3 px-4 flex items-center gap-3 z-10 shadow-md">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">RF</div>
                            <div>
                                <div className="font-bold">Ramesh Farmer</div>
                                <div className="text-[10px] text-white/80">online</div>
                            </div>
                        </div>

                        {/* WhatsApp Chat Area */}
                        <div className="flex-1 bg-[#efe7dd] p-4 flex flex-col justify-end gap-3 pb-8 relative" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'cover' }}>
                            {/* Message 1 */}
                            <div className="bg-white p-2 rounded-xl rounded-tl-none self-start max-w-[85%] text-sm shadow-sm text-gray-800 relative">
                                Ram Ram Seth ji, aaj ka hisab bhejna
                                <span className="text-[9px] text-gray-400 block text-right mt-1">11:30 AM</span>
                            </div>

                            {/* Message 2 (From Us) */}
                            <div className="bg-[#dcf8c6] p-2 rounded-xl rounded-tr-none self-end max-w-[85%] shadow-sm relative group cursor-pointer hover:bg-[#c9ebd1] transition-colors">
                                {/* Fake PDF Attachment */}
                                <div className="bg-white/80 rounded-lg p-3 flex items-center gap-3 mb-1 border border-emerald-100">
                                    <div className="w-10 h-10 bg-red-100 rounded text-red-600 flex items-center justify-center font-black text-xs">PDF</div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-gray-900 line-clamp-1">Kisan_Patti_Ramesh.pdf</div>
                                        <div className="text-[10px] text-gray-500">124 kB • 2 Pages</div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-800 px-1">
                                    Ramesh bhai, aapki aaj ki patti attach kar di hai. 20 crate tamatar bik gaye.
                                </div>
                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <span className="text-[9px] text-gray-500">11:32 AM</span>
                                    <Check className="w-3 h-3 text-blue-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}
