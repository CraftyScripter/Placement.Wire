'use client';

import React from 'react';
import { Mail, RefreshCw, FilterX } from 'lucide-react';

interface EmptyStateProps {
  type: 'no_drives' | 'no_filter_results';
  onResetFilters?: () => void;
  onSyncMails?: () => void;
  isSyncingMails?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onResetFilters,
  onSyncMails,
  isSyncingMails,
}) => {
  if (type === 'no_filter_results') {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.03] p-12 text-center my-6">
        <div className="rounded-lg bg-white/[0.03] p-3.5 text-slate-400 mb-4 border border-white/10">
          <FilterX className="h-8 w-8 mx-auto" />
        </div>
        <h3 className="text-base font-bold text-white">No matching placement opportunities</h3>
        <p className="mt-1.5 max-w-sm text-xs text-slate-400">
          Try clearing your search query or changing your filters to see all available drives.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.05] transition-colors duration-150"
          >
            Clear all filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.03] p-12 text-center my-6">
      <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-3.5 text-indigo-400 mb-4">
        <Mail className="h-8 w-8 mx-auto" />
      </div>
      <h3 className="text-base font-bold text-white">No placement drives found</h3>
      <p className="mt-1.5 max-w-md text-xs text-slate-400">
        PlacementWire scans your college Gmail for hiring drives and placement opportunities. Click below to start your first scan.
      </p>
      {onSyncMails && (
        <button
          onClick={onSyncMails}
          disabled={isSyncingMails}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 active:scale-95 disabled:opacity-50 transition-colors duration-150"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncingMails ? 'animate-spin' : ''}`} />
          <span>{isSyncingMails ? 'Scanning Mailbox...' : 'Sync Placement Mails Now'}</span>
        </button>
      )}
    </div>
  );
};