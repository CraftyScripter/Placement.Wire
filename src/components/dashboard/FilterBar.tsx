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

  // Keep local input in sync when query is cleared elsewhere
  useEffect(() => {
    if (filters.query === '' && searchInput !== '') setSearchInput('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.query]);

  return (
    <div className="space-y-4">
      {/* Pills + search + controls */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {PILLS.map((pill) => {
            const isActive = activePill === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => onPillChange(pill.key)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-150 ${
                  isActive
                    ? 'bg-brandviolet text-white'
                    : 'bg-ink-input text-neutral-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 xl:w-72 xl:flex-none">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search roles, companies, skills..."
              className="w-full rounded-full border border-transparent bg-ink-input py-2.5 pl-10 pr-9 text-xs text-neutral-100 placeholder-neutral-500 transition-colors duration-150 focus:border-brandviolet focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-neutral-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <ThemeDropdown
            value={filters.batch}
            options={BATCH_OPTIONS}
            onChange={(val) => onFilterChange({ ...filters, batch: val })}
          />
          <ThemeDropdown
            value={filters.sortBy}
            options={SORT_OPTIONS}
            onChange={(val) => onFilterChange({ ...filters, sortBy: val as SortOption })}
            prefixIcon={ArrowUpDown}
          />

          <div className="flex items-center rounded-full border border-white/10 bg-ink-input p-1">
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              title="List view"
              className={`rounded-full p-2 transition-colors duration-150 ${
                viewMode === 'list' ? 'bg-brandviolet text-white' : 'text-neutral-500 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('cards')}
              title="Cards view"
              className={`rounded-full p-2 transition-colors duration-150 ${
                viewMode === 'cards' ? 'bg-brandviolet text-white' : 'text-neutral-500 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Heading + count */}
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-white">{heading}</h2>
        <span className="text-xs text-neutral-500">
          {resultCount} {resultCount === 1 ? 'opportunity' : 'opportunities'} found
        </span>
      </div>
    </div>
  );
};
