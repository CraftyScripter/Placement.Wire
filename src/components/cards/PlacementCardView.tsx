'use client';

import React from 'react';
import {
  Star,
  Clock,
  Send,
  MapPin,
  Calendar,
  Building,
  GraduationCap,
  Sparkles,
  Award,
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
    <div className="grid grid-cols-1 min-[560px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-3 sm:gap-4 3xl:gap-5">
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
            className="group flex flex-col justify-between rounded-2xl border border-white/5 bg-ink-card p-4 sm:p-5 cursor-pointer transition-colors duration-150 hover:border-brandviolet/40"
          >
            {/* Card Header: Company, Category & Star */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Company Initial Avatar */}
                  <div className="h-11 w-11 shrink-0 rounded-lg bg-white/5 text-slate-300 font-bold flex items-center justify-center border border-white/10 text-base">
                    {drive.company.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition-colors duration-150 truncate">
                      {drive.company}
                    </h3>
                    {/* Category Pill */}
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      {newIds?.has(drive.id) && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          NEW
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-brandviolet/15 px-2 py-0.5 text-[10px] font-bold text-violet-300">
                        <span>{categoryLabel}</span>
                      </span>

                      {batches.length > 0 && (
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                          Batch {batches.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Star + Original mail */}
                <div className="flex shrink-0 items-center gap-1.5">
                  {emailUrl && (
                    <a
                      href={emailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg border border-white/10 p-1.5 text-slate-500 transition-colors duration-150 hover:bg-white/[0.03] hover:text-indigo-300"
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
                  className={`p-1.5 rounded-lg border transition-colors duration-150 ${
                    drive.starred
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                      : 'border-white/10 text-slate-500 hover:text-amber-400 hover:bg-white/[0.03]'
                  }`}
                  title={drive.starred ? 'Starred' : 'Star opportunity'}
                >
                  <Star className={`h-4 w-4 ${drive.starred ? 'fill-current' : ''}`} />
                </button>
                </div>
              </div>

              {/* Roles & CTC */}
              <div className="mt-4 space-y-1.5">
                <div className="text-xs font-semibold text-slate-100 line-clamp-1" title={allRoles}>
                  {drive.positions.length > 1 ? (
                    <span>
                      {firstPos?.role}{' '}
                      <span className="text-indigo-400 text-[11px] font-normal">
                        (+{drive.positions.length - 1} more profiles)
                      </span>
                    </span>
                  ) : (
                    firstPos?.role || 'Campus Opportunity'
                  )}
                </div>

                {ctc ? (
                  <div className="text-xs font-bold text-emerald-400 truncate">
                    {ctc}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400">
                    Compensation not specified
                  </div>
                )}
              </div>

              {/* Meta details: Location & Courses */}
              <div className="mt-3 space-y-1 text-[11px] text-slate-400 border-t border-white/5 pt-2.5">
                {location && (
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                    <span className="truncate">{location}</span>
                  </div>
                )}

                {courses.length > 0 && (
                  <div className="flex items-center gap-1.5 truncate">
                    <GraduationCap className="h-3 w-3 text-slate-500 shrink-0" />
                    <span className="truncate">{courses.slice(0, 3).join(', ')}{courses.length > 3 ? '...' : ''}</span>
                  </div>
                )}

                {receivedFormatted && (
                  <div className="flex items-center gap-1.5 text-slate-400 pt-0.5">
                    <Calendar className="h-3 w-3 text-slate-500 shrink-0" />
                    <span>Announced on <strong className="text-slate-300 font-medium">{receivedFormatted}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer: Deadline, Status Dropdown & Apply */}
            <div className="mt-4 pt-3 border-t border-white/5 space-y-2.5">
              {/* Deadline countdown */}
              <div className="flex items-center justify-between text-[11px]">
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    deadlineInfo.isExpired
                      ? 'text-rose-400'
                      : deadlineInfo.isUrgent
                      ? 'text-amber-400 font-bold'
                      : 'text-slate-300'
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  {deadlineInfo.countdownText}
                </span>

                <span className="text-[10px] text-slate-400">
                  {deadlineInfo.formattedDate}
                </span>
              </div>

              {/* Actions row: Status dropdown & Apply button */}
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
                      className="inline-flex items-center gap-1.5 rounded-lg border border-transparent bg-brandviolet px-3 py-1.5 text-xs font-semibold text-white hover:bg-brandviolet-hover active:scale-95 transition-colors duration-150"
                      title="Open official Google Form / registration link"
                    >
                      <Send className="h-3 w-3" />
                      <span>Apply Now</span>
                    </button>
                  ) : drive.apply_url && drive.status === 'NEW' && deadlineInfo.isExpired ? (
                    <span
                      className="inline-flex cursor-default items-center rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-neutral-500"
                      title="Application window closed"
                    >
                      Expired
                    </span>
                  ) : !drive.apply_url ? (
                    <button
                      type="button"
                      onClick={() => onSelectDrive(drive)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors duration-150"
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