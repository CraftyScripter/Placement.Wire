'use client';

import React from 'react';
import {
  Star,
  Clock,
  Send,
  MapPin,
  Calendar,
  GraduationCap,
  ChevronRight,
  Mail,
} from 'lucide-react';
import { PlacementDrive, ApplicationStatus, DriveType } from '@/schemas/placement.schema';
import { formatDeadline } from '@/lib/utils/deadline';
import { getOriginalEmailUrl } from '@/lib/utils/gmail';
import { StatusDropdown } from '@/components/ui/StatusDropdown';

interface PlacementCardViewProps {
  drives: PlacementDrive[];
  newIds?: Set<string>;
  onSelectDrive: (drive: PlacementDrive) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onToggleStar: (id: string) => void;
  onApply: (id: string) => void;
}

export const PlacementCardView: React.FC<PlacementCardViewProps> = React.memo(({
  drives,
  newIds,
  onSelectDrive,
  onUpdateStatus,
  onToggleStar,
  onApply,
}) => {
  const getCategoryLabel = (type: DriveType) => {
    switch (type) {
      case 'HACKATHON': return 'Hackathon & Contest';
      case 'INTERNSHIP_WITH_PPO': return 'Internship with PPO';
      case 'INTERNSHIP': return 'Internship';
      case 'TRAINING': return 'Training';
      case 'FINAL_PLACEMENT':
      default: return 'Full-Time Placement';
    }
  };

  const formatReceivedDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return null;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
      {drives.map((drive) => {
        const deadlineInfo = formatDeadline(drive.deadline, drive.deadline_precision);
        const categoryLabel = getCategoryLabel(drive.drive_type);
        const firstPos = drive.positions[0];
        const allRoles = drive.positions.map((p) => p.role).join(', ');
        const ctc = firstPos?.ctc;
        const location = firstPos?.location;
        const courses = firstPos?.eligible_courses || [];
        const batches = firstPos?.eligible_batches || [];
        const receivedFormatted = formatReceivedDate(drive.received_at);
        const emailUrl = getOriginalEmailUrl(drive);

        return (
          <div
            key={drive.id}
            onClick={() => onSelectDrive(drive)}
            className="card-base group flex cursor-pointer flex-col justify-between p-4 sm:p-5 transition-colors duration-150 hover:border-primary"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-base font-semibold text-primary">
                    {drive.company.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-[#323243] transition-colors duration-150 group-hover:text-primary">
                      {drive.company}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      {newIds?.has(drive.id) && (
                        <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-[#15803D]">
                          NEW
                        </span>
                      )}
                      <span className="chip-base !py-0.5 text-[10px]">
                        <span>{categoryLabel}</span>
                      </span>

                      {batches.length > 0 && (
                        <span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-normal text-muted dark:bg-[#0B0E14] dark:border dark:border-[#1F2430] dark:text-[#94A3B8]">
                          Batch {batches.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {emailUrl && (
                    <a
                      href={emailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-md border border-line bg-white p-1.5 text-muted transition-colors duration-150 hover:border-primary hover:text-primary dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#94A3B8]"
                      title="Open original email in Gmail"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(drive.id);
                  }}
                  className={`rounded-md border p-1.5 transition-colors duration-150 ${
                    drive.starred
                      ? 'border-accent bg-accent-soft text-accent dark:bg-accent/20 dark:border-accent/40'
                      : 'border-line text-muted hover:border-accent hover:text-accent dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#94A3B8]'
                  }`}
                  title={drive.starred ? 'Starred' : 'Star opportunity'}
                >
                  <Star className={`h-4 w-4 ${drive.starred ? 'fill-current' : ''}`} />
                </button>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <div className="line-clamp-1 text-sm font-normal text-[#323243] dark:text-[#E2E4ED]" title={allRoles}>
                  {drive.positions.length > 1 ? (
                    <span>
                      {firstPos?.role}{' '}
                      <span className="text-[11px] font-normal text-primary dark:text-[#8E86FF]">
                        (+{drive.positions.length - 1} more profiles)
                      </span>
                    </span>
                  ) : (
                    firstPos?.role || 'Campus Opportunity'
                  )}
                </div>

                {ctc ? (
                  <div className="truncate text-sm font-semibold text-[#15803D] dark:text-[#21C56E]">
                    {ctc}
                  </div>
                ) : (
                  <div className="text-xs font-normal text-muted dark:text-[#94A3B8]">
                    Compensation not specified
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-1 border-t border-line pt-2.5 text-[11px] font-normal text-muted dark:border-[#1F2430] dark:text-[#94A3B8]">
                {location && (
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3 w-3 shrink-0 text-muted dark:text-[#94A3B8]" />
                    <span className="truncate">{location}</span>
                  </div>
                )}

                {courses.length > 0 && (
                  <div className="flex items-center gap-1.5 truncate">
                    <GraduationCap className="h-3 w-3 shrink-0 text-muted dark:text-[#94A3B8]" />
                    <span className="truncate">{courses.slice(0, 3).join(', ')}{courses.length > 3 ? '...' : ''}</span>
                  </div>
                )}

                {receivedFormatted && (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <Calendar className="h-3 w-3 shrink-0 text-muted dark:text-[#94A3B8]" />
                    <span>Announced on <strong className="font-normal text-[#323243] dark:text-[#E2E4ED]">{receivedFormatted}</strong></span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2.5 border-t border-line pt-3 dark:border-[#1F2430]">
              <div className="flex items-center justify-between text-[11px]">
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    deadlineInfo.isExpired
                      ? 'text-error'
                      : deadlineInfo.isUrgent
                      ? 'text-[#9A6B0F] dark:text-accent'
                      : 'text-[#323243] dark:text-[#E2E4ED]'
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  {deadlineInfo.countdownText}
                </span>

                <span className="text-[10px] font-normal text-muted dark:text-[#94A3B8]">
                  {deadlineInfo.formattedDate}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <StatusDropdown
                  status={drive.status}
                  onChange={(newStatus) => onUpdateStatus(drive.id, newStatus)}
                  size="sm"
                  align="left"
                />

                <div className="flex items-center gap-1.5">
                  {drive.apply_url && drive.status === 'NEW' && !deadlineInfo.isExpired ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApply(drive.id);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md border border-transparent bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors duration-150 hover:bg-primary-hover active:scale-95"
                      title="Open official Google Form / registration link"
                    >
                      <Send className="h-3 w-3" />
                      <span>Apply Now</span>
                    </button>
                  ) : drive.apply_url && drive.status === 'NEW' && deadlineInfo.isExpired ? (
                    <span
                      className="inline-flex cursor-default items-center rounded-md border border-line bg-canvas px-3 py-1.5 text-xs font-normal text-muted dark:border-[#1F2430] dark:bg-[#0B0E14] dark:text-[#94A3B8]"
                      title="Application window closed"
                    >
                      Expired
                    </span>
                  ) : !drive.apply_url ? (
                    <button
                      type="button"
                      onClick={() => onSelectDrive(drive)}
                      className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-normal text-[#323243] transition-colors duration-150 hover:border-primary hover:text-primary dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#E2E4ED]"
                    >
                      <span>Details</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
