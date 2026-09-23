'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { useDropdownAnchor } from '@/hooks/use-dropdown-anchor';

export interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface ThemeDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  label?: string;
  prefixIcon?: React.ComponentType<{ className?: string }>;
  className?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
  placeholder?: string;
}

export const ThemeDropdown: React.FC<ThemeDropdownProps> = ({
  value,
  options,
  onChange,
  label,
  prefixIcon: PrefixIcon,
  className = '',
  menuClassName = '',
  align = 'right',
  placeholder = 'Select...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { triggerRef, menuRef, pos } = useDropdownAnchor(isOpen, align);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

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
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-10 w-full max-w-full items-center justify-between gap-2 rounded-md border border-line bg-white px-3.5 py-2 text-sm font-normal text-[#323243] shadow-card transition-colors duration-150 hover:border-primary focus:border-primary focus:outline-none dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#E2E4ED]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex min-w-0 items-center gap-1.5 truncate">
          {PrefixIcon && <PrefixIcon className="h-3.5 w-3.5 text-muted shrink-0 dark:text-[#94A3B8]" />}
          {label && <span className="text-muted font-normal dark:text-[#94A3B8]">{label}</span>}
          <span className="font-medium text-[#323243] truncate dark:text-[#E2E4ED]">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted shrink-0 transition-transform duration-150 dark:text-[#94A3B8] ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && mounted &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={
              pos
                ? { top: pos.top, left: pos.left }
                : { top: -9999, left: -9999, visibility: 'hidden' }
            }
            className={`fixed z-[100] min-w-[160px] max-w-[calc(100vw-2rem)] rounded-lg border border-line bg-white p-1.5 shadow-pop animate-menu-fade focus:outline-none dark:border-[#1F2430] dark:bg-[#141824] ${menuClassName}`}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              const Icon = option.icon;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-150 ${
                    isSelected
                      ? 'bg-primary-soft text-primary font-medium dark:bg-primary/20'
                      : 'text-[#323243] hover:bg-canvas font-normal dark:text-[#CBD5E1] dark:hover:bg-[#0B0E14]'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {Icon && (
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isSelected ? 'text-primary' : 'text-muted dark:text-[#94A3B8]'
                        }`}
                      />
                    )}
                    <span className="truncate">{option.label}</span>
                  </span>
                  <span className="flex items-center gap-1.5 pl-2 shrink-0">
                    {option.badge && (
                      <span className="rounded bg-canvas px-1.5 py-0.5 text-[10px] font-mono text-muted dark:bg-[#0B0E14] dark:text-[#94A3B8]">
                        {option.badge}
                      </span>
                    )}
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                  </span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};
