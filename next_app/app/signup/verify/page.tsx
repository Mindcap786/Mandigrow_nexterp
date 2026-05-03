// Landing page after a successful self-signup — tells the user to confirm
// their email before logging in. The verification link itself is sent and
// handled by Supabase Auth (configured in supabase.dashboard).

import { supabase } from '@/lib/supabaseClient'; // No-op stub — all calls return null
import Link from 'next/link';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function VerifyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white flex items-center justify-center p-6">
            <div className="w-full max-w-lg text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-emerald-300" />
                </div>
                <h1 className="text-4xl font-black tracking-tight">Check your inbox</h1>
                <p className="text-slate-300 text-lg">
                    We sent a verification link to your email. Click it to activate your workspace and start using MandiGrow.
                </p>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-left text-sm text-slate-300 space-y-2">
                    <p className="flex gap-2 items-start">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        Your 14-day free trial starts the moment you sign in.
                    </p>
                    <p className="flex gap-2 items-start">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        We do not charge until you upgrade — no card needed.
                    </p>
                    <p className="flex gap-2 items-start">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        Your data is fully isolated from other mandis on the platform.
                    </p>
                </div>
                <Link
                    href="/login"
                    className="inline-block rounded-2xl bg-white text-slate-900 px-6 py-3 font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition"
                >
                    Back to sign in
                </Link>
                <p className="text-xs text-slate-400">
                    Didn't receive it? Check spam, or{' '}
                    <Link href="/signup" className="text-emerald-300 underline">try again</Link>.
                </p>
            </div>
        </div>
    );
}
