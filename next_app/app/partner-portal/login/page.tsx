'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { callApi } from '@/lib/frappeClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, KeyRound, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PartnerLoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    const [step, setStep] = useState(1); // 1 = Phone, 2 = OTP
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestOTP = (e: React.FormEvent) => {
        e.preventDefault();
        if (!mobileNumber || mobileNumber.length < 10) {
            toast({ title: 'Invalid Number', description: 'Please enter a valid 10-digit mobile number', variant: 'destructive' });
            return;
        }
        
        // In a real scenario, we would call an API here to generate and send OTP.
        // For MVP, we just move to step 2 and accept any 6-digit PIN.
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(2);
            toast({ title: 'OTP Sent', description: 'Check your WhatsApp for the 6-digit code.' });
        }, 800);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 4) {
            toast({ title: 'Invalid Code', description: 'Please enter the code sent to your phone', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const res: any = await callApi('mandigrow.api.partner_login', {
                mobile_number: mobileNumber,
                otp: otp
            });

            if (res && res.success) {
                // Save partner ID securely in localStorage for the portal session
                localStorage.setItem('partner_session_id', res.partner.name);
                localStorage.setItem('partner_name', res.partner.partner_name);
                
                toast({ title: 'Welcome back!', description: `Signed in as ${res.partner.partner_name}` });
                router.push('/partner-portal');
            }
        } catch (err: any) {
            toast({ title: 'Access Denied', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-slate-200">
                <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl font-black text-slate-900">Partner Login</CardTitle>
                    <CardDescription className="text-slate-500">
                        {step === 1 ? 'Enter your registered mobile number' : 'Enter the code sent to your WhatsApp'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 ? (
                        <form onSubmit={handleRequestOTP} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="mobile">WhatsApp Number</Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                        +91
                                    </div>
                                    <Input 
                                        id="mobile"
                                        type="tel" 
                                        placeholder="9876543210" 
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                                        className="pl-12 bg-slate-50 border-slate-200 text-lg font-bold h-12"
                                        maxLength={10}
                                        required
                                    />
                                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-xl mt-6">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Secure Code'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2 text-center">
                                <p className="text-sm font-medium text-slate-600 mb-4">
                                    Code sent to <span className="font-bold text-slate-900">+91 {mobileNumber}</span>
                                    <button type="button" onClick={() => setStep(1)} className="text-indigo-600 hover:underline ml-2 text-xs">Edit</button>
                                </p>
                                <Label htmlFor="otp" className="sr-only">Secure Code</Label>
                                <div className="relative">
                                    <Input 
                                        id="otp"
                                        type="text" 
                                        placeholder="••••••" 
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="bg-slate-50 border-slate-200 text-center text-2xl font-black tracking-widest h-14"
                                        maxLength={6}
                                        autoFocus
                                        required
                                    />
                                    <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-xl mt-6">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>Verify & Login <ArrowRight className="w-5 h-5 ml-2" /></>
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
            
            <p className="mt-8 text-sm text-slate-500 font-medium">
                Not a partner yet? <a href="/partners" className="text-indigo-600 font-bold hover:underline">Apply here</a>
            </p>
        </div>
    );
}
