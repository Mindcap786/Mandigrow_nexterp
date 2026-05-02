'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { AlertCircle, X, Info, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

type SystemAlert = {
    id: string;
    alert_type: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
};

export function SystemAlerts() {
    const { profile } = useAuth();
    const [alerts, setAlerts] = useState<SystemAlert[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile?.organization_id) {
            // Stubbed for Frappe
            setAlerts([]);
        }
    }, [profile]);

    const dismissAlert = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setAlerts(current => current.filter(a => a.id !== id));
    };

    if (loading || alerts.length === 0) return null;

    return (
        <div className="flex flex-col w-full z-40">
            {alerts.map((alert) => {
                const isCritical = alert.severity === 'critical';
                const isWarning = alert.severity === 'warning';
                
                let bgColor = 'bg-blue-500';
                let textColor = 'text-white';
                let Icon = Info;
                
                if (isCritical) {
                    bgColor = 'bg-red-500';
                    Icon = AlertCircle;
                } else if (isWarning) {
                    bgColor = 'bg-amber-500';
                    Icon = AlertTriangle;
                }

                return (
                    <div key={alert.id} className={`${bgColor} ${textColor} px-4 py-2 flex items-center justify-between text-sm font-medium shadow-sm`}>
                        <div className="flex items-center gap-2 flex-1 justify-center">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="text-center font-bold tracking-tight">
                                {alert.message}
                            </span>
                            {(alert.alert_type === 'subscription_expiry' || alert.alert_type === 'overdue_payment') && (
                                <Link href="/settings/billing" className="ml-2 underline underline-offset-2 font-black hover:opacity-80 transition-opacity">
                                    Manage Billing
                                </Link>
                            )}
                        </div>
                        <button 
                            onClick={(e) => dismissAlert(alert.id, e)}
                            className="p-1 hover:bg-black/10 rounded transition-colors"
                            aria-label="Dismiss alert"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
