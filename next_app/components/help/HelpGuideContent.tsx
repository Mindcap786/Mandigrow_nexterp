"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { GUIDE_SECTIONS, GuideSection } from "@/lib/guide-content";
import {
    Users, Package, Truck, IndianRupee, Wallet, TrendingUp, Settings,
    ChevronDown, ChevronRight, Lightbulb, AlertTriangle, CheckCircle2,
    Search, BookOpen, ArrowRight
} from "lucide-react";

// ─── Icon Map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
    Users, Package, Truck, IndianRupee, Wallet, TrendingUp, Settings,
};

// ─── Step Card ────────────────────────────────────────────────────────────────
function StepCard({ step, color }: { step: { step: number; title: string; detail: string }; color: string }) {
    const [open, setOpen] = useState(false);
    return (
        <button
            onClick={() => setOpen(!open)}
            className={cn(
                "w-full text-left group transition-all duration-200",
                "border border-slate-100 rounded-2xl overflow-hidden",
                open ? "shadow-md" : "hover:shadow-sm hover:border-slate-200"
            )}
        >
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-3">
                <div className={cn(
                    "w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-black",
                    `bg-gradient-to-br ${color}`
                )}>
                    {step.step}
                </div>
                <span className="flex-1 text-sm font-bold text-slate-800">{step.title}</span>
                {open ? (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
            </div>
            {/* Detail */}
            {open && (
                <div className="px-4 pb-4 pt-1 bg-slate-50 border-t border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed">{step.detail}</p>
                </div>
            )}
        </button>
    );
}

// ─── Section Panel ────────────────────────────────────────────────────────────
function SectionPanel({ section }: { section: GuideSection }) {
    const Icon = ICON_MAP[section.icon] || BookOpen;

    return (
        <div className="space-y-6">
            {/* Hero Banner */}
            <div className={cn(
                "rounded-2xl p-5 text-white bg-gradient-to-br",
                section.color
            )}>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full mb-2">
                            {section.badge}
                        </span>
                        <h2 className="text-lg font-black leading-tight">{section.title}</h2>
                        <p className="text-sm text-white/80 mt-1">{section.subtitle}</p>
                    </div>
                </div>
            </div>

            {/* Overview */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-sm text-slate-700 leading-relaxed">{section.overview}</p>
            </div>

            {/* Steps */}
            <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Step-by-Step Guide
                </h3>
                <div className="space-y-2">
                    {section.steps.map((s) => (
                        <StepCard key={s.step} step={s} color={section.color} />
                    ))}
                </div>
            </div>

            {/* Tips */}
            {section.tips.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-amber-700 flex items-center gap-2">
                        <Lightbulb className="w-3.5 h-3.5" />
                        Pro Tips
                    </h4>
                    <ul className="space-y-1.5">
                        {section.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                                <ArrowRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Warnings */}
            {section.warnings && section.warnings.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-red-700 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Important — Read Before Proceeding
                    </h4>
                    <ul className="space-y-1.5">
                        {section.warnings.map((w, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-red-500" />
                                {w}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ─── Main Guide Drawer Content ─────────────────────────────────────────────────
export function HelpGuideContent() {
    const [activeId, setActiveId] = useState(GUIDE_SECTIONS[0].id);
    const [search, setSearch] = useState("");

    const activeSection = GUIDE_SECTIONS.find((s) => s.id === activeId) || GUIDE_SECTIONS[0];

    const filteredSections = useMemo(() => {
        if (!search.trim()) return GUIDE_SECTIONS;
        const q = search.toLowerCase();
        return GUIDE_SECTIONS.filter(
            (s) =>
                s.title.toLowerCase().includes(q) ||
                s.subtitle.toLowerCase().includes(q) ||
                s.overview.toLowerCase().includes(q) ||
                s.steps.some(
                    (step) =>
                        step.title.toLowerCase().includes(q) ||
                        step.detail.toLowerCase().includes(q)
                )
        );
    }, [search]);

    return (
        <div className="flex h-full min-h-0 overflow-hidden">

            {/* ── Left Sidebar Tab List ─────────────────────────── */}
            <div className="w-[200px] flex-shrink-0 flex flex-col border-r border-slate-100 bg-slate-50 overflow-hidden">
                {/* Search */}
                <div className="p-3 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search guide…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 text-slate-700 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Nav Items */}
                <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
                    {(search ? filteredSections : GUIDE_SECTIONS).map((section) => {
                        const Icon = ICON_MAP[section.icon] || BookOpen;
                        const isActive = section.id === activeId && !search;
                        return (
                            <button
                                key={section.id}
                                onClick={() => {
                                    setActiveId(section.id);
                                    setSearch("");
                                }}
                                className={cn(
                                    "w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-xs font-bold",
                                    isActive
                                        ? "bg-white shadow-sm text-slate-900"
                                        : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                                )}
                            >
                                <div className={cn(
                                    "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0",
                                    isActive
                                        ? `bg-gradient-to-br ${section.color} text-white`
                                        : "bg-slate-200 text-slate-500"
                                )}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                <span className="leading-tight truncate">{section.badge}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Right Content Area ────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-5 min-w-0">
                {search && filteredSections.length === 0 && (
                    <div className="text-center py-16 text-slate-400">
                        <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
                        <p className="text-sm font-medium">No results for "{search}"</p>
                        <p className="text-xs mt-1">Try a different keyword</p>
                    </div>
                )}
                {search && filteredSections.length > 0 ? (
                    <div className="space-y-8">
                        {filteredSections.map((s) => (
                            <SectionPanel key={s.id} section={s} />
                        ))}
                    </div>
                ) : (
                    <SectionPanel section={activeSection} />
                )}
            </div>
        </div>
    );
}
