'use client';

import { useState } from 'react';
import { X, ArrowRight, CheckCircle2, Phone, User, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    trigger: 'whatsapp' | 'print';
}

export function LeadCaptureModal({ isOpen, onClose, trigger }: LeadCaptureModalProps) {
    const router = useRouter();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [mandiName, setMandiName] = useState('');
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => {
            const params = new URLSearchParams({
                name,
                phone,
                mandi: mandiName,
                ref: trigger === 'whatsapp' ? 'patti_whatsapp' : 'patti_print',
            });
            router.push(`/subscribe?${params.toString()}`);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Top gradient accent */}
                <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    {!submitted ? (
                        <>
                            {/* Header */}
                            <div className="mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4 text-2xl">
                                    {trigger === 'whatsapp' ? '📲' : '🖨️'}
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {trigger === 'whatsapp'
                                        ? 'Send Patti on WhatsApp'
                                        : 'Print this Patti'}
                                </h3>
                                <p className="text-gray-500 text-sm font-medium mt-2">
                                    Create your free account in 30 seconds to unlock this feature — no credit card needed.
                                </p>
                            </div>

                            {/* Trust badges */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {['Free 14-day trial', 'No credit card', 'Setup in 2 min'].map(b => (
                                    <span key={b} className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                                        <CheckCircle2 className="w-3 h-3" /> {b}
                                    </span>
                                ))}
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Your Name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        required
                                        type="tel"
                                        placeholder="WhatsApp Number"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Your Mandi / Business Name"
                                        value={mandiName}
                                        onChange={e => setMandiName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white py-3.5 rounded-xl font-black text-sm transition-all shadow-lg shadow-emerald-700/30 mt-2"
                                >
                                    Start Free Trial <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>

                            <p className="text-center text-xs text-gray-400 font-medium mt-4">
                                Already have an account?{' '}
                                <a href="/login" className="text-emerald-600 font-bold hover:underline">Sign In</a>
                            </p>
                        </>
                    ) : (
                        /* Success State */
                        <div className="py-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">You're in! 🎉</h3>
                            <p className="text-gray-500 text-sm font-medium">Setting up your free account...</p>
                            <div className="mt-6 w-8 h-8 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
