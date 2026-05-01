'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { callApi } from '@/lib/frappeClient';
import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/hooks/use-toast';

export type AlertSeverity = 'medium' | 'high' | 'critical' | 'emergency';
export type AlertType = 'AGING_WARNING' | 'AGING_CRITICAL' | 'LOW_STOCK' | 'CRITICAL_STOCK' | 'OUT_OF_STOCK' | 'VALUE_AT_RISK';

export interface StockAlert {
    id: string;
    organization_id: string;
    alert_type: AlertType;
    severity: AlertSeverity;
    commodity_id: string | null;
    commodity_name: string;
    associated_lot_id: string | null;
    location_name: string | null;
    current_value: number;
    threshold_value: number;
    unit: string | null;
    is_seen: boolean;
    seen_at: string | null;
    is_resolved: boolean;
    resolved_at: string | null;
    created_at: string;
}

interface StockAlertsContextType {
    alerts: StockAlert[];
    unreadCount: number;
    isLoading: boolean;
    resolveAlert: (id: string) => Promise<void>;
    markAllSeen: () => Promise<void>;
    markAllResolved: () => Promise<void>;
    refresh: () => Promise<void>;
}

const StockAlertsContext = createContext<StockAlertsContextType | undefined>(undefined);

export function StockAlertsProvider({ children }: { children: ReactNode }) {
    const { profile } = useAuth();
    const orgId = profile?.organization_id;
    const { toast } = useToast();

    const [alerts, setAlerts] = useState<StockAlert[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const unreadCount = alerts.filter(a => !a.is_seen).length;

    const fetchAlerts = useCallback(async () => {
        if (!orgId) return;
        setIsLoading(true);
        try {
            const data = await callApi('mandigrow.api.get_stock_alerts', {});
            setAlerts(data || []);
        } catch (err: any) {
            console.error("Error fetching stock alerts:", err);
        } finally {
            setIsLoading(false);
        }
    }, [orgId]);

    // Initial Load
    useEffect(() => {
        if (orgId) {
            fetchAlerts();
        } else {
            setAlerts([]);
            setIsLoading(false);
        }
    }, [orgId, fetchAlerts]);

    // Realtime Subscription neutralized for Frappe
    useEffect(() => {
        if (!orgId) return;
        // Frappe realtime would go here (socket.io)
    }, [orgId, toast]);

    const resolveAlert = async (id: string) => {
        if (!orgId) return;
        setAlerts((prev) => prev.map(a => a.id === id ? { ...a, is_resolved: true, is_seen: true } : a));
        // TODO: Implement Frappe resolve RPC
    };

    const markAllSeen = async () => {
        if (!orgId) return;
        setAlerts((prev) => prev.map(a => !a.is_seen ? { ...a, is_seen: true, seen_at: new Date().toISOString() } : a));
    };

    const markAllResolved = async () => {
        if (!orgId) return;
        setAlerts((prev) => prev.map(a => ({ ...a, is_resolved: true, is_seen: true })));
    };

    return (
        <StockAlertsContext.Provider value={{
            alerts,
            unreadCount,
            isLoading,
            resolveAlert,
            markAllSeen,
            markAllResolved,
            refresh: fetchAlerts
        }}>
            {children}
        </StockAlertsContext.Provider>
    );
}

export function useStockAlerts() {
    const context = useContext(StockAlertsContext);
    if (context === undefined) {
        throw new Error('useStockAlerts must be used within a StockAlertsProvider');
    }
    return context;
}
