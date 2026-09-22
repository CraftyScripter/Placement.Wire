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
      {/* Mobile backdrop — tap anywhere to dismiss */}
      <div
        className="fixed inset-0 z-40 animate-overlay-fade bg-black/50 sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-label="Notifications"
        className="fixed inset-x-3 bottom-3 z-50 animate-sheet-up overflow-hidden rounded-2xl border border-white/10 bg-ink-card shadow-menu sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:mt-2 sm:w-80 sm:origin-top-right sm:animate-pop-in"
      >
        {/* Mobile grab handle */}
        <div className="pt-2 sm:hidden" aria-hidden="true">
          <div className="mx-auto h-1 w-10 rounded-full bg-white/15" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-3.5 pb-1.5 pt-2.5 sm:pt-3">
          <p className="flex min-w-0 items-center gap-2 text-sm font-bold text-white">
            <BellRing className="h-4 w-4 shrink-0 text-violet-300" />
            <span className="truncate">Notifications</span>
            {unreadCount > 0 && (
              <span
                key={unreadCount}
                className="shrink-0 animate-badge-pop rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold leading-3 text-white"
              >
                {unreadCount}
              </span>
            )}
          </p>
          {hasAny && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-violet-300 transition-colors duration-150 hover:bg-white/5 hover:text-white"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Scrollable list */}
        <div className="max-h-[52dvh] overflow-y-auto p-1.5 pt-0.5 sm:max-h-[380px]">
          {recentArrivals.length > 0 && (
            <>
              <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                New arrivals
              </p>
              {recentArrivals.slice(0, 5).map((d, i) => {
                const isSeen = seenIds.includes(d.id);
                return (
                  <div
                    key={d.id}
                    style={{ animationDelay: `${Math.min(i, 5) * 35}ms` }}
                    className={`group flex w-full animate-row-in items-center gap-1 rounded-xl transition-colors duration-150 hover:bg-white/5 ${
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
                          <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-400" />
                        )}
                        <span className="truncate text-xs font-semibold text-white">{d.company}</span>
                      </span>
                      {!isSeen && (
                        <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          NEW
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDismiss(d.id)}
                      title="Dismiss notification"
                      aria-label={`Dismiss ${d.company} notification`}
                      className="mr-1 shrink-0 rounded-md p-1.5 text-neutral-500 transition-all duration-150 hover:bg-white/10 hover:text-white lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
              <div className="my-1 border-t border-white/10" />
            </>
          )}

          <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Expiring within 48h
          </p>
          {expiring.length === 0 ? (
            <p className="px-2.5 py-3 text-xs text-neutral-500">Nothing urgent. All clear.</p>
          ) : (
            expiring.slice(0, 6).map((d, i) => {
              const isRead = readIds.includes(d.id);
              return (
                <div
                  key={d.id}
                  style={{ animationDelay: `${Math.min(i, 5) * 35}ms` }}
                  className={`group flex w-full animate-row-in items-center gap-1 rounded-xl transition-colors duration-150 hover:bg-white/5 ${
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
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brandviolet-hover" />
                      )}
                      <span className="truncate text-xs font-semibold text-white">{d.company}</span>
                    </span>
                    <span className="shrink-0 text-[11px] font-bold text-orange-300">
                      {formatDeadline(d.deadline, d.deadline_precision).countdownText}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDismiss(d.id)}
                    title="Dismiss notification"
                    aria-label={`Dismiss ${d.company} notification`}
                    className="mr-1 shrink-0 rounded-md p-1.5 text-neutral-500 transition-all duration-150 hover:bg-white/10 hover:text-white lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}

          {hasAny && (
            <div className="mt-1 border-t border-white/10 pt-1">
              <button
                type="button"
                onClick={onClearAll}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2.5 py-2.5 text-[11px] font-semibold text-neutral-500 transition-colors duration-150 hover:bg-white/5 hover:text-rose-300 sm:py-2"
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
