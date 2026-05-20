'use client';

import { useState } from 'react';
import { Calculator, Send, Download, ArrowRight, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function InteractivePattiGenerator() {
    const router = useRouter();
    const [crop, setCrop] = useState('Onions');
    const [weight, setWeight] = useState(50); // quintals
    const [rate, setRate] = useState(1500); // per quintal
    const [commission, setCommission] = useState(6); // %
    const [mandiTax, setMandiTax] = useState(1); // %
    
    // Calculations
    const grossAmount = weight * rate;
    const commissionAmt = (grossAmount * commission) / 100;
    const taxAmt = (grossAmount * mandiTax) / 100;
    const hamali = weight * 10; // flat 10 Rs per quintal
    
    // Farmer's net payable = Gross - Commission - Tax - Hamali
    const netPayable = grossAmount - commissionAmt - taxAmt - hamali;

    const handleAction = () => {
        router.push('/subscribe?ref=patti_generator');
    };

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-emerald-50/50 rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest mb-6">
                        <Calculator className="w-3.5 h-3.5" /> Interactive Demo
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-6">
                        See How Fast MandiGrow <br className="hidden md:block"/> Calculates Patti
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
                        Stop using calculators. Adjust the sliders below and watch the Farmer's digital bill update instantly.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    
                    {/* Controls (Left Side) */}
                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="space-y-8">
                            {/* Crop Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Select Crop</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Onions', 'Potatoes', 'Tomatoes', 'Garlic', 'Apples'].map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => setCrop(c)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${crop === c ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Weight Slider */}
                            <div>
                                <div className="flex justify-between text-sm font-bold text-gray-700 mb-3">
                                    <label>Weight (Quintals)</label>
                                    <span className="text-emerald-700">{weight} Qtl</span>
                                </div>
                                <input 
                                    type="range" min="10" max="500" step="10" value={weight}
                                    onChange={(e) => setWeight(Number(e.target.value))}
                                    className="w-full accent-emerald-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* Rate Slider */}
                            <div>
                                <div className="flex justify-between text-sm font-bold text-gray-700 mb-3">
                                    <label>Rate (₹ / Quintal)</label>
                                    <span className="text-emerald-700">₹ {rate.toLocaleString('en-IN')}</span>
                                </div>
                                <input 
                                    type="range" min="500" max="10000" step="100" value={rate}
                                    onChange={(e) => setRate(Number(e.target.value))}
                                    className="w-full accent-emerald-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Aadhat (%)</label>
                                    <input 
                                        type="number" value={commission} onChange={(e) => setCommission(Number(e.target.value))}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Mandi Tax (%)</label>
                                    <input 
                                        type="number" value={mandiTax} onChange={(e) => setMandiTax(Number(e.target.value))}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Receipt Output (Right Side) */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-teal-50 transform rotate-3 rounded-[2rem]"></div>
                        <div className="relative bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
                            
                            <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-100">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">Farmer Patti</h3>
                                    <p className="text-sm text-gray-500 font-medium mt-1">Generated by MandiGrow</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Date</p>
                                    <p className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString('en-IN')}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 font-medium">Crop & Quantity</span>
                                    <span className="text-gray-900 font-bold">{weight} Qtl {crop}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 font-medium">Rate / Qtl</span>
                                    <span className="text-gray-900 font-bold">₹ {rate.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-4 border-t border-gray-50">
                                    <span className="text-gray-900 font-black">Gross Amount</span>
                                    <span className="text-gray-900 font-black">₹ {grossAmount.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="bg-red-50/50 rounded-xl p-4 space-y-3 mb-8 border border-red-100">
                                <p className="text-xs font-black uppercase tracking-widest text-red-800 mb-2">Deductions</p>
                                <div className="flex justify-between text-sm text-red-900">
                                    <span>Commission ({commission}%)</span>
                                    <span className="font-bold">- ₹ {commissionAmt.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm text-red-900">
                                    <span>Mandi Tax ({mandiTax}%)</span>
                                    <span className="font-bold">- ₹ {taxAmt.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm text-red-900">
                                    <span>Hamali / Labor</span>
                                    <span className="font-bold">- ₹ {hamali.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="bg-emerald-50 rounded-xl p-6 mb-8 border border-emerald-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-emerald-800">Net Payable to Farmer</p>
                                    <p className="text-xs text-emerald-600 mt-0.5">Ready to Pay</p>
                                </div>
                                <div className="text-3xl font-black text-emerald-700">
                                    ₹ {netPayable.toLocaleString('en-IN')}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={handleAction} className="flex items-center justify-center gap-2 py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-500/30">
                                    <Send className="w-4 h-4" /> WhatsApp
                                </button>
                                <button onClick={handleAction} className="flex items-center justify-center gap-2 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-gray-900/20">
                                    <Download className="w-4 h-4" /> Print Patti
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
