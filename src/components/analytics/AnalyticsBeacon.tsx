'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const HEARTBEAT_MS = 3 * 60 * 1000;

/**
 * Site-wide analytics beacon, mounted once in the root layout.
 * - Pageview per navigation (anonymous grouped by IP+UA hash, no login needed)
 * - Presence heartbeat every 3 min while the tab is visible (powers "Live Now",
 *   does NOT inflate visit counters)
 * - Final ping on tab close with accumulated session seconds (avg session time)
 * Location is derived server-side from headers only — no browser permission.
 */
export function AnalyticsBeacon() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);
  const sessionStart = useRef<number>(Date.now());
  const pathnameRef = useRef<string | null>(null);
  pathnameRef.current = pathname;

  const post = (payload: Record<string, unknown>) => {
    fetch('/api/v1/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* analytics must never break navigation */
    });
  };

  // Pageview on navigation
  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return;
    lastSent.current = pathname;
    post({
      path: pathname,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    });
  }, [pathname]);

  // Presence heartbeat + closing session ping
  useEffect(() => {
    const beat = () => {
      if (document.visibilityState !== 'visible') return;
      post({ path: pathnameRef.current, heartbeat: true });
    };
    const bye = () => {
      const secs = Math.floor((Date.now() - sessionStart.current) / 1000);
      post({ path: pathnameRef.current, heartbeat: true, sessionSecs: secs });
    };
    const id = setInterval(beat, HEARTBEAT_MS);
    window.addEventListener('pagehide', bye);
    return () => {
      clearInterval(id);
      window.removeEventListener('pagehide', bye);
    };
  }, []);

  return null;
}
