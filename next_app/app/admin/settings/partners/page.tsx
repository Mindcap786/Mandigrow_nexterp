'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/frappeClient';
import { Settings, Save, Loader2, ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function PartnerSettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        commission_percentage: 30,
        hero_title: "Build a business selling India's Mandi Revolution",
        hero_subtitle: "Join MandiGrow's Partner Network. Earn 30% recurring commission on every mandi you onboard — for the lifetime of the subscription."
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await db.getDoc('Mandi Partner Settings', 'Mandi Partner Settings');
            if (data) {
                setSettings({
                    commission_percentage: data.commission_percentage || 30,
                    hero_title: data.hero_title || '',
                    hero_subtitle: data.hero_subtitle || ''
                });
            }
        } catch (e: any) {
            toast({ title: 'Error loading settings', description: e.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('/api/method/frappe.client.set_value', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctype: 'Mandi Partner Settings',
                    name: 'Mandi Partner Settings',
                    fieldname: {
                        commission_percentage: settings.commission_percentage,
                        hero_title: settings.hero_title,
                        hero_subtitle: settings.hero_subtitle
                    }
                })
            });
            toast({ title: 'Success', description: 'Partner program settings updated' });
        } catch (e: any) {
            toast({ title: 'Save Failed', description: e.message, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-500" />
                        Partner Program
                    </h1>
                    <p className="text-slate-500 mt-1 uppercase tracking-widest text-xs font-bold">Marketing & Commission Settings</p>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 opacity-50 text-indigo-500" />
                    <p className="font-medium">Loading configuration...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <Card className="bg-white shadow-sm border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-slate-900 flex items-center gap-2 text-lg">
                                <Settings className="w-5 h-5 text-indigo-400" /> Financial Parameters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold">Standard Commission Percentage (%)</Label>
                                <Input
                                    type="number"
                                    value={settings.commission_percentage}
                                    onChange={e => setSettings({ ...settings, commission_percentage: parseInt(e.target.value) || 0 })}
                                    className="bg-slate-50 border-slate-200 text-slate-900 w-32 font-bold"
                                />
                                <p className="text-xs text-slate-500">The recurring lifetime cut provided to partners.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-slate-900 flex items-center gap-2 text-lg">
                                <Settings className="w-5 h-5 text-indigo-400" /> Landing Page Marketing Copy
                            </CardTitle>
                            <CardDescription>
                                Updates made here instantly reflect on <code>/partners</code>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold">Hero Title (HTML supported)</Label>
                                <Input
                                    value={settings.hero_title}
                                    onChange={e => setSettings({ ...settings, hero_title: e.target.value })}
                                    className="bg-slate-50 border-slate-200 text-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold">Hero Subtitle</Label>
                                <Textarea
                                    value={settings.hero_subtitle}
                                    onChange={e => setSettings({ ...settings, hero_subtitle: e.target.value })}
                                    className="bg-slate-50 border-slate-200 text-slate-900 h-24"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-4">
                        <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Configuration
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
