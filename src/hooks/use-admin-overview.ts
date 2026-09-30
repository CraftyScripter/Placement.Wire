'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AdminOverview } from '@/lib/analytics/store';

// Shared across all admin section pages: one network fetch, then memory cache.
let cache: AdminOverview | null = null;
let inflight: Promise<{ data: AdminOverview | null; forbidden: boolean }> | null = null;

async function load(): Promise<{ data: AdminOverview | null; forbidden: boolean }> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch('/api/v1/admin/overview', { cache: 'no-store' });
      if (res.status === 403) return { data: null, forbidden: true };
      const json = await res.json();
      if (json.success) {
        cache = json as AdminOverview;
        return { data: cache, forbidden: false };
      }
      return { data: null, forbidden: false };
    } catch {
      return { data: null, forbidden: false };
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function useAdminOverview() {
  const [data, setData] = useState<AdminOverview | null>(cache);
  const [loading, setLoading] = useState<boolean>(!cache);
  const [forbidden, setForbidden] = useState<boolean>(false);

  useEffect(() => {
    if (cache) return;
    let live = true;
    setLoading(true);
    load().then((r) => {
      if (!live) return;
      setData(r.data);
      setForbidden(r.forbidden);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    cache = null;
    setLoading(true);
    const r = await load();
    setData(r.data);
    setForbidden(r.forbidden);
    setLoading(false);
  }, []);

  return { data, loading, forbidden, refresh };
}
