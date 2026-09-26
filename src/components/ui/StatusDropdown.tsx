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
  NEW: { label: 'New', dotColor: 'bg-primary' },
  APPLIED: { label: 'Applied', dotColor: 'bg-[#2FA8DE]' },
  SHORTLISTED: { label: 'Shortlisted', dotColor: 'bg-accent' },
  INTERVIEW_SCHEDULED: { label: 'Interview', dotColor: 'bg-[#9B7BF5]' },
  SELECTED: { label: 'Selected', dotColor: 'bg-success' },
  REJECTED: { label: 'Rejected', dotColor: 'bg-error' },
  ARCHIVED: { label: 'Archived', dotColor: 'bg-muted' },
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
        className={`inline-flex items-center gap-1.5 rounded-md border border-line bg-white font-normal text-[#323243] shadow-sm transition-colors duration-150 hover:border-primary hover:text-primary dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#E2E4ED] ${
          size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-10 px-3 text-sm'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${current.dotColor}`} />
        <span>{current.label}</span>
        <ChevronDown
          className={`h-3 w-3 text-muted transition-transform duration-150 dark:text-[#94A3B8] ${
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
            className="fixed z-[100] min-w-[150px] max-w-[calc(100vw-2rem)] rounded-lg border border-line bg-white p-1.5 shadow-pop animate-menu-fade focus:outline-none dark:border-[#1F2430] dark:bg-[#141824]"
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
                  className={`flex items-center justify-between w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-150 ${
                    isSelected
                      ? 'bg-primary-soft text-primary font-normal dark:bg-primary/20'
                      : 'text-[#323243] hover:bg-canvas dark:text-[#CBD5E1] dark:hover:bg-[#0B0E14]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${cfg.dotColor}`} />
                    <span>{cfg.label}</span>
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};
