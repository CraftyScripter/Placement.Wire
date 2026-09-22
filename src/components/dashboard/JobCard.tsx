'use client';

import React from 'react';
import { MapPin, IndianRupee, Star, Clock, Calendar, Mail, ChevronRight } from 'lucide-react';
import { PlacementDrive, ApplicationStatus, DriveType } from '@/schemas/placement.schema';
import { formatDeadline } from '@/lib/utils/deadline';
import { getOriginalEmailUrl } from '@/lib/utils/gmail';
import { StatusDropdown } from '@/components/ui/StatusDropdown';

interface JobCardProps {
  drive: PlacementDrive;
  isNew?: boolean;
  onSelectDrive: (drive: PlacementDrive) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onToggleStar: (id: string) => void;
  onApply: (id: string) => void;
}

// Deterministic muted color per company (initials tile)
const TILE_COLORS = [
  'bg-violet-500/20 text-violet-300',
  'bg-sky-500/20 text-sky-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-amber-500/20 text-amber-300',
  'bg-rose-500/20 text-rose-300',
  'bg-cyan-500/20 text-cyan-300',
  'bg-orange-500/20 text-orange-300',
  'bg-indigo-500/20 text-indigo-300',
];

function tileColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return TILE_COLORS[h % TILE_COLORS.length];
}

function getCategoryLabel(type: DriveType) {
  switch (type) {
    case 'HACKATHON':
      return 'Hackathon';
    case 'INTERNSHIP_WITH_PPO':
      return 'Internship + PPO';
    case 'INTERNSHIP':
      return 'Internship';
    case 'TRAINING':
      return 'Training';
    case 'FINAL_PLACEMENT':
    default:
      return 'Placement';
  }
}

function formatReceivedDate(dateStr: string | null) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return null;
  }
}

const DEADLINE_BADGE: Record<string, string> = {
  green: 'bg-emerald-500/15 text-emerald-300',
  amber: 'bg-orange-500/15 text-orange-300',
  rose: 'bg-rose-500/15 text-rose-300',
  muted: 'bg-white/5 text-neutral-500',
};

// Shared sizing for the primary action slot so every row renders the exact
// same box (Apply has a transparent border, Expired/Details visible ones).
// A fixed min-width keeps the trailing mail/star icons perfectly aligned
// across rows, no matter which action is shown.
const ACTION_BTN =
  'inline-flex min-w-[78px] items-center justify-center whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-semibold leading-4 transition-colors duration-150';

export const JobCard: React.FC<JobCardProps> = React.memo(({
  drive,
  isNew,
  onSelectDrive,
  onUpdateStatus,
  onToggleStar,
  onApply,
}) => {
  const deadlineInfo = formatDeadline(drive.deadline, drive.deadline_precision);
  const emailUrl = getOriginalEmailUrl(drive);
  const firstPos = drive.positions[0];
  const extra = drive.positions.length > 1 ? drive.positions.length - 1 : 0;
  const receivedFormatted = formatReceivedDate(drive.received_at);
  const canApply = Boolean(drive.apply_url) && drive.status === 'NEW' && !deadlineInfo.isExpired;
  const showExpired = Boolean(drive.apply_url) && drive.status === 'NEW' && deadlineInfo.isExpired;

  return (
    <div
      onClick={() => onSelectDrive(drive)}
      className="flex min-h-[76px] cursor-pointer flex-col gap-3 rounded-xl border border-transparent bg-ink-row px-3.5 py-3 transition-colors duration-150 hover:border-brandviolet/50 min-[560px]:flex-row min-[560px]:items-center min-[560px]:justify-between min-[560px]:gap-4 sm:px-4"
    >
      {/* Left: logo + company + tags + role + meta */}
      <div className="flex min-w-0 flex-1 items-start min-[560px]:items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold ${tileColor(
            drive.company
          )}`}
        >
          {drive.company.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1 leading-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="min-w-0 max-w-full truncate text-sm font-bold text-white" title={drive.company}>
              {drive.company}
            </h3>
            {isNew && (
              <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold leading-4 text-emerald-300">
                NEW
              </span>
            )}
            <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold leading-4 text-neutral-300">
              {getCategoryLabel(drive.drive_type)}
            </span>
            {firstPos?.eligible_batches && firstPos.eligible_batches.length > 0 && (
              <span className="hidden shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium leading-4 text-neutral-400 sm:inline">
                {firstPos.eligible_batches.join(', ')}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs leading-5 text-neutral-400">
            <span className="min-w-0 max-w-full truncate font-medium text-neutral-200">
              {firstPos?.role || 'Campus Drive'}
              {extra > 0 && <span className="font-normal text-neutral-500"> (+{extra} more)</span>}
            </span>
            {firstPos?.ctc && (
              <span className="hidden shrink-0 font-bold text-emerald-400 md:inline">{firstPos.ctc}</span>
            )}
            {firstPos?.location && (
              <span className="hidden shrink-0 items-center gap-1 lg:inline-flex">
                <MapPin className="h-3 w-3 text-neutral-500" />
                <span className="max-w-[140px] truncate">{firstPos.location}</span>
              </span>
            )}
            {receivedFormatted && (
              <span className="hidden shrink-0 items-center gap-1 text-[11px] lg:inline-flex">
                <Calendar className="h-3 w-3 text-neutral-500" />
                {receivedFormatted}
              </span>
            )}
            {firstPos?.ctc && (
              <span className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-neutral-300 md:hidden">
                <IndianRupee className="h-3 w-3 text-neutral-500" />
                {firstPos.ctc}
              </span>
            )}
            {/* Mobile-only deadline line (the badge in the actions row is sm+ only) */}
            <span
              className={`inline-flex shrink-0 items-center gap-1 text-[11px] font-bold min-[560px]:hidden ${DEADLINE_BADGE[deadlineInfo.statusColor]} rounded-full px-2 py-0.5 leading-4`}
              title={deadlineInfo.formattedDate}
            >
              <Clock className="h-3 w-3" />
              {deadlineInfo.countdownText}
            </span>
          </div>
        </div>
      </div>

      {/* Right: deadline -> status -> apply -> star (fixed order, centered) */}
      <div
        className="flex items-center gap-1.5 min-[560px]:gap-2 border-t border-white/5 pt-2.5 min-[560px]:shrink-0 min-[560px]:flex-nowrap min-[560px]:border-0 min-[560px]:pt-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className={`hidden whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold leading-4 min-[560px]:inline-flex min-[560px]:items-center min-[560px]:gap-1 ${DEADLINE_BADGE[deadlineInfo.statusColor]}`}
          title={deadlineInfo.formattedDate}
        >
          <Clock className="h-3 w-3" />
          {deadlineInfo.countdownText}
        </span>

        <StatusDropdown
          status={drive.status}
          onChange={(s) => onUpdateStatus(drive.id, s)}
          size="sm"
          align="right"
        />

        {canApply ? (
          <button
            type="button"
            onClick={() => onApply(drive.id)}
            className={`${ACTION_BTN} flex-1 border-transparent bg-brandviolet text-white hover:bg-brandviolet-hover active:scale-95 min-[560px]:flex-none`}
            title="Open application link in new tab"
          >
            Apply
          </button>
        ) : showExpired ? (
          <span
            className={`${ACTION_BTN} flex-1 cursor-default border-white/10 bg-white/5 text-neutral-500 min-[560px]:flex-none`}
            title="Application window closed"
          >
            Expired
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onSelectDrive(drive)}
            className={`${ACTION_BTN} flex-1 border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white min-[560px]:flex-none`}
            title="View full details"
          >
            Details
            <ChevronRight className="h-3.5 w-3.5 -mr-1 text-neutral-500" />
          </button>
        )}

        <span className="flex shrink-0 items-center gap-1.5 min-[560px]:gap-2">
        {emailUrl && (
          <a
            href={emailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/10 p-2 text-neutral-500 transition-colors duration-150 hover:bg-white/5 hover:text-indigo-300"
            title="Open original email in Gmail"
          >
            <Mail className="h-3.5 w-3.5" />
          </a>
        )}

        <button
          type="button"
          onClick={() => onToggleStar(drive.id)}
          className={`rounded-lg border p-2 transition-colors duration-150 ${
            drive.starred
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
              : 'border-white/10 text-neutral-500 hover:bg-white/5 hover:text-amber-400'
          }`}
          title={drive.starred ? 'Starred' : 'Star opportunity'}
        >
          <Star className={`h-3.5 w-3.5 ${drive.starred ? 'fill-current' : ''}`} />
        </button>
        </span>
      </div>
    </div>
  );
});
