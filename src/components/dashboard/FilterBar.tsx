'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { ThemeDropdown, DropdownOption } from '@/components/ui/ThemeDropdown';

export type ViewMode = 'cards' | 'list';
export type SortOption = 'newest_received' | 'deadline_urgent' | 'ctc_high' | 'company_asc';

export type PillKey = 'all' | 'active' | 'expiring' | 'internship' | 'fulltime';

export interface FilterCriteria {
  query: string;
  category: string;
  status: string;
  batch: string;
  sortBy: SortOption;
}

interface FilterBarProps {
  filters: FilterCriteria;
  onFilterChange: (filters: FilterCriteria) => void;
  activePill: PillKey | null;
  onPillChange: (pill: PillKey) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  heading: string;
  resultCount: number;
}

const PILLS: { key: PillKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'expiring', label: 'Expiring Soon' },
  { key: 'internship', label: 'Internship' },
  { key: 'fulltime', label: 'Full-time' },
];

const BATCH_OPTIONS: DropdownOption[] = [
  { label: 'All Batches', value: 'ALL' },
  { label: '2026 Batch', value: '2026' },
  { label: '2027 Batch', value: '2027' },
];

const SORT_OPTIONS: DropdownOption[] = [
  { label: 'Newest First', value: 'newest_received' },
  { label: 'Deadline (Urgent)', value: 'deadline_urgent' },
  { label: 'Highest CTC', value: 'ctc_high' },
  { label: 'Company (A-Z)', value: 'company_asc' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  activePill,
  onPillChange,
  viewMode,
  onViewModeChange,
  heading,
  resultCount,
}) => {
  const [searchInput, setSearchInput] = useState(filters.query);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.query) {
        onFilterChange({ ...filters, query: searchInput });
      }
    }, 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    if (filters.query === '' && searchInput !== '') setSearchInput('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
          {PILLS.map((pill) => {
            const isActive = activePill === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => onPillChange(pill.key)}
                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-muted border border-line hover:text-[#323243] hover:border-primary/50 dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#94A3B8] dark:hover:text-[#E2E4ED] dark:hover:border-primary/50'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 basis-full min-[480px]:basis-auto min-[480px]:w-56 xl:w-72 xl:flex-none">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search roles, companies, skills..."
              className="input-base w-full rounded-md pl-10 pr-9 text-sm font-normal shadow-card"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted hover:text-[#323243] dark:hover:text-[#E2E4ED]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 min-[480px]:flex-none">
            <ThemeDropdown
              value={filters.batch}
              options={BATCH_OPTIONS}
              onChange={(val) => onFilterChange({ ...filters, batch: val })}
              className="min-w-0 flex-1 min-[480px]:w-36 min-[480px]:flex-none"
            />
            <ThemeDropdown
              value={filters.sortBy}
              options={SORT_OPTIONS}
              onChange={(val) => onFilterChange({ ...filters, sortBy: val as SortOption })}
              prefixIcon={ArrowUpDown}
              className="min-w-0 flex-1 min-[480px]:w-44 min-[480px]:flex-none"
            />

          <div className="flex h-10 shrink-0 items-center rounded-md border border-line bg-white p-1 shadow-card dark:border-[#1F2430] dark:bg-[#141824]">
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              title="List view"
              aria-label="List view"
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-150 ${
                viewMode === 'list'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-[#323243] dark:text-[#94A3B8] dark:hover:text-[#E2E4ED]'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('cards')}
              title="Cards view"
              aria-label="Cards view"
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-150 ${
                viewMode === 'cards'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-[#323243] dark:text-[#94A3B8] dark:hover:text-[#E2E4ED]'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="min-w-0 truncate text-2xl font-semibold text-[#323243] dark:text-[#E2E4ED]">{heading}</h2>
        <span className="shrink-0 text-sm font-normal text-muted dark:text-[#94A3B8]">
          {resultCount} {resultCount === 1 ? 'opportunity' : 'opportunities'} found
        </span>
      </div>
    </div>
  );
};
