'use client';

import { useEffect, useRef, useCallback } from 'react';

const INTERVAL_MS = 15 * 60 * 1000;
const FOCUS_MIN_GAP_MS = 2 * 60 * 1000;
const INITIAL_DELAY_MS = 30 * 1000;

function inActiveWindow(): boolean {
  const hour = Number(
    new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone: 'Asia/Kolkata',
    }).format(new Date())
  );
  return hour >= 8 && hour < 22;
}

interface AutoSyncOpts {
  enabled: boolean;
  canRun: boolean;
  syncMails: () => Promise<{
    success: boolean;
    addedCount: number;
    updatedCount: number;
  } | undefined>;
  onNewArrivals: (addedCount: number) => void;
}

/**
 * Background Gmail polling based on observed mail timings (~1/day, bursty,
 * 9am–6pm IST): every 15 min, only when the tab is visible and inside the
 * 8am–10pm IST window, plus a refetch on window focus. Notifies only when
 * new drives actually arrived. Backs off after consecutive failures.
 */
export function useAutoSync({ enabled, canRun, syncMails, onNewArrivals }: AutoSyncOpts) {
  const live = useRef({ canRun, syncMails, onNewArrivals });
  live.current = { canRun, syncMails, onNewArrivals };
  const lastRun = useRef(0);
  const failures = useRef(0);

  const run = useCallback(async () => {
    const { canRun: ok, syncMails: sync, onNewArrivals: notify } = live.current;
    if (!ok) return;
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
    if (!inActiveWindow()) return;

    const res = await sync();
    if (res?.success) {
      failures.current = 0;
      lastRun.current = Date.now();
      if (res.addedCount > 0) notify(res.addedCount);
    } else {
      failures.current += 1;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      // Back off: after failures, require proportionally longer gaps.
      if (failures.current > 0 && Date.now() - lastRun.current < INTERVAL_MS * failures.current) {
        return;
      }
      run();
    };

    const id = setInterval(tick, INTERVAL_MS);
    const initial = setTimeout(run, INITIAL_DELAY_MS);
    const onFocus = () => {
      if (Date.now() - lastRun.current > FOCUS_MIN_GAP_MS) run();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(id);
      clearTimeout(initial);
      window.removeEventListener('focus', onFocus);
    };
  }, [enabled, run]);
}
