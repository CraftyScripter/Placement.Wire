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
        className="inline-flex items-center justify-between gap-2 rounded-full border border-white/10 bg-ink-input px-3.5 py-2 text-xs font-medium text-neutral-200 transition-colors duration-150 hover:bg-white/10 hover:text-white focus:border-brandviolet focus:outline-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-1.5 truncate">
          {PrefixIcon && <PrefixIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
          {label && <span className="text-slate-400 font-normal">{label}</span>}
          <span className="font-semibold text-white truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
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
            className={`fixed z-[100] min-w-[160px] rounded-xl border border-white/10 bg-ink-card p-1.5 shadow-menu animate-menu-fade focus:outline-none ${menuClassName}`}
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
                  className={`flex items-center justify-between w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors duration-150 ${
                    isSelected
                      ? 'bg-brandviolet/20 text-violet-200 font-semibold'
                      : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {Icon && (
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isSelected ? 'text-violet-300' : 'text-slate-400'
                        }`}
                      />
                    )}
                    <span className="truncate">{option.label}</span>
                  </span>
                  <span className="flex items-center gap-1.5 pl-2 shrink-0">
                    {option.badge && (
                      <span className="rounded bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                        {option.badge}
                      </span>
                    )}
                    {isSelected && <Check className="h-3.5 w-3.5 text-violet-300" />}
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
