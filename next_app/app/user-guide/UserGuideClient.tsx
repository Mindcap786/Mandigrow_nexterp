"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GUIDE_SECTIONS, GuideSection } from "@/lib/guide-content";
import {
    BookOpen, Users, Package, Truck, IndianRupee, Wallet, TrendingUp, Settings,
    ArrowRight, ChevronDown, ChevronRight, Lightbulb, AlertTriangle, CheckCircle2,
    HelpCircle, LogIn, MessageCircle
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
    Users, Package, Truck, IndianRupee, Wallet, TrendingUp, Settings,
};

function StepAccordion({ step, accentColor }: { step: { step: number; title: string; detail: string }; accentColor: string }) {
    const [open, setOpen] = useState(false);
    return (
        <button
            onClick={() => setOpen(!open)}
            className="w-full text-left border border-slate-100 rounded-2xl overflow-hidden hover:border-slate-200 hover:shadow-sm transition-all"
        >
            <div className="flex items-center gap-3 px-5 py-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm font-black bg-gradient-to-br ${accentColor}`}>
                    {step.step}
                </div>
                <span className="flex-1 text-base font-bold text-slate-800 text-left">{step.title}</span>
                {open
                    ? <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                }
            </div>
            {open && (
                <div className="px-5 pb-5 pt-1 bg-slate-50 border-t border-slate-100">
                    <p className="text-slate-600 leading-relaxed">{step.detail}</p>
                </div>
            )}
        </button>
    );
}

function SectionBlock({ section }: { section: GuideSection }) {
    const Icon = ICON_MAP[section.icon] || BookOpen;
    return (
        <section id={section.id} className="scroll-mt-32 bg-white rounded-3xl border border-slate-200 shadow-md shadow-slate-100 overflow-hidden">
            <div className={`bg-gradient-to-br ${section.color} p-8 md:p-10 text-white`}>
                <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <span className="inline-block text-[11px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-3">
                            {section.badge}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-black leading-tight">{section.title}</h2>
                        <p className="text-white/80 mt-2 text-base">{section.subtitle}</p>
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-10 space-y-8">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <p className="text-slate-700 leading-relaxed text-base">{section.overview}</p>
                </div>

                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Step-by-Step Guide
                    </h3>
                    <div className="space-y-2">
                        {section.steps.map((s) => (
                            <StepAccordion key={s.step} step={s} accentColor={section.color} />
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {section.tips.length > 0 && (
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-widest text-amber-700 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                Pro Tips
                            </h4>
                            <ul className="space-y-2">
                                {section.tips.map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                                        <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {section.warnings && section.warnings.length > 0 && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-widest text-red-700 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Important
                            </h4>
                            <ul className="space-y-2">
                                {section.warnings.map((w, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                                        {w}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export function UserGuideClient() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* ── Hero ───────────────────────────────────────────── */}
            <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 bg-white border-b border-slate-200 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:28px_28px]" />
                <div className="container relative mx-auto px-4 max-w-5xl text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold mb-6">
                        <BookOpen className="w-4 h-4" />
                        <span>Official MandiGrow Documentation</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
                        MandiGrow User Guide<br className="hidden md:block" />
                        <span className="text-emerald-600">— Complete Help Centre</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
                        Everything you need to run your mandi — from initial setup and first purchase to advanced reports and financial management. Written for mandi clerks, accountants and business owners.
                    </p>

                    {/* Quick jump links */}
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {GUIDE_SECTIONS.map((s) => {
                            const Icon = ICON_MAP[s.icon] || BookOpen;
                            return (
                                <a
                                    key={s.id}
                                    href={`#${s.id}`}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {s.badge}
                                </a>
                            );
                        })}
                    </div>

                    {/* Open in App button */}
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-2xl transition-colors shadow-lg shadow-emerald-600/20"
                    >
                        <LogIn className="w-4 h-4" />
                        Open MandiGrow App
                    </Link>
                </div>
            </section>

            {/* ── Sections ─────────────────────────────────────────── */}
            <div className="container mx-auto px-4 max-w-5xl py-16 space-y-10">
                {GUIDE_SECTIONS.map((section) => (
                    <SectionBlock key={section.id} section={section} />
                ))}

                {/* FAQ */}
                <section id="faq" className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-md shadow-slate-100">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center">
                            <HelpCircle className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { q: "Do I need accounting knowledge to use MandiGrow?", a: "No! MandiGrow is designed for mandi clerks who may not have formal accounting training. Everything is in plain language — just enter what happened and the system handles the accounting." },
                            { q: "Can multiple staff members log in at the same time?", a: "Yes. Each staff member gets their own login. The Owner/Admin controls which screens each person can access from Settings → Team." },
                            { q: "Does MandiGrow work on mobile phones?", a: "Yes. MandiGrow has a native-feeling mobile app experience. You can record gate entries, arrivals, and payments directly from your phone in the mandi yard." },
                            { q: "How is the Daybook different from the Ledger?", a: "The Daybook shows all cash transactions for ONE specific day across ALL parties. The Ledger shows ALL transactions across ALL days for ONE specific party." },
                            { q: "What happens if a buyer pays by cheque?", a: "Record the payment with Mode = Cheque. It appears in Cheque Management as Pending. When the bank clears it, mark it as Cleared — the bank balance auto-updates." },
                            { q: "Can I export reports to Excel or PDF?", a: "Yes. Every report has a Download button at the top right. Export as PDF for printing or Excel for further analysis." },
                        ].map(({ q, a }, i) => (
                            <div key={i} className="space-y-2">
                                <h4 className="font-bold text-slate-900 flex gap-2">
                                    <span className="text-emerald-600 font-black flex-shrink-0">Q.</span>
                                    {q}
                                </h4>
                                <p className="text-slate-600 leading-relaxed pl-6 text-sm">{a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-10 md:p-16 text-white shadow-2xl shadow-emerald-600/20 text-center">
                    <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to start?</h2>
                    <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">
                        Log in now and follow this guide step by step. Your first day's work will be fully recorded within minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold bg-white text-emerald-700 hover:bg-emerald-50 rounded-2xl transition-colors shadow-lg">
                            <LogIn className="w-4 h-4" />
                            Log In to MandiGrow
                        </Link>
                        <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold bg-white/15 hover:bg-white/25 text-white rounded-2xl transition-colors border border-white/20">
                            <MessageCircle className="w-4 h-4" />
                            Contact Support
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
