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

const TILE_COLORS = [
  'bg-primary-soft text-primary',
  'bg-accent-soft text-[#9A6B0F]',
  'bg-success-soft text-[#15803D]',
  'bg-[#F3E8FF] text-[#7C3AED]',
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
  green: 'bg-success-soft text-[#15803D]',
  amber: 'bg-accent-soft text-[#9A6B0F]',
  rose: 'bg-error-soft text-error',
  muted: 'bg-canvas text-muted',
};

const ACTION_BTN =
  'inline-flex h-8 min-w-[76px] items-center justify-center whitespace-nowrap rounded-md border px-3 text-xs font-medium leading-none transition-colors duration-150';

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
      className="card-base flex min-h-[76px] cursor-pointer flex-col gap-3 px-3.5 py-3 transition-colors duration-150 hover:border-primary sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4"
    >
      <div className="flex min-w-0 flex-1 items-start sm:items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-semibold ${tileColor(
            drive.company
          )}`}
        >
          {drive.company.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1 leading-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="min-w-0 max-w-full truncate text-sm font-semibold text-[#323243] dark:text-[#E2E4ED]" title={drive.company}>
              {drive.company}
            </h3>
            {isNew && (
              <span className="shrink-0 rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold leading-4 text-[#15803D]">
                NEW
              </span>
            )}
            <span className="chip-base shrink-0 !py-0.5 text-[10px]">
              {getCategoryLabel(drive.drive_type)}
            </span>
            {firstPos?.eligible_batches && firstPos.eligible_batches.length > 0 && (
              <span className="hidden shrink-0 rounded-full bg-canvas px-2 py-0.5 text-[10px] font-normal leading-4 text-muted dark:border dark:border-[#1F2430] dark:bg-[#0B0E14] dark:text-[#94A3B8] sm:inline">
                {firstPos.eligible_batches.join(', ')}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs leading-5 text-muted dark:text-[#94A3B8]">
            <span className="min-w-0 max-w-full truncate font-normal text-[#323243] dark:text-[#CBD5E1]">
              {firstPos?.role || 'Campus Drive'}
              {extra > 0 && <span className="font-normal text-muted dark:text-[#94A3B8]"> (+{extra} more)</span>}
            </span>
            {firstPos?.ctc && (
              <span className="hidden shrink-0 font-semibold text-[#15803D] dark:text-[#21C56E] md:inline">{firstPos.ctc}</span>
            )}
            {firstPos?.location && (
              <span className="hidden shrink-0 items-center gap-1 xl:inline-flex">
                <MapPin className="h-3 w-3 text-muted dark:text-[#94A3B8]" />
                <span className="max-w-[140px] truncate">{firstPos.location}</span>
              </span>
            )}
            {receivedFormatted && (
              <span className="hidden shrink-0 items-center gap-1 text-[11px] xl:inline-flex">
                <Calendar className="h-3 w-3 text-muted dark:text-[#94A3B8]" />
                {receivedFormatted}
              </span>
            )}
            {firstPos?.ctc && (
              <span className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-[#323243] dark:text-[#21C56E] md:hidden">
                <IndianRupee className="h-3 w-3 text-muted dark:text-[#94A3B8]" />
                {firstPos.ctc}
              </span>
            )}
            <span
              className={`inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold sm:hidden ${DEADLINE_BADGE[deadlineInfo.statusColor]} rounded-full px-2 py-0.5 leading-4`}
              title={deadlineInfo.formattedDate}
            >
              <Clock className="h-3 w-3" />
              {deadlineInfo.countdownText}
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-1.5 sm:gap-2 border-t border-line dark:border-[#1F2430] pt-2.5 sm:shrink-0 sm:flex-nowrap sm:border-0 sm:pt-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className={`hidden whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold leading-4 sm:inline-flex sm:items-center sm:gap-1 ${DEADLINE_BADGE[deadlineInfo.statusColor]}`}
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
            className={`${ACTION_BTN} flex-1 border-transparent bg-primary text-white shadow-sm hover:bg-primary-hover active:scale-95 sm:flex-none`}
            title="Open application link in new tab"
          >
            Apply
          </button>
        ) : showExpired ? (
          <span
            className={`${ACTION_BTN} flex-1 cursor-default border-line bg-canvas text-muted dark:border-[#1F2430] dark:bg-[#0B0E14] dark:text-[#94A3B8] sm:flex-none`}
            title="Application window closed"
          >
            Expired
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onSelectDrive(drive)}
            className={`${ACTION_BTN} flex-1 border-line bg-white text-[#323243] shadow-sm hover:border-primary hover:text-primary dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#E2E4ED] sm:flex-none`}
            title="View full details"
          >
            Details
            <ChevronRight className="h-3.5 w-3.5 -mr-1 text-muted dark:text-[#94A3B8]" />
          </button>
        )}

        <span className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {emailUrl && (
          <a
            href={emailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white text-muted shadow-sm transition-colors duration-150 hover:border-primary hover:text-primary dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#94A3B8] dark:hover:border-primary dark:hover:text-primary"
            title="Open original email in Gmail"
          >
            <Mail className="h-3.5 w-3.5" />
          </a>
        )}

        <button
          type="button"
          onClick={() => onToggleStar(drive.id)}
          className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors duration-150 shadow-sm ${
            drive.starred
              ? 'border-accent bg-accent-soft text-accent dark:border-accent/40 dark:bg-accent/20'
              : 'border-line bg-white text-muted hover:border-accent hover:text-accent dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#94A3B8]'
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
