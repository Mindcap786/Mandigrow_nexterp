'use client';

/**
 * GettingStartedChecklist.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A premium, collapsible Getting Started card for the Dashboard.
 *
 * - Animated progress bar fills green as tasks are completed.
 * - Each item links directly to the relevant page.
 * - "Dismiss" button hides it permanently (saved to localStorage).
 * - Fully auto-detected: no manual input needed from the user.
 * - Collapses gracefully when all tasks are complete.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X, Zap, ArrowRight } from 'lucide-react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  stats?: any;
  organization?: any;
}

export function GettingStartedChecklist({ stats, organization }: Props) {
  const {
    checklistDismissed,
    dismissChecklist,
    checklistItems,
    checklistProgress,
  } = useOnboarding(stats, organization);

  const [expanded, setExpanded] = useState(true);

  // Don't render if dismissed
  if (checklistDismissed) return null;

  const doneCount = checklistItems.filter(i => i.done).length;
  const totalCount = checklistItems.length;
  const allDone = doneCount === totalCount;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white shadow-sm overflow-hidden mb-6"
      >
        {/* Decorative top bar */}
        <div
          className="h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 transition-all duration-700"
          style={{ width: `${checklistProgress}%` }}
        />

        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-3 flex-1 text-left group"
          >
            {/* Icon */}
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-200">
                <Zap className="w-4 h-4 text-white" />
              </div>
              {!allDone && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
                  <span className="text-[8px] font-black text-white">{totalCount - doneCount}</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-black text-slate-900 leading-none">
                {allDone ? '🎉 Setup Complete!' : 'Getting Started'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {doneCount} of {totalCount} tasks done · {checklistProgress}%
              </p>
            </div>

            <div className="ml-auto text-slate-400 group-hover:text-slate-600 transition-colors">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {/* Dismiss */}
          <button
            onClick={dismissChecklist}
            title="Dismiss checklist"
            className="ml-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Expandable checklist */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="checklist-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className="px-5 pb-4 space-y-1">
                {checklistItems.map((item, idx) => (
                  <ChecklistRow key={item.id} item={item} index={idx} />
                ))}
              </div>

              {/* Call to action when all done */}
              {allDone && (
                <div className="mx-5 mb-5 p-4 rounded-xl bg-emerald-500 text-white">
                  <p className="text-sm font-black">You are all set! 🚀</p>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Explore advanced features or invite your team.
                  </p>
                  <Link
                    href="/settings/team"
                    className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-white/80 hover:text-white transition-colors"
                  >
                    Invite Team <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Individual checklist row ──────────────────────────────────────────────────
interface ChecklistRowProps {
  item: { id: string; label: string; done: boolean; href?: string };
  index: number;
}

function ChecklistRow({ item, index }: ChecklistRowProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
        item.done
          ? 'opacity-60'
          : item.href
          ? 'hover:bg-emerald-50 cursor-pointer'
          : '',
      )}
    >
      {/* Status icon */}
      <div className="shrink-0">
        {item.done ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <Circle className="w-4 h-4 text-slate-300 group-hover:text-emerald-400 transition-colors" />
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          'text-sm font-medium flex-1',
          item.done ? 'line-through text-slate-400' : 'text-slate-700',
        )}
      >
        {item.label}
      </span>

      {/* Arrow for pending items with a link */}
      {!item.done && item.href && (
        <ArrowRight className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </motion.div>
  );

  if (item.href && !item.done) {
    return <Link href={item.href}>{content}</Link>;
  }
  return content;
}
