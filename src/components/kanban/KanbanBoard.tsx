'use client';

import React, { useState } from 'react';
import {
  Star,
  MapPin,
  IndianRupee,
  Clock,
  Send,
  FileText,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { PlacementDrive, ApplicationStatus } from '@/schemas/placement.schema';
import { formatDeadline } from '@/lib/utils/deadline';
import { StatusDropdown } from '@/components/ui/StatusDropdown';

interface KanbanBoardProps {
  drives: PlacementDrive[];
  onSelectDrive: (drive: PlacementDrive) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onToggleStar: (id: string) => void;
  onApply: (id: string) => void;
}

interface ColumnDef {
  id: ApplicationStatus;
  title: string;
  badgeColor: string;
  accentBorder: string;
}

const COLUMNS: ColumnDef[] = [
  {
    id: 'NEW',
    title: 'New Drives',
    badgeColor: 'bg-white/[0.03] text-slate-300 border-white/10',
    accentBorder: '',
  },
  {
    id: 'APPLIED',
    title: 'Applied',
    badgeColor: 'bg-white/[0.03] text-slate-300 border-white/10',
    accentBorder: '',
  },
  {
    id: 'SHORTLISTED',
    title: 'Shortlisted',
    badgeColor: 'bg-white/[0.03] text-slate-300 border-white/10',
    accentBorder: '',
  },
  {
    id: 'INTERVIEW_SCHEDULED',
    title: 'Interviews',
    badgeColor: 'bg-white/[0.03] text-slate-300 border-white/10',
    accentBorder: '',
  },
  {
    id: 'ARCHIVED',
    title: 'Archived',
    badgeColor: 'bg-white/[0.03] text-slate-300 border-white/10',
    accentBorder: '',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  drives,
  onSelectDrive,
  onUpdateStatus,
  onToggleStar,
  onApply,
}) => {
  const [draggedDriveId, setDraggedDriveId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedDriveId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    const driveId = e.dataTransfer.getData('text/plain') || draggedDriveId;
    if (driveId) {
      onUpdateStatus(driveId, targetStatus);
    }
    setDraggedDriveId(null);
  };

  return (
    <div className="grid grid-cols-1 min-[560px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 items-start overflow-x-auto no-scrollbar snap-x snap-mandatory md:snap-none pb-4 -mx-1 px-1">
      {COLUMNS.map((col) => {
        const columnDrives = drives.filter((d) => d.status === col.id);

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className="flex flex-col rounded-lg border border-white/10 bg-white/[0.03] p-3 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 px-1 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{col.title}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${col.badgeColor}`}
                >
                  {columnDrives.length}
                </span>
              </div>
            </div>

            {/* Column Cards */}
            <div className="flex flex-col gap-2.5 flex-1">
              {columnDrives.length === 0 ? (
                <div className="flex flex-1 items-center justify-center p-6 text-center border border-dashed border-white/10 rounded-lg">
                  <span className="text-xs text-slate-400">No drives in {col.title}</span>
                </div>
              ) : (
                columnDrives.map((drive) => {
                  const deadlineInfo = formatDeadline(drive.deadline, drive.deadline_precision);
                  const firstPosition = drive.positions[0];

                  return (
                    <div
                      key={drive.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, drive.id)}
                      onClick={() => onSelectDrive(drive)}
                      className={`group relative rounded-lg border border-white/10 bg-white/[0.03] p-3.5 cursor-pointer hover:bg-white/[0.05] transition-colors duration-150 ${col.accentBorder}`}
                    >
                      {/* Card Top: Company & Star */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-white/5 text-slate-300 font-bold text-xs flex items-center justify-center border border-white/10">
                            {drive.company.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors duration-150 line-clamp-1">
                              {drive.company}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              {drive.positions.length > 1
                                ? `${drive.positions.length} Profiles`
                                : firstPosition?.role}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(drive.id);
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            drive.starred
                              ? 'text-yellow-400'
                              : 'text-slate-400 hover:text-yellow-400'
                          }`}
                        >
                          <Star className={`h-3.5 w-3.5 ${drive.starred ? 'fill-yellow-400' : ''}`} />
                        </button>
                      </div>

                      {/* Package / Location Tags */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                        {firstPosition?.ctc && (
                          <span className="inline-flex items-center gap-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-semibold text-emerald-400">
                            <IndianRupee className="h-2.5 w-2.5" />
                            {firstPosition.ctc}
                          </span>
                        )}

                        {firstPosition?.location && (
                          <span className="inline-flex items-center gap-0.5 text-slate-400">
                            <MapPin className="h-2.5 w-2.5" />
                            {firstPosition.location}
                          </span>
                        )}
                      </div>

                      {/* Deadline Countdown & Actions */}
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10 text-[10px]">
                        <span
                          className={`inline-flex items-center gap-1 font-medium ${
                            deadlineInfo.statusColor === 'rose'
                              ? 'text-rose-400'
                              : deadlineInfo.statusColor === 'amber'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {deadlineInfo.countdownText}
                        </span>

                        <div className="flex items-center gap-1">
                          {drive.user_notes && (
                            <span title="Contains private notes">
                              <FileText className="h-3 w-3 text-indigo-400" />
                            </span>
                          )}

                          {drive.apply_url && col.id === 'NEW' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onApply(drive.id);
                              }}
                              className="inline-flex items-center gap-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-emerald-500 transition-colors duration-150"
                              title="Apply & track status"
                            >
                              <Send className="h-2.5 w-2.5" />
                              <span>Apply</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* One-click status selector */}
                      <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Status:</span>
                        <StatusDropdown
                          status={drive.status}
                          onChange={(newStatus) => onUpdateStatus(drive.id, newStatus)}
                          size="sm"
                          align="right"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
