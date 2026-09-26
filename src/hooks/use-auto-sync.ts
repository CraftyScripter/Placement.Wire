'use client';

import { useEffect, useRef } from 'react';

const SESSION_SYNC_KEY = 'pw_panel_synced';

interface ArrivalSyncOpts {
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
 * Arrival sync: runs ONCE when the user opens the panel/dashboard in a session.
 * Removed the 15-minute background interval and window focus refetching to strictly
 * prevent Google API quota exhaustion.
 * After this initial arrival sync, further fetches only happen when the user manually clicks "Sync Mails".
 */
export function useAutoSync({ enabled, canRun, syncMails, onNewArrivals }: ArrivalSyncOpts) {
  const hasRunRef = useRef(false);
  const liveRef = useRef({ canRun, syncMails, onNewArrivals });
  liveRef.current = { canRun, syncMails, onNewArrivals };

  useEffect(() => {
    if (!enabled) return;

    // Check if we already synced during this visit/session
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem(SESSION_SYNC_KEY) === 'true') {
        return;
      }
    } catch {
      // sessionStorage unavailable, fall back to in-memory ref
    }

    if (hasRunRef.current) return;

    const executeArrivalSync = async () => {
      const { canRun: ok, syncMails: sync, onNewArrivals: notify } = liveRef.current;
      if (!ok) return;

      hasRunRef.current = true;
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(SESSION_SYNC_KEY, 'true');
        }
      } catch {
        /* ignore */
      }

      try {
        const res = await sync();
        if (res?.success && res.addedCount > 0) {
          notify(res.addedCount);
        }
      } catch (err) {
        console.warn('Arrival sync error:', err);
      }
    };

    executeArrivalSync();
  }, [enabled]);
}
