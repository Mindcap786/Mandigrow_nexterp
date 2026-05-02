// Real-time provisioning progress page.
//
// Reads the form payload that /signup stashed in sessionStorage, opens
// an SSE stream against /api/public/signup, and renders ACTUAL backend
// stages as they fire — no fake percentage animation, no setTimeout lies.
//
// On `done`: clears the payload from sessionStorage and forwards to either
// /signup/verify (email confirmation) or /dashboard.
// On `error`: shows the failing stage with a retry button.
//
// SSE is consumed via fetch + ReadableStream (not EventSource) so we can
// POST the body, set Accept, and abort cleanly on unmount.

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const SIGNUP_STORAGE_KEY = '__mandigrow_signup_payload';

type StageKey =
    | 'validate'
    | 'reserve_slug'
    | 'create_frappe_org'
    | 'create_supabase_user'
    | 'link_back'
    | 'ready';

interface Stage {
    key: StageKey;
    label: string;
    detail: string;
}

// Display-side stage metadata. Order MUST match provisionTenant.ts.
const STAGES: Stage[] = [
    { key: 'validate',             label: 'Verifying details',           detail: 'Checking email, username and password strength' },
    { key: 'reserve_slug',         label: 'Reserving workspace name',    detail: 'Picking a unique URL for your mandi' },
    { key: 'create_frappe_org',    label: 'Building your Mandi workspace', detail: 'Spinning up books, lots, gate entry & POS' },
    { key: 'create_supabase_user', label: 'Creating your secure account', detail: 'Provisioning encrypted credentials' },
    { key: 'link_back',            label: 'Linking modules',             detail: 'Wiring inventory · billing · payments' },
    { key: 'ready',                label: 'Workspace ready',             detail: 'Final checks and handoff' },
];

interface StageState {
    status: 'pending' | 'running' | 'complete' | 'error';
    elapsedMs?: number;
}

type ProvisionEvent =
    | { kind: 'stage'; stage: StageKey; status: 'running' | 'complete'; label: string; progress: number; elapsedMs: number }
    | { kind: 'done'; organizationId: string; userId: string; frappeOrgId: string; slug: string; emailVerificationRequired: boolean; redirect: string; elapsedMs: number }
    | { kind: 'error'; stage: StageKey; message: string; code: string; elapsedMs: number };

export default function ProvisioningPage() {
    const router = useRouter();
    const [stages, setStages] = useState<Record<StageKey, StageState>>(() =>
        Object.fromEntries(STAGES.map(s => [s.key, { status: 'pending' as const }])) as Record<StageKey, StageState>
    );
    const [progress, setProgress] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [done, setDone] = useState<Extract<ProvisionEvent, { kind: 'done' }> | null>(null);
    const [error, setError] = useState<Extract<ProvisionEvent, { kind: 'error' }> | null>(null);
    const startedAtRef = useRef<number>(0);
    const abortRef = useRef<AbortController | null>(null);

    // Wall-clock ticker — separate from server elapsedMs so the user always
    // sees a live counter even between backend events.
    useEffect(() => {
        if (done || error) return;
        const t = setInterval(() => setElapsed(Date.now() - startedAtRef.current), 100);
        return () => clearInterval(t);
    }, [done, error]);

    useEffect(() => {
        const raw = sessionStorage.getItem(SIGNUP_STORAGE_KEY);
        if (!raw) {
            // Nothing to do — bounce back to the form.
            router.replace('/signup');
            return;
        }

        const ctrl = new AbortController();
        abortRef.current = ctrl;
        startedAtRef.current = Date.now();

        (async () => {
            try {
                const res = await fetch('/api/public/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept':       'text/event-stream',
                    },
                    body:   raw,
                    signal: ctrl.signal,
                });

                if (!res.ok || !res.body) {
                    const txt = await res.text().catch(() => '');
                    setError({
                        kind: 'error', stage: 'validate', code: 'HTTP_FAIL',
                        message: txt || `Request failed (${res.status})`, elapsedMs: 0,
                    });
                    return;
                }

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buf = '';

                while (true) {
                    const { value, done: streamDone } = await reader.read();
                    if (streamDone) break;
                    buf += decoder.decode(value, { stream: true });

                    // SSE frames are separated by a blank line.
                    let idx;
                    while ((idx = buf.indexOf('\n\n')) !== -1) {
                        const frame = buf.slice(0, idx);
                        buf = buf.slice(idx + 2);
                        const dataLine = frame.split('\n').find(l => l.startsWith('data:'));
                        if (!dataLine) continue;
                        try {
                            const evt: ProvisionEvent = JSON.parse(dataLine.slice(5).trim());
                            handleEvent(evt);
                        } catch { /* ignore malformed */ }
                    }
                }
            } catch (e: any) {
                if (e?.name === 'AbortError') return;
                setError({
                    kind: 'error', stage: 'validate', code: 'NETWORK',
                    message: e?.message || 'Network error', elapsedMs: 0,
                });
            }
        })();

        return () => ctrl.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleEvent(evt: ProvisionEvent) {
        if (evt.kind === 'stage') {
            setStages(prev => {
                const next = { ...prev };
                // Mark every previous stage as complete (catches missed events).
                let seenSelf = false;
                for (const s of STAGES) {
                    if (s.key === evt.stage) {
                        next[s.key] = { status: evt.status, elapsedMs: evt.elapsedMs };
                        seenSelf = true;
                    } else if (!seenSelf && next[s.key].status !== 'complete') {
                        next[s.key] = { status: 'complete', elapsedMs: next[s.key].elapsedMs };
                    }
                }
                return next;
            });
            setProgress(evt.progress);
        } else if (evt.kind === 'done') {
            setStages(prev => {
                const next = { ...prev };
                for (const s of STAGES) next[s.key] = { status: 'complete', elapsedMs: next[s.key].elapsedMs };
                return next;
            });
            setProgress(100);
            setDone(evt);
            sessionStorage.removeItem(SIGNUP_STORAGE_KEY);
            // Hand off after a short victory beat so the user sees the success state.
            setTimeout(() => router.replace(evt.redirect || '/dashboard'), 1400);
        } else if (evt.kind === 'error') {
            setStages(prev => {
                const next = { ...prev };
                next[evt.stage] = { status: 'error', elapsedMs: evt.elapsedMs };
                return next;
            });
            setError(evt);
        }
    }

    const currentStage = useMemo(() => {
        const running = STAGES.find(s => stages[s.key].status === 'running');
        return running || STAGES.find(s => stages[s.key].status !== 'complete') || STAGES[STAGES.length - 1];
    }, [stages]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Headline + status */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-[0.3em] font-black text-emerald-300 mb-6">
                        <Sparkles className="w-3 h-3" />
                        Provisioning
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
                        {done ? 'Workspace ready' : error ? 'Something went wrong' : 'Building your workspace'}
                    </h1>
                    <p className="mt-3 text-slate-300/80 max-w-md mx-auto">
                        {done
                            ? "Hold tight — taking you in now."
                            : error
                            ? error.message
                            : currentStage.detail + '…'}
                    </p>
                </div>

                {/* Progress bar */}
                <div className="mb-3 flex items-baseline justify-between text-xs font-mono text-slate-400">
                    <span>{progress}%</span>
                    <span>{(elapsed / 1000).toFixed(1)}s elapsed</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
                    <div
                        className={cn(
                            "h-full rounded-full transition-[width] duration-500 ease-out",
                            error
                                ? "bg-gradient-to-r from-red-500 to-orange-500"
                                : "bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400"
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Stage list */}
                <ol className="mt-10 space-y-3">
                    {STAGES.map((s, i) => {
                        const st = stages[s.key];
                        return (
                            <li
                                key={s.key}
                                className={cn(
                                    "flex items-center gap-4 px-5 py-4 rounded-2xl border backdrop-blur-sm transition-all",
                                    st.status === 'complete' && "bg-emerald-500/5  border-emerald-500/20",
                                    st.status === 'running'  && "bg-white/5         border-white/15 ring-1 ring-emerald-400/30",
                                    st.status === 'pending'  && "bg-white/[0.02]    border-white/10 opacity-60",
                                    st.status === 'error'    && "bg-red-500/10      border-red-500/30",
                                )}
                            >
                                <StageIcon status={st.status} index={i} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className={cn(
                                            "font-bold text-sm",
                                            st.status === 'pending' ? "text-slate-400" : "text-white"
                                        )}>
                                            {s.label}
                                        </p>
                                        {st.elapsedMs != null && st.status === 'complete' && (
                                            <span className="text-[10px] font-mono text-emerald-300/70">
                                                +{((st.elapsedMs) / 1000).toFixed(2)}s
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 truncate">{s.detail}</p>
                                </div>
                            </li>
                        );
                    })}
                </ol>

                {/* Outcome panel */}
                {done && (
                    <div className="mt-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-5 text-center">
                        <div className="flex items-center justify-center gap-2 text-emerald-300 font-black uppercase tracking-widest text-xs">
                            <CheckCircle2 className="w-4 h-4" />
                            All set — workspace <span className="text-emerald-200">/{done.slug}</span> created
                        </div>
                        {done.emailVerificationRequired ? (
                            <p className="mt-2 text-sm text-slate-300">
                                We sent a verification link to your email. Click it to start using your workspace.
                            </p>
                        ) : (
                            <p className="mt-2 text-sm text-slate-300">Redirecting to your dashboard…</p>
                        )}
                    </div>
                )}

                {error && (
                    <div className="mt-8 rounded-2xl bg-red-500/10 border border-red-500/30 p-5">
                        <div className="flex items-center gap-2 text-red-300 font-black uppercase tracking-widest text-xs">
                            <AlertTriangle className="w-4 h-4" />
                            Failed at: {STAGES.find(s => s.key === error.stage)?.label || error.stage}
                        </div>
                        <p className="mt-2 text-sm text-slate-200">{error.message}</p>
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => router.push('/signup')}
                                className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition"
                            >
                                Try again <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StageIcon({ status, index }: { status: StageState['status']; index: number }) {
    if (status === 'complete') {
        return (
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            </div>
        );
    }
    if (status === 'running') {
        return (
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-emerald-300 animate-spin" />
            </div>
        );
    }
    if (status === 'error') {
        return (
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-300" />
            </div>
        );
    }
    return (
        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
            <span className="text-[11px] font-mono text-slate-400">{String(index + 1).padStart(2, '0')}</span>
        </div>
    );
}
