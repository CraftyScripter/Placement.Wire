'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Star,
  Calendar,
  MapPin,
  IndianRupee,
  GraduationCap,
  FileText,
  Mail,
  CheckCircle2,
  Send,
  Building,
  Archive,
} from 'lucide-react';
import { PlacementDrive, ApplicationStatus } from '@/schemas/placement.schema';
import { formatDeadline } from '@/lib/utils/deadline';
import { getOriginalEmailUrl } from '@/lib/utils/gmail';
import { StatusDropdown } from '@/components/ui/StatusDropdown';

interface PlacementDetailModalProps {
  drive: PlacementDrive | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onToggleStar: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onApply: (id: string) => void;
}

export const PlacementDetailModal: React.FC<PlacementDetailModalProps> = ({
  drive,
  isOpen,
  onClose,
  onUpdateStatus,
  onToggleStar,
  onToggleArchive,
  onUpdateNotes,
  onApply,
}) => {
  const [localNotes, setLocalNotes] = useState('');
  const [isSavedNotes, setIsSavedNotes] = useState(false);

  useEffect(() => {
    if (drive) {
      setLocalNotes(drive.user_notes || '');
      setIsSavedNotes(false);
    }
  }, [drive]);

  if (!isOpen || !drive) return null;

  const deadlineInfo = formatDeadline(drive.deadline, drive.deadline_precision);
  const originalEmailUrl = getOriginalEmailUrl(drive);

  const handleNotesBlur = () => {
    if (drive && localNotes !== drive.user_notes) {
      onUpdateNotes(drive.id, localNotes);
      setIsSavedNotes(true);
      setTimeout(() => setIsSavedNotes(false), 2000);
    }
  };

  return (
    <div className="safe-bottom fixed inset-0 z-50 flex items-end justify-center bg-[#323243]/40 p-0 sm:items-center sm:p-4 overflow-y-auto">
      <div
        className="relative my-0 sm:my-8 max-h-[92dvh] flex w-full max-w-2xl flex-col overflow-hidden rounded-t-lg sm:rounded-lg border border-line bg-white text-[#323243] shadow-pop dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#E2E4ED]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 border-b border-line dark:border-[#1F2430] p-4 sm:p-5 sm:pb-4">
          <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-md bg-primary-soft text-primary font-semibold items-center justify-center text-base sm:text-lg border border-line dark:border-[#1F2430] dark:bg-primary/20">
              {drive.company.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="min-w-0 flex-1 truncate text-base sm:text-xl font-semibold text-[#323243] dark:text-[#E2E4ED]" title={drive.company}>{drive.company}</h2>
                {drive.company_website && (
                  <a
                    href={drive.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-muted hover:text-primary transition-colors duration-150 dark:text-[#94A3B8]"
                    title="Visit official website"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className="chip-base !py-0.5 max-w-full truncate text-[11px] font-normal">
                  {drive.drive_type.replace(/_/g, ' ')}
                </span>
                <span className="text-muted dark:text-[#94A3B8]">•</span>
                <span className="text-muted dark:text-[#94A3B8] font-normal">
                  {drive.positions.length} {drive.positions.length === 1 ? 'Profile' : 'Profiles'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => onToggleStar(drive.id)}
              className={`p-2 rounded-md border transition-colors duration-150 ${
                drive.starred
                  ? 'border-accent bg-accent-soft text-accent dark:border-accent/40 dark:bg-accent/20'
                  : 'border-line bg-white text-muted hover:border-accent hover:text-accent dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#94A3B8]'
              }`}
              title={drive.starred ? 'Starred opportunity' : 'Star opportunity'}
            >
              <Star className={`h-4 w-4 ${drive.starred ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-md border border-line bg-white text-muted hover:border-primary hover:text-primary transition-colors duration-150 dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#94A3B8]"
              title="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-0 space-y-4 overflow-y-auto p-4 sm:p-5 max-h-[calc(92dvh-88px)] sm:max-h-[70vh]">
          {/* Status & Quick Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-lg border border-line bg-canvas p-3 dark:border-[#1F2430] dark:bg-[#0B0E14]">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-muted font-normal dark:text-[#94A3B8]">Pipeline Status:</span>
              <StatusDropdown
                status={drive.status}
                onChange={(newStatus) => onUpdateStatus(drive.id, newStatus)}
                size="md"
                align="left"
              />
            </div>

            <div className="flex items-center gap-2">
              {drive.apply_url && drive.status === 'NEW' && !deadlineInfo.isExpired && (
                <button
                  onClick={() => onApply(drive.id)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-primary-hover active:scale-95 transition-colors duration-150"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Apply Now & Track</span>
                </button>
              )}
              {drive.apply_url && drive.status === 'NEW' && deadlineInfo.isExpired && (
                <span className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-md border border-line bg-canvas px-3 py-1.5 text-xs font-normal text-muted dark:border-[#1F2430] dark:bg-[#0B0E14] dark:text-[#94A3B8]">
                  Expired
                </span>
              )}
              <button
                onClick={() => onToggleArchive(drive.id)}
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-normal text-muted hover:border-primary hover:text-primary transition-colors duration-150 dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#94A3B8]"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>{drive.archived ? 'Unarchive' : 'Archive'}</span>
              </button>
            </div>
          </div>

          {/* Deadline Banner */}
          <div className="flex items-center gap-3 rounded-lg border border-line bg-canvas p-3.5 text-xs dark:border-[#1F2430] dark:bg-[#0B0E14]">
            <div
              className={`rounded-md p-2 border ${
                deadlineInfo.statusColor === 'rose'
                  ? 'bg-error-soft text-error border-error/20 dark:bg-error/20'
                  : deadlineInfo.statusColor === 'amber'
                  ? 'bg-accent-soft text-[#9A6B0F] border-accent/30 dark:bg-accent/20 dark:text-[#FCD34D]'
                  : 'bg-success-soft text-[#15803D] border-success/20 dark:bg-success/20 dark:text-[#21C56E]'
              }`}
            >
              <Calendar className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-[#323243] dark:text-[#E2E4ED]">Deadline: {deadlineInfo.formattedDate}</span>
              <p className={`text-[11px] mt-0.5 font-normal ${deadlineInfo.isExpired ? 'text-error' : deadlineInfo.isUrgent ? 'text-[#9A6B0F] dark:text-[#FCD34D]' : 'text-muted dark:text-[#94A3B8]'}`}>{deadlineInfo.countdownText}</p>
            </div>
          </div>

          {/* Profiles Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted dark:text-[#94A3B8]">Available Profiles</h3>
            <div className="space-y-3">
              {drive.positions.map((pos, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-line bg-canvas p-3.5 sm:p-4 space-y-2.5 dark:border-[#1F2430] dark:bg-[#0B0E14]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h4 className="min-w-0 flex-1 text-sm font-semibold text-[#323243] dark:text-[#E2E4ED] break-words">{pos.role}</h4>
                    {pos.ctc && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success-soft px-2 py-0.5 text-xs font-semibold text-[#15803D] dark:bg-success/20 dark:text-[#21C56E]">
                        <IndianRupee className="h-3 w-3" /> {pos.ctc}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted dark:text-[#94A3B8] pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted dark:text-[#94A3B8]" />
                      <span>{pos.location || 'Not specified'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-muted dark:text-[#94A3B8]" />
                      <span>
                        Batches:{' '}
                        {pos.eligible_batches.length > 0
                          ? pos.eligible_batches.join(', ')
                          : 'Not specified'}
                      </span>
                    </div>
                  </div>

                  {pos.eligible_courses.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {pos.eligible_courses.map((course) => (
                        <span
                          key={course}
                          className="rounded-full border border-line bg-white px-2 py-0.5 text-[11px] text-muted font-normal dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#94A3B8]"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Links & Attachments */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted dark:text-[#94A3B8]">Important Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {drive.job_description_url ? (
                <a
                  href={drive.job_description_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-line bg-canvas p-3 text-xs text-[#323243] hover:border-primary hover:text-primary transition-colors duration-150 dark:border-[#1F2430] dark:bg-[#0B0E14] dark:text-[#E2E4ED]"
                >
                  <span className="flex items-center gap-2 font-normal">
                    <FileText className="h-4 w-4 text-primary" />
                    Job Description (JD)
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted dark:text-[#94A3B8]" />
                </a>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas p-3 text-xs text-muted dark:border-[#1F2430] dark:bg-[#0B0E14] dark:text-[#94A3B8]">
                  <FileText className="h-4 w-4" />
                  <span>JD link not specified</span>
                </div>
              )}

              {drive.company_website ? (
                <a
                  href={drive.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-line bg-canvas p-3 text-xs text-[#323243] hover:border-primary hover:text-primary transition-colors duration-150 dark:border-[#1F2430] dark:bg-[#0B0E14] dark:text-[#E2E4ED]"
                >
                  <span className="flex items-center gap-2 font-normal">
                    <Building className="h-4 w-4 text-primary" />
                    Company Website
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted dark:text-[#94A3B8]" />
                </a>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas p-3 text-xs text-muted dark:border-[#1F2430] dark:bg-[#0B0E14] dark:text-[#94A3B8]">
                  <Building className="h-4 w-4" />
                  <span>Website not specified</span>
                </div>
              )}
            </div>
          </div>

          {/* User Notes Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted dark:text-[#94A3B8]">My Private Notes</h3>
              {isSavedNotes && (
                <span className="flex items-center gap-1 text-[11px] text-[#15803D] dark:text-[#21C56E] font-normal">
                  <CheckCircle2 className="h-3 w-3" /> Auto-saved
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Write your notes here (e.g., Round 1 questions, referral info, interview timing)..."
              className="input-base h-auto min-h-[96px] w-full p-3 text-xs"
            />
            <p className="text-[10px] text-muted dark:text-[#94A3B8]">
              Notes are saved only in your personal Google Drive and never sent to any central database.
            </p>
          </div>

          {/* Original Source Reference */}
          <div className="rounded-lg border border-line bg-canvas p-3 text-[11px] text-muted dark:border-[#1F2430] dark:bg-[#0B0E14] dark:text-[#94A3B8] space-y-1">
            <div className="flex items-center gap-1.5 font-normal text-[#323243] dark:text-[#E2E4ED]">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span>Original Email Reference</span>
            </div>
            <p className="truncate">Subject: {drive.source.subject}</p>
            <p className="truncate">From: {drive.source.sender}</p>
            {originalEmailUrl && (
              <a
                href={originalEmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary-soft px-2.5 py-1.5 text-[11px] font-normal text-primary transition-colors duration-150 hover:border-primary hover:text-primary-hover dark:bg-primary/20"
                title="Open the original email in Gmail"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Open Original Email</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
