'use client';

import React from 'react';
import { X, Trash2, BellRing, CheckCheck } from 'lucide-react';
import { PlacementDrive } from '@/schemas/placement.schema';
import { formatDeadline } from '@/lib/utils/deadline';

interface NotificationPanelProps {
  recentArrivals: PlacementDrive[];
  expiring: PlacementDrive[];
  seenIds: string[];
  readIds: string[];
  onSelectArrival: (drive: PlacementDrive) => void;
  onSelectExpiring: (drive: PlacementDrive) => void;
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  recentArrivals,
  expiring,
  seenIds,
  readIds,
  onSelectArrival,
  onSelectExpiring,
  onDismiss,
  onMarkAllRead,
  onClearAll,
  onClose,
}) => {
  const hasAny = recentArrivals.length > 0 || expiring.length > 0;
  const unreadCount =
    recentArrivals.filter((d) => !seenIds.includes(d.id)).length +
    expiring.filter((d) => !readIds.includes(d.id)).length;

  return (
    <>
      <div
        className="fixed inset-0 z-40 animate-overlay-fade bg-[#323243]/40 sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-label="Notifications"
        className="fixed inset-x-3 bottom-3 z-50 animate-sheet-up overflow-hidden rounded-lg border border-line bg-white shadow-pop sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:mt-2 sm:w-80 sm:origin-top-right sm:animate-pop-in dark:border-[#1F2430] dark:bg-[#141824]"
      >
        <div className="pt-2 sm:hidden" aria-hidden="true">
          <div className="mx-auto h-1 w-10 rounded-full bg-line dark:bg-[#1F2430]" />
        </div>

        <div className="flex items-center justify-between gap-2 px-3.5 pb-1.5 pt-2.5 sm:pt-3">
          <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-[#323243] dark:text-[#E2E4ED]">
            <BellRing className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">Notifications</span>
            {unreadCount > 0 && (
              <span
                key={unreadCount}
                className="shrink-0 animate-badge-pop rounded-full bg-error px-1.5 py-0.5 text-[10px] font-semibold leading-3 text-white"
              >
                {unreadCount}
              </span>
            )}
          </p>
          {hasAny && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-normal text-primary transition-colors duration-150 hover:bg-canvas dark:hover:bg-[#0B0E14]"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[52dvh] overflow-y-auto p-1.5 pt-0.5 sm:max-h-[380px]">
          {recentArrivals.length > 0 && (
            <>
              <p className="overline-tag px-2.5 py-1.5 text-muted dark:text-[#94A3B8]">
                New arrivals
              </p>
              {recentArrivals.slice(0, 5).map((d, i) => {
                const isSeen = seenIds.includes(d.id);
                return (
                  <div
                    key={d.id}
                    style={{ animationDelay: `${Math.min(i, 5) * 35}ms` }}
                    className={`group flex w-full animate-row-in items-center gap-1 rounded-md transition-colors duration-150 hover:bg-canvas dark:hover:bg-[#0B0E14] ${
                      isSeen ? 'opacity-55' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectArrival(d)}
                      className="flex min-w-0 flex-1 items-center justify-between gap-2 px-2.5 py-2.5 text-left sm:py-2"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {!isSeen && (
                          <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-success" />
                        )}
                        <span className="truncate text-sm font-normal text-[#323243] dark:text-[#E2E4ED]">{d.company}</span>
                      </span>
                      {!isSeen && (
                        <span className="shrink-0 rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-[#15803D] dark:bg-success/20 dark:text-[#21C56E]">
                          NEW
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDismiss(d.id)}
                      title="Dismiss notification"
                      aria-label={`Dismiss ${d.company} notification`}
                      className="mr-1 shrink-0 rounded-md p-1.5 text-muted transition-all duration-150 hover:bg-line hover:text-[#323243] dark:hover:bg-[#1F2430] dark:hover:text-[#E2E4ED] lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
              <div className="my-1 border-t border-line dark:border-[#1F2430]" />
            </>
          )}

          <p className="overline-tag px-2.5 py-1.5 text-muted dark:text-[#94A3B8]">
            Expiring within 48h
          </p>
          {expiring.length === 0 ? (
            <p className="px-2.5 py-3 text-sm font-normal text-muted dark:text-[#94A3B8]">Nothing urgent. All clear.</p>
          ) : (
            expiring.slice(0, 6).map((d, i) => {
              const isRead = readIds.includes(d.id);
              return (
                <div
                  key={d.id}
                  style={{ animationDelay: `${Math.min(i, 5) * 35}ms` }}
                  className={`group flex w-full animate-row-in items-center gap-1 rounded-md transition-colors duration-150 hover:bg-canvas dark:hover:bg-[#0B0E14] ${
                    isRead ? 'opacity-55' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectExpiring(d)}
                    className="flex min-w-0 flex-1 items-center justify-between gap-2 px-2.5 py-2.5 text-left sm:py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {!isRead && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      )}
                      <span className="truncate text-sm font-normal text-[#323243] dark:text-[#E2E4ED]">{d.company}</span>
                    </span>
                    <span className="shrink-0 text-[11px] font-semibold text-[#9A6B0F] dark:text-[#FCD34D]">
                      {formatDeadline(d.deadline, d.deadline_precision).countdownText}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDismiss(d.id)}
                    title="Dismiss notification"
                    aria-label={`Dismiss ${d.company} notification`}
                    className="mr-1 shrink-0 rounded-md p-1.5 text-muted transition-all duration-150 hover:bg-line hover:text-[#323243] dark:hover:bg-[#1F2430] dark:hover:text-[#E2E4ED] lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}

          {hasAny && (
            <div className="mt-1 border-t border-line dark:border-[#1F2430] pt-1">
              <button
                type="button"
                onClick={onClearAll}
                className="flex w-full items-center justify-center gap-1.5 rounded-md px-2.5 py-2.5 text-[11px] font-normal text-muted transition-colors duration-150 hover:bg-error-soft hover:text-error dark:text-[#94A3B8] dark:hover:bg-error/20 dark:hover:text-[#F87171] sm:py-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
