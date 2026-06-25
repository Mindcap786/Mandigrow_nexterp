'use client';

/**
 * ProductTour.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium MandiGrow product tour component. (Built for react-joyride v3)
 *
 * DESKTOP (>1024px): react-joyride with custom glassmorphism tooltip.
 * MOBILE  (≤1024px): Existing BottomSheet for a native-feel guided tour.
 *
 * Tier 1 (5 steps) fires automatically on first login — never again after.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Joyride,
  EVENTS,
  STATUS,
  Step,
  EventData,
  TooltipRenderProps,
  PartialDeep,
  Styles,
} from 'react-joyride';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useAuth } from '@/components/auth/auth-provider';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle2, X, Sprout } from 'lucide-react';

// ── Mobile layout detection ───────────────────────────────────────────────────
function useIsMobileLayout() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

// ── Tour step definitions (Mandi domain language) ─────────────────────────────
interface TourStep {
  target: string;
  title: string;
  body: string;
  emoji: string;
  placement?: 'right' | 'left' | 'top' | 'bottom' | 'auto';
}

const TIER1_STEPS: TourStep[] = [
  {
    target: '[data-tour="tour-arrivals"]',
    title: 'Inward Your Stock First',
    emoji: '🌾',
    body: "Before anything can be sold, register a Farmer's truck arrival here. Each arrival creates numbered lots (e.g., LOT-001) for precise tracking.",
    placement: 'right',
  },
  {
    target: '[data-tour="tour-purchase-group"]',
    title: 'Commission & Direct Purchase',
    emoji: '🤝',
    body: 'MandiGrow supports both modes — Commission (Adhat) and Direct Purchase. Select the mode on each Arrival form.',
    placement: 'right',
  },
  {
    target: '[data-tour="tour-trading-pl"]',
    title: 'Your Profit — Live',
    emoji: '📊',
    body: 'Every rupee bought and sold updates Trading P&L automatically. No manual Excel entry ever.',
    placement: 'right',
  },
  {
    target: '[data-tour="tour-stock"]',
    title: 'Live Stock Status',
    emoji: '📦',
    body: 'See exactly how many bags/crates of each commodity are in your godown right now. Auto-updates after every sale.',
    placement: 'right',
  },
  {
    target: '[data-tour="tour-settings"]',
    title: 'Setup Your Mandi Profile',
    emoji: '⚙️',
    body: "Add your Mandi's name, GST number, logo, and bank UPI QR code. These appear on all printed invoices automatically.",
    placement: 'right',
  },
];

// ── Convert to Joyride Step[] format ─────────────────────────────────────────
function toJoyrideSteps(steps: TourStep[]): Step[] {
  return steps.map(s => ({
    target: s.target,
    content: s.body,
    title: s.title,
    placement: s.placement ?? 'right',
    disableBeacon: true,
    hideCloseButton: true,
    hideFooter: true,
    spotlightClicks: false,
  }));
}

// ── Custom glassmorphism tooltip component ────────────────────────────────────
function MandiTooltip({
  index,
  step,
  size,
  backProps,
  primaryProps,
  skipProps,
  isLastStep,
}: TooltipRenderProps) {
  const tourStep = TIER1_STEPS[index];
  return (
    <div
      className="relative bg-[#0f1a14] border border-white/10 rounded-2xl shadow-2xl p-5 w-[300px] text-white"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Step badge + skip */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-base">
            {tourStep?.emoji ?? '✨'}
          </div>
          <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-black">
            MandiGrow Tour · {index + 1}/{size}
          </p>
        </div>
        <button
          {...skipProps}
          className="text-white/30 hover:text-white/70 transition-colors p-1 rounded-lg hover:bg-white/10"
          title="Skip tour"
          aria-label="Skip tour"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-base font-black text-white mb-1.5 leading-tight">
        {tourStep?.title ?? (step.title as string)}
      </h3>

      {/* Body */}
      <p className="text-sm text-white/70 leading-relaxed mb-4">
        {tourStep?.body ?? (step.content as string)}
      </p>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mb-4">
        {Array.from({ length: size }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === index      ? 'w-5 bg-emerald-400'
              : i < index      ? 'w-1.5 bg-emerald-500/40'
                               : 'w-1.5 bg-white/15',
            )}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        {index > 0 && (
          <button
            {...backProps}
            className="px-3 py-2 rounded-xl text-xs font-bold text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            Back
          </button>
        )}
        <div className="flex-1" />
        <button
          {...primaryProps}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          {isLastStep
            ? <><CheckCircle2 className="w-3.5 h-3.5" /> Done!</>
            : <>Next <ArrowRight className="w-3.5 h-3.5" /></>
          }
        </button>
      </div>
    </div>
  );
}

// ── Joyride styles (v3 API — no `options` key inside Styles) ─────────────────
const joyrideStyles: PartialDeep<Styles> = {
  tooltip: {
    padding: 0,
    borderRadius: 0,
    background: 'transparent',
    boxShadow: 'none',
  },
  tooltipContainer: { textAlign: 'left' },
  buttonPrimary: { display: 'none' },
  buttonBack:    { display: 'none' },
  buttonSkip:    { display: 'none' },
  buttonClose:   { display: 'none' },
};

// ── Mobile Tour via BottomSheet ───────────────────────────────────────────────
interface MobileTourProps {
  steps: TourStep[];
  open: boolean;
  onFinish: () => void;
  onSkip: () => void;
}

function MobileTour({ steps, open, onFinish, onSkip }: MobileTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const current = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const handleNext = () => isLast ? onFinish() : setStepIndex(i => i + 1);

  if (!open || !current) return null;

  return (
    <BottomSheet
      open={open}
      onClose={onSkip}
      title=""
      snap="auto"
      footer={
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={onSkip}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
          >
            Skip Tour
          </button>

          {/* Progress dots */}
          <div className="flex-1 flex items-center justify-center gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === stepIndex ? 'w-5 bg-emerald-500' : 'w-1.5 bg-slate-200',
                )}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-black transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            {isLast
              ? <><CheckCircle2 className="w-4 h-4" /> Done!</>
              : <>Next <ArrowRight className="w-4 h-4" /></>
            }
          </button>
        </div>
      }
    >
      <div className="px-5 pb-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl">
            {current.emoji}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-black">
              Step {stepIndex + 1} of {steps.length}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Sprout className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] text-slate-400 font-medium">MandiGrow Tour</span>
            </div>
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2 leading-tight">{current.title}</h2>
        <p className="text-sm text-slate-500 leading-relaxed">{current.body}</p>
      </div>
    </BottomSheet>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export function ProductTour() {
  const { profile, loading: authLoading } = useAuth();
  const { tier1Done, statusLoading, markDone } = useOnboarding();
  const isMobile = useIsMobileLayout();

  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mount (SSR guard)
  useEffect(() => { setMounted(true); }, []);

  // Start tour once auth + status loaded and not yet done
  useEffect(() => {
    if (!mounted || authLoading || statusLoading) return;
    if (!profile) return;
    if (profile.role === 'super_admin') return; // Never show to super admin
    if (tier1Done) return;                       // Already completed

    // Delay so sidebar nav items fully render before spotlight
    const timer = setTimeout(() => {
      isMobile ? setMobileOpen(true) : setRun(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [mounted, authLoading, statusLoading, profile, tier1Done, isMobile]);

  const handleFinish = useCallback(() => {
    setRun(false);
    setMobileOpen(false);
    markDone('tier1');
  }, [markDone]);

  const handleSkip = useCallback(() => {
    setRun(false);
    setMobileOpen(false);
    markDone('tier1'); // Skip = never show again
  }, [markDone]);

  // react-joyride v3 event handler
  const handleEvent = useCallback((data: EventData) => {
    const { status, type, action } = data;
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(i => i + (action === 'prev' ? -1 : 1));
    }
    if (status === STATUS.FINISHED) handleFinish();
    else if (status === STATUS.SKIPPED || action === 'close') handleSkip();
  }, [handleFinish, handleSkip]);

  if (!mounted) return null;

  return (
    <>
      {/* ── Desktop tour ── */}
      {!isMobile && (
        <Joyride
          steps={toJoyrideSteps(TIER1_STEPS)}
          run={run}
          stepIndex={stepIndex}
          continuous
          options={{
            overlayColor: 'rgba(0,0,0,0.72)',
            primaryColor: '#10b981',
            zIndex: 10000,
            skipBeacon: true,
            overlayClickAction: false,
            spotlightRadius: 12,
          }}
          styles={joyrideStyles}
          tooltipComponent={MandiTooltip}
          onEvent={handleEvent}
        />
      )}

      {/* ── Mobile tour ── */}
      {isMobile && (
        <MobileTour
          steps={TIER1_STEPS}
          open={mobileOpen}
          onFinish={handleFinish}
          onSkip={handleSkip}
        />
      )}
    </>
  );
}
