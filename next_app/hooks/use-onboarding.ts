'use client';

/**
 * use-onboarding.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared hook for the MandiGrow product tour and getting-started checklist.
 *
 * State is persisted in TWO layers for reliability:
 *   1. localStorage — instant read/write, no round-trip needed
 *   2. Backend API  — persists across devices and browsers
 *
 * The rule: If either layer says "done", treat it as done.
 * The backend is the source of truth for cross-device consistency.
 */

import { useCallback, useEffect, useState } from 'react';
import { callApi } from '@/lib/frappeClient';
import { useAuth } from '@/components/auth/auth-provider';

// ── Local storage keys ────────────────────────────────────────────────────────
const LS_TOUR_TIER1 = 'mg_tour_tier1_done_v1';
const LS_TOUR_TIER2 = 'mg_tour_tier2_done_v1';
const LS_TOUR_TIER3 = 'mg_tour_tier3_done_v1';
const LS_CHECKLIST_DISMISSED = 'mg_checklist_dismissed_v1';
const LS_STOCK_VISITED = 'mg_stock_visited_v1';
const LS_BT_PAIRED = 'bt_printer_paired';

type TourTier = 'tier1' | 'tier2' | 'tier3';

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  href?: string;
}

export interface OnboardingState {
  tier1Done: boolean;
  tier2Done: boolean;
  tier3Done: boolean;
  statusLoading: boolean;
  markDone: (tier: TourTier) => void;
  checklistDismissed: boolean;
  dismissChecklist: () => void;
  checklistItems: ChecklistItem[];
  checklistProgress: number;
}

function getLocalBool(key: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(key) === 'true';
}

function setLocalBool(key: string, value: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value ? 'true' : 'false');
}

export function useOnboarding(stats?: any, organization?: any): OnboardingState {
  const { profile } = useAuth();

  const [tier1Done, setTier1Done] = useState<boolean>(() => getLocalBool(LS_TOUR_TIER1));
  const [tier2Done, setTier2Done] = useState<boolean>(() => getLocalBool(LS_TOUR_TIER2));
  const [tier3Done, setTier3Done] = useState<boolean>(() => getLocalBool(LS_TOUR_TIER3));
  const [statusLoading, setStatusLoading] = useState(true);
  const [checklistDismissed, setChecklistDismissed] = useState<boolean>(() =>
    getLocalBool(LS_CHECKLIST_DISMISSED)
  );

  // Fetch server-side status once on mount
  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await callApi('mandigrow.mandigrow.api.get_onboarding_status');
        if (cancelled) return;
        if (res?.tier1) { setTier1Done(true); setLocalBool(LS_TOUR_TIER1, true); }
        if (res?.tier2) { setTier2Done(true); setLocalBool(LS_TOUR_TIER2, true); }
        if (res?.tier3) { setTier3Done(true); setLocalBool(LS_TOUR_TIER3, true); }
      } catch {
        // Non-fatal: localStorage is the fallback
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [profile?.id]);

  const markDone = useCallback((tier: TourTier) => {
    if (tier === 'tier1') { setTier1Done(true); setLocalBool(LS_TOUR_TIER1, true); }
    if (tier === 'tier2') { setTier2Done(true); setLocalBool(LS_TOUR_TIER2, true); }
    if (tier === 'tier3') { setTier3Done(true); setLocalBool(LS_TOUR_TIER3, true); }
    callApi('mandigrow.mandigrow.api.mark_onboarding_complete', { tier }).catch(() => {});
  }, []);

  const dismissChecklist = useCallback(() => {
    setChecklistDismissed(true);
    setLocalBool(LS_CHECKLIST_DISMISSED, true);
  }, []);

  const checklistItems: ChecklistItem[] = [
    { id: 'account',  label: 'Create your account',                   done: true },
    { id: 'farmer',   label: 'Add your first Farmer / Supplier',       done: (stats?.network ?? 0) > 0,                                           href: '/contacts' },
    { id: 'arrival',  label: 'Process your first Arrival (Inward)',    done: (stats?.inventory ?? 0) > 0 || (stats?.arrivals_count ?? 0) > 0,     href: '/arrivals' },
    { id: 'sale',     label: 'Make your first Sale',                   done: (stats?.revenue ?? 0) > 0 || (stats?.sales_count ?? 0) > 0,          href: '/sales/pos' },
    { id: 'payment',  label: 'Record a Payment / Receipt',             done: (stats?.collections ?? 0) > 0,                                       href: '/finance/payments' },
    { id: 'logo',     label: 'Upload your Organisation Logo',          done: !!organization?.logo_url,                                            href: '/settings/branding' },
    { id: 'stock',    label: 'Check your Stock Status',                done: getLocalBool(LS_STOCK_VISITED),                                      href: '/stock' },
    { id: 'printer',  label: 'Connect a Thermal Printer',              done: getLocalBool(LS_BT_PAIRED),                                          href: '/sales' },
  ];

  const doneCount = checklistItems.filter(i => i.done).length;
  const checklistProgress = Math.round((doneCount / checklistItems.length) * 100);

  return {
    tier1Done, tier2Done, tier3Done,
    statusLoading, markDone,
    checklistDismissed, dismissChecklist,
    checklistItems, checklistProgress,
  };
}
