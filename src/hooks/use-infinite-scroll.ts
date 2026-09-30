'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Chunked infinite scroll: renders `pageSize` items at a time and appends
 * more as the sentinel scrolls into view. Resets when `resetKey` changes.
 *
 * Uses a callback ref so the observer always tracks the *current* sentinel
 * node — a plain useRef goes stale after filter changes remount the sentinel,
 * which used to leave the spinner stuck forever.
 */
export function useInfiniteScroll(resetKey: string, pageSize = 15) {
  const [visible, setVisible] = useState(pageSize);
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisible(pageSize);
  }, [resetKey, pageSize]);

  useEffect(() => {
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((v) => v + pageSize);
        }
      },
      { rootMargin: '800px' }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [node, pageSize]);

  const sentinelRef = useCallback((el: HTMLDivElement | null) => {
    setNode(el);
  }, []);

  return { visible, sentinelRef };
}
