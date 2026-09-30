'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  className?: string;
  showDropdown?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showDropdown = false }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-white shadow-card dark:border-white/10 dark:bg-[#141824] ${className}`}
        aria-hidden="true"
      >
        <span className="h-4 w-4 rounded-full bg-line dark:bg-[#1F2430]" />
      </div>
    );
  }

  if (showDropdown) {
    return (
      <div className={`relative inline-block text-left ${className}`}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-xs font-medium text-[#323243] shadow-card transition-colors duration-150 hover:border-primary hover:text-primary dark:border-white/10 dark:bg-[#141824] dark:text-[#E2E4ED]"
          aria-label="Select theme"
          aria-expanded={dropdownOpen}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-4 w-4 text-primary" />
          ) : (
            <Sun className="h-4 w-4 text-accent" />
          )}
          <span className="capitalize">{theme}</span>
        </button>

        {dropdownOpen && (
          <div
            className="absolute right-0 mt-2 z-50 min-w-[130px] rounded-lg border border-line bg-white p-1.5 shadow-pop animate-menu-fade dark:border-white/10 dark:bg-[#141824]"
            onClick={() => setDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                theme === 'light'
                  ? 'bg-primary-soft font-semibold text-primary'
                  : 'text-[#323243] hover:bg-canvas dark:text-[#E2E4ED] dark:hover:bg-white/5'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                theme === 'dark'
                  ? 'bg-primary-soft font-semibold text-primary'
                  : 'text-[#323243] hover:bg-canvas dark:text-[#E2E4ED] dark:hover:bg-white/5'
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              <span>Dark</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                theme === 'system'
                  ? 'bg-primary-soft font-semibold text-primary'
                  : 'text-[#323243] hover:bg-canvas dark:text-[#E2E4ED] dark:hover:bg-white/5'
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
              <span>System</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-white shadow-card transition-all duration-200 hover:border-primary hover:text-primary active:scale-90 dark:border-white/10 dark:bg-[#141824] dark:hover:border-primary ${className}`}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-4 w-4 text-accent transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-primary transition-transform duration-200 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
};
