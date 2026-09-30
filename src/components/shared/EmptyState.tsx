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
      <div className="card-base my-6 flex flex-col items-center justify-center border-dashed p-6 sm:p-12 text-center">
        <div className="rounded-md bg-canvas p-3.5 text-muted mb-4 border border-line">
          <FilterX className="h-8 w-8 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-[#323243]">No matching placement opportunities</h3>
        <p className="mt-1.5 max-w-sm text-sm font-normal text-muted">
          Try clearing your search query or changing your filters to see all available drives.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="btn-secondary mt-5"
          >
            Clear all filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="card-base my-6 flex flex-col items-center justify-center border-dashed p-6 sm:p-12 text-center">
      <div className="rounded-md border border-primary/20 bg-primary-soft p-3.5 text-primary mb-4">
        <Mail className="h-8 w-8 mx-auto" />
      </div>
      <h3 className="text-lg font-semibold text-[#323243]">No placement drives found</h3>
      <p className="mt-1.5 max-w-md text-sm font-normal text-muted">
        PlacementWire scans your college Gmail for hiring drives and placement opportunities. Click below to start your first scan.
      </p>
      {onSyncMails && (
        <button
          onClick={onSyncMails}
          disabled={isSyncingMails}
          className="btn-primary mt-5"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncingMails ? 'animate-spin' : ''}`} />
          <span>{isSyncingMails ? 'Scanning Mailbox...' : 'Sync Placement Mails Now'}</span>
        </button>
      )}
    </div>
  );
};
