'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { ApplicationStatus } from '@/schemas/placement.schema';
import { useDropdownAnchor } from '@/hooks/use-dropdown-anchor';

interface StatusConfig {
  label: string;
  dotColor: string;
}

const STATUS_CONFIGS: Record<ApplicationStatus, StatusConfig> = {
  NEW: { label: 'New', dotColor: 'bg-indigo-400' },
  APPLIED: { label: 'Applied', dotColor: 'bg-sky-400' },
  SHORTLISTED: { label: 'Shortlisted', dotColor: 'bg-amber-400' },
  INTERVIEW_SCHEDULED: { label: 'Interview', dotColor: 'bg-purple-400' },
  SELECTED: { label: 'Selected', dotColor: 'bg-emerald-400' },
  REJECTED: { label: 'Rejected', dotColor: 'bg-rose-400' },
  ARCHIVED: { label: 'Archived', dotColor: 'bg-slate-400' },
};

const ALL_STATUSES: ApplicationStatus[] = [
  'NEW',
  'APPLIED',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'SELECTED',
  'REJECTED',
  'ARCHIVED',
];

interface StatusDropdownProps {
  status: ApplicationStatus;
  onChange: (newStatus: ApplicationStatus) => void;
  size?: 'sm' | 'md';
  className?: string;
  align?: 'left' | 'right';
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({
  status,
  onChange,
  size = 'sm',
  className = '',
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { triggerRef, menuRef, pos } = useDropdownAnchor(isOpen, align);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const current = STATUS_CONFIGS[status] || STATUS_CONFIGS.NEW;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-ink-input font-medium text-neutral-200 transition-colors duration-150 hover:bg-white/10 hover:text-white ${
          size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${current.dotColor}`} />
        <span>{current.label}</span>
        <ChevronDown
          className={`h-3 w-3 text-slate-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && mounted &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            onClick={(e) => e.stopPropagation()}
            style={
              pos
                ? { top: pos.top, left: pos.left }
                : { top: -9999, left: -9999, visibility: 'hidden' }
            }
            className="fixed z-[100] min-w-[150px] max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-ink-card p-1.5 shadow-menu animate-menu-fade focus:outline-none"
          >
            {ALL_STATUSES.map((st) => {
              const isSelected = st === status;
              const cfg = STATUS_CONFIGS[st];

              return (
                <button
                  key={st}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(st);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors duration-150 ${
                    isSelected
                      ? 'bg-white/[0.07] text-white font-semibold'
                      : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${cfg.dotColor}`} />
                    <span>{cfg.label}</span>
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-violet-300" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};
