'use client';

import { useEffect, useState } from 'react';

/**
 * Google-style scroll state: a single boolean flipped inside rAF via a
 * passive listener. Never animate blur/filter per scroll frame — that forces
 * repaints. Instead, components switch once between two cheap states
 * (transparent+blur at top, solid when scrolled).
 */
export function useScrolled(threshold = 16): boolean {  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      setScrolled(window.scrollY > threshold);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [threshold]);

  return scrolled;
}

/**
 * True while the user is actively scrolling (goes false ~180ms after the
 * last scroll event). Use it to pause infinite animations mid-scroll so the
 * compositor only handles the scroll itself — the single biggest scroll-jank
 * win after removing backdrop-filters from the scroll path.
 */
export function useScrollingActive(idleMs = 180): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onScroll = () => {
      setActive(true);
      clearTimeout(timer);
      timer = setTimeout(() => setActive(false), idleMs);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  }, [idleMs]);

  return active;
}
