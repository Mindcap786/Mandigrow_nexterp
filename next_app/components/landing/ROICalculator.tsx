'use client'

import { useState } from 'react'
import { Calculator, Clock, IndianRupee, TrendingUp } from 'lucide-react'

export function ROICalculator() {
    const [dailyLots, setDailyLots] = useState(50);
    const [avgCommission, setAvgCommission] = useState(5);

    // Assume manual billing takes 3 mins per lot. MandiGrow takes 30 seconds.
    const timeSavedMins = dailyLots * 2.5; 
    const timeSavedHours = (timeSavedMins / 60).toFixed(1);
    
    // Assume 1% leakage in manual math/forgotten crates.
    const avgLotValue = 10000;
    const dailyTurnover = dailyLots * avgLotValue;
    const monthlyLeakageSaved = (dailyTurnover * 0.01 * 26).toLocaleString('en-IN', { maximumFractionDigits: 0 });

    return (
        <section className="py-24 px-6 bg-white relative z-10 border-t border-[#c8d6b0]">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 mb-6">
                        <Calculator className="w-4 h-4" /> ROI Calculator
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-gray-900">
                        See How Much Time & Money You Save
                    </h2>
                    <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
                        Manual billing causes math errors, lost crates, and hours of late-night khata matching. See the MandiGrow impact.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-center bg-[#f7fbf3] border border-emerald-100 rounded-[40px] p-8 md:p-12 shadow-xl shadow-emerald-900/5">
                    
                    {/* Interactive Inputs */}
                    <div className="flex-1 w-full space-y-8">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="font-bold text-gray-700">Daily Lots / Pattis Generated</label>
                                <span className="font-black text-emerald-700 text-xl">{dailyLots}</span>
                            </div>
                            <input 
                                type="range" 
                                min="10" 
                                max="500" 
                                step="10"
                                value={dailyLots} 
                                onChange={(e) => setDailyLots(Number(e.target.value))}
                                className="w-full h-3 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="font-bold text-gray-700">Average Commission (%)</label>
                                <span className="font-black text-emerald-700 text-xl">{avgCommission}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="10" 
                                step="0.5"
                                value={avgCommission} 
                                onChange={(e) => setAvgCommission(Number(e.target.value))}
                                className="w-full h-3 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                            />
                        </div>
                    </div>

                    {/* Results Cards */}
                    <div className="flex-1 w-full grid sm:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                <Clock className="w-6 h-6" />
                            </div>
                            <p className="text-gray-500 font-bold text-sm mb-1">Daily Time Saved</p>
                            <p className="text-3xl font-black text-gray-900">{timeSavedHours} <span className="text-lg text-gray-500">hours</span></p>
                            <p className="text-xs text-emerald-600 font-bold mt-2 bg-emerald-50 px-2 py-1 rounded-md">Go home early</p>
                        </div>

                        <div className="bg-emerald-600 p-6 rounded-3xl shadow-md flex flex-col items-center text-center text-white">
                            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4 shadow-inner">
                                <IndianRupee className="w-6 h-6" />
                            </div>
                            <p className="text-emerald-100 font-bold text-sm mb-1">Monthly Leakage Prevented</p>
                            <p className="text-3xl font-black">₹{monthlyLeakageSaved}</p>
                            <p className="text-xs text-emerald-200 font-bold mt-2 bg-emerald-700/50 px-2 py-1 rounded-md tracking-wider">Zero math errors</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
