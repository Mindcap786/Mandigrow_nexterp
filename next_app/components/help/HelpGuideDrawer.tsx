"use client";

import React, { useState } from "react";
import { HelpGuideContent } from "./HelpGuideContent";
import { BookOpen, X, HelpCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpGuideDrawerProps {
    /** Render a custom trigger button. If omitted, defaults to the standard ❓ icon button. */
    trigger?: React.ReactNode;
    /** Extra class on the trigger wrapper */
    className?: string;
}

export function HelpGuideDrawer({ trigger, className }: HelpGuideDrawerProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* ── Trigger ──────────────────────────────────────────────────── */}
            <div className={className}>
                {trigger ? (
                    <div onClick={() => setOpen(true)} className="cursor-pointer">
                        {trigger}
                    </div>
                ) : (
                    <button
                        id="help-guide-trigger"
                        onClick={() => setOpen(true)}
                        title="Help Guide"
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200",
                            "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800",
                            "border border-emerald-100 hover:border-emerald-200",
                            "text-xs font-black uppercase tracking-wider",
                            "group"
                        )}
                    >
                        <HelpCircle className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                        <span className="hidden sm:inline">Guide</span>
                    </button>
                )}
            </div>

            {/* ── Backdrop ──────────────────────────────────────────────────── */}
            {open && (
                <div
                    className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ── Drawer Panel ──────────────────────────────────────────────── */}
            <div
                id="help-guide-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="MandiGrow User Guide"
                className={cn(
                    "fixed right-0 top-0 bottom-0 z-[70] w-full max-w-3xl flex flex-col",
                    "bg-white shadow-2xl",
                    "transition-transform duration-300 ease-out",
                    open ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* ── Drawer Header ── */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-700 to-emerald-600 flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-black text-white tracking-tight">
                            MandiGrow User Guide
                        </h1>
                        <p className="text-xs text-emerald-200 truncate">
                            Setup → Purchase → Sales → Finance → Reports
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                            href="/guide"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors"
                            title="Open full guide page"
                        >
                            <ExternalLink className="w-3 h-3" />
                            <span className="hidden sm:inline">Full Page</span>
                        </a>
                        <button
                            id="help-guide-close"
                            onClick={() => setOpen(false)}
                            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                            aria-label="Close guide"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* ── Drawer Content (scrollable) ── */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    <HelpGuideContent />
                </div>
            </div>
        </>
    );
}
