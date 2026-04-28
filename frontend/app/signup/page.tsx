// Public self-service signup form for new Mandi tenants.
//
// Submits to sessionStorage instead of fetching directly because the next
// page (/signup/provisioning) opens an SSE stream that needs the password
// in memory. Storing the form payload in sessionStorage (not localStorage)
// means it dies with the tab and never persists to disk.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Mail, Lock, User, Phone, AtSign, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SIGNUP_STORAGE_KEY = '__mandigrow_signup_payload';

export default function SignupPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        orgName:  '',
        fullName: '',
        email:    '',
        username: '',
        phone:    '',
        password: '',
    });
    const [agreed, setAgreed] = useState(false);

    const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value;
        if (k === 'username') v = v.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24);
        if (k === 'phone')    v = v.replace(/[^0-9+]/g, '');
        if (k === 'email')    v = v.trim();
        setForm(f => ({ ...f, [k]: v }));
    };

    function validateLocal(): string | null {
        if (!form.orgName.trim())                  return 'Organisation name is required.';
        if (!form.fullName.trim())                 return 'Your full name is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                                   return 'Enter a valid email address.';
        if (form.username.length < 6)              return 'Username must be at least 6 characters.';
        if (form.password.length < 8)              return 'Password must be at least 8 characters.';
        if (!agreed)                               return 'Please accept the terms to continue.';
        return null;
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        const localErr = validateLocal();
        if (localErr) { setError(localErr); return; }

        setSubmitting(true);
        // Hand off to the provisioning page via sessionStorage. Browser
        // navigation is the cleanest way to "transfer" an SSE-bound
        // payload without sticking secrets in the URL.
        try {
            sessionStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify(form));
            router.push('/signup/provisioning');
        } catch (e: any) {
            setSubmitting(false);
            setError('Could not start signup — please try again.');
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-indigo-50 flex">
            {/* Left: marketing column */}
            <aside className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white p-12 flex-col justify-between">
                <div>
                    <div className="text-3xl font-black tracking-tight">MandiGrow</div>
                    <p className="mt-1 text-emerald-100 text-sm font-semibold tracking-wide uppercase">Mandi ERP · Built for India</p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-4xl font-black leading-tight">
                        Start your<br/>own Mandi<br/>workspace.
                    </h2>
                    <ul className="space-y-3">
                        {[
                            '14-day free trial · no credit card',
                            'Isolated data — only your team sees it',
                            'Books, gate entry, lots, sales & POS',
                            'Works on phone, tablet and desktop',
                        ].map(b => (
                            <li key={b} className="flex items-center gap-3 text-emerald-50">
                                <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                                <span className="font-medium">{b}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="text-xs text-emerald-200/80">
                    Already have an account?{' '}
                    <Link href="/login" className="underline font-bold text-white">Sign in</Link>
                </p>
            </aside>

            {/* Right: form */}
            <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
                <form
                    onSubmit={onSubmit}
                    className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6"
                >
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Create your workspace</h1>
                        <p className="text-sm text-slate-500 mt-1">Takes about 30 seconds. We'll set up everything for you.</p>
                    </div>

                    <Field
                        label="Mandi / Organisation name"
                        icon={<Building2 className="w-4 h-4" />}
                        placeholder="e.g. Sri Sai Mandi"
                        value={form.orgName}
                        onChange={update('orgName')}
                        autoFocus
                    />

                    <Field
                        label="Your full name"
                        icon={<User className="w-4 h-4" />}
                        placeholder="e.g. Tariq Malik"
                        value={form.fullName}
                        onChange={update('fullName')}
                    />

                    <Field
                        label="Email"
                        type="email"
                        icon={<Mail className="w-4 h-4" />}
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={update('email')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Field
                            label="Username"
                            icon={<AtSign className="w-4 h-4" />}
                            placeholder="tariq786"
                            value={form.username}
                            onChange={update('username')}
                            hint="Min 6, lowercase + digits"
                        />
                        <Field
                            label="Mobile"
                            icon={<Phone className="w-4 h-4" />}
                            placeholder="9876543210"
                            value={form.phone}
                            onChange={update('phone')}
                            hint="Optional"
                        />
                    </div>

                    <Field
                        label="Password"
                        type="password"
                        icon={<Lock className="w-4 h-4" />}
                        placeholder="At least 8 characters"
                        value={form.password}
                        onChange={update('password')}
                    />

                    <label className="flex items-start gap-2 text-xs text-slate-600 select-none">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={e => setAgreed(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>
                            I agree to the{' '}
                            <Link href="/terms" className="text-emerald-700 underline">Terms</Link> and{' '}
                            <Link href="/privacy" className="text-emerald-700 underline">Privacy Policy</Link>.
                        </span>
                    </label>

                    {error && (
                        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className={cn(
                            "w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5",
                            "bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-sm",
                            "shadow-lg shadow-emerald-600/20 transition-all",
                            submitting && "opacity-60 cursor-not-allowed"
                        )}
                    >
                        {submitting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</>
                        ) : (
                            <>Create workspace <ArrowRight className="w-4 h-4" /></>
                        )}
                    </button>

                    <p className="text-center text-xs text-slate-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-emerald-700 font-bold">Sign in</Link>
                    </p>
                </form>
            </main>
        </div>
    );
}

function Field(props: {
    label: string;
    icon: React.ReactNode;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    autoFocus?: boolean;
    hint?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                {props.label}
            </label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {props.icon}
                </span>
                <input
                    type={props.type || 'text'}
                    placeholder={props.placeholder}
                    value={props.value}
                    onChange={props.onChange}
                    autoFocus={props.autoFocus}
                    autoComplete={props.type === 'password' ? 'new-password' : undefined}
                    className={cn(
                        "w-full pl-10 pr-3 py-2.5 rounded-xl border bg-slate-50/60",
                        "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100",
                        "text-sm font-medium text-slate-900 placeholder:text-slate-400",
                        "outline-none transition-all"
                    )}
                />
            </div>
            {props.hint && <p className="text-[10px] text-slate-400 ml-1">{props.hint}</p>}
        </div>
    );
}
