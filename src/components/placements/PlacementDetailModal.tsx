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
    <div className="safe-bottom fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4 overflow-y-auto">
      <div
        className="relative my-0 sm:my-8 max-h-[92dvh] flex w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-white/10 bg-ink-card text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4 sm:p-5 sm:pb-4">
          <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-lg bg-white/5 text-slate-300 font-bold items-center justify-center text-base sm:text-lg border border-white/10">
              {drive.company.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="min-w-0 flex-1 truncate text-base sm:text-xl font-bold text-white" title={drive.company}>{drive.company}</h2>
                {drive.company_website && (
                  <a
                    href={drive.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-slate-400 hover:text-indigo-400 transition-colors duration-150"
                    title="Visit official website"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className="max-w-full truncate rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-slate-300 font-semibold">
                  {drive.drive_type.replace(/_/g, ' ')}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300 font-medium">
                  {drive.positions.length} {drive.positions.length === 1 ? 'Profile' : 'Profiles'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => onToggleStar(drive.id)}
              className={`p-2 rounded-lg border transition-colors duration-150 ${
                drive.starred
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                  : 'border-white/10 text-slate-400 hover:text-amber-400 hover:bg-white/[0.03]'
              }`}
              title={drive.starred ? 'Starred opportunity' : 'Star opportunity'}
            >
              <Star className={`h-4 w-4 ${drive.starred ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150"
              title="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-0 space-y-4 overflow-y-auto p-4 sm:p-5 max-h-[calc(92dvh-88px)] sm:max-h-[70vh]">
          {/* Status & Quick Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate-400 font-medium">Pipeline Status:</span>
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
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-brandviolet px-3 py-1.5 text-xs font-semibold text-white hover:bg-brandviolet-hover active:scale-95 transition-colors duration-150"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Apply Now & Track</span>
                </button>
              )}
              {drive.apply_url && drive.status === 'NEW' && deadlineInfo.isExpired && (
                <span className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-neutral-500">
                  Expired
                </span>
              )}
              <button
                onClick={() => onToggleArchive(drive.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>{drive.archived ? 'Unarchive' : 'Archive'}</span>
              </button>
            </div>
          </div>

          {/* Deadline Banner */}
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3.5 text-xs">
            <div
              className={`rounded-lg p-2 ${
                deadlineInfo.statusColor === 'rose'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : deadlineInfo.statusColor === 'amber'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              <Calendar className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-slate-200">Deadline: {deadlineInfo.formattedDate}</span>
              <p className="text-[11px] text-slate-400 mt-0.5">{deadlineInfo.countdownText}</p>
            </div>
          </div>

          {/* Profiles Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Profiles</h3>
            <div className="space-y-3">
              {drive.positions.map((pos, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-3.5 sm:p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h4 className="min-w-0 flex-1 text-sm font-semibold text-white break-words">{pos.role}</h4>
                    {pos.ctc && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                        <IndianRupee className="h-3 w-3" /> {pos.ctc}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{pos.location || 'Not specified'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
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
                          className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-slate-300 font-medium"
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Important Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {drive.job_description_url ? (
                <a
                  href={drive.job_description_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-200 hover:border-indigo-500/40 hover:text-indigo-300 transition-colors duration-150"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <FileText className="h-4 w-4 text-indigo-400" />
                    Job Description (JD)
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </a>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-400">
                  <FileText className="h-4 w-4" />
                  <span>JD link not specified</span>
                </div>
              )}

              {drive.company_website ? (
                <a
                  href={drive.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-200 hover:border-indigo-500/40 hover:text-indigo-300 transition-colors duration-150"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Building className="h-4 w-4 text-indigo-400" />
                    Company Website
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </a>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-400">
                  <Building className="h-4 w-4" />
                  <span>Website not specified</span>
                </div>
              )}
            </div>
          </div>

          {/* User Notes Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">My Private Notes</h3>
              {isSavedNotes && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
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
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors duration-150"
            />
            <p className="text-[10px] text-slate-400">
              Notes are saved only in your personal Google Drive and never sent to any central database.
            </p>
          </div>

          {/* Original Source Reference */}
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <Mail className="h-3.5 w-3.5 text-indigo-400" />
              <span>Original Email Reference</span>
            </div>
            <p className="truncate">Subject: {drive.source.subject}</p>
            <p className="truncate">From: {drive.source.sender}</p>
            {originalEmailUrl && (
              <a
                href={originalEmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-300 transition-colors duration-150 hover:border-indigo-500/50 hover:text-indigo-200"
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