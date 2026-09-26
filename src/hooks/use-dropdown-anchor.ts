'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface AnchorPos {
  top: number;
  left: number;
}

/**
 * Positions a portaled dropdown menu relative to its trigger button using
 * fixed coordinates, and flips it above the trigger when there is not enough
 * room below. This keeps the menu above every sibling row regardless of
 * stacking contexts or overflow clipping.
 */
export function useDropdownAnchor(isOpen: boolean, align: 'left' | 'right' = 'right') {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<AnchorPos | null>(null);
  const [openUp, setOpenUp] = useState(false);

  const compute = useCallback(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const menuHeight = menu?.offsetHeight ?? 220;
    const menuWidth = menu?.offsetWidth ?? 160;
    const gap = 6;
    const margin = 8;

    const roomBelow = window.innerHeight - rect.bottom - gap;
    const flip = roomBelow < menuHeight && rect.top > roomBelow;
    setOpenUp(flip);

    const top = flip ? rect.top - gap - menuHeight : rect.bottom + gap;

    let left = align === 'right' ? rect.right - menuWidth : rect.left;
    left = Math.min(Math.max(margin, left), window.innerWidth - menuWidth - margin);

    setPos({
      top: Math.min(Math.max(margin, top), window.innerHeight - margin),
      left,
    });
  }, [align]);

  // Measure after the menu is painted (it must be mounted to know its size).
  useEffect(() => {
    if (!isOpen) {
      setPos(null);
      return;
    }
    compute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onScrollOrResize = () => compute();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [isOpen, compute]);

  return { triggerRef, menuRef, pos, openUp, recompute: compute };
}
