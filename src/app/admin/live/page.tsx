'use client';

import React from 'react';
import {
  Activity,
  Compass,
  Globe2,
  Laptop,
  MapPin,
  MousePointerClick,
  Radio,
  User,
  Users,
} from 'lucide-react';
import { useAdminOverview } from '@/hooks/use-admin-overview';
import { Card, CardTitle, fmtNumber, fmtTime } from '@/components/admin/ui';
import type { Visitor } from '@/lib/analytics/store';

function locOf(v: Visitor): string {
  const parts = [v.city, v.country || v.region].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}

function LiveTableRow({ v, isLive }: { v: Visitor; isLive: boolean }) {
  const email = v.email || `Anonymous (${v.key.slice(5, 11)})`;
  const isAnon = !v.email;

  return (
    <tr className="border-b border-slate-100 transition-colors duration-150 hover:bg-slate-50/80 dark:border-[#1F2430] dark:hover:bg-[#1A202E]/60">
      {/* Student / Visitor */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
              isLive
                ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-500 dark:bg-[#1F2430] dark:text-[#94A3B8]'
            }`}
          >
            {isAnon ? <User className="h-4 w-4" /> : email[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-semibold text-slate-800 dark:text-[#E2E4ED]" title={email}>
                {email}
              </span>
              {v.isAdmin && (
                <span className="rounded-full bg-amber-500/10 px-1.5 py-0.2 text-[9px] font-black uppercase text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                  ADMIN
                </span>
              )}
            </div>
            <p className="truncate text-[11px] text-slate-400 dark:text-[#64748B]">
              {[v.name, v.device].filter(Boolean).join(' · ') || 'Web Browser'}
            </p>
          </div>
        </div>
      </td>

      {/* Current Page */}
      <td className="px-4 py-3">
        {v.lastPath ? (
          <span className="inline-flex max-w-[200px] truncate items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-1 font-mono text-[11px] font-medium text-slate-700 dark:border-[#1F2430] dark:bg-[#0B0E14] dark:text-slate-300">
            <MousePointerClick className="h-3 w-3 shrink-0 text-primary" />
            <span className="truncate">{v.lastPath}</span>
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>

      {/* Location */}
      <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-[#94A3B8]">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
          <span>{locOf(v)}</span>
        </span>
      </td>

      {/* IP */}
      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-[#94A3B8]">
        {v.lastIp || '—'}
      </td>

      {/* Activity Status */}
      <td className="whitespace-nowrap px-4 py-3">
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Active Now
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 dark:text-[#7D889E]">
            {fmtTime(v.lastActive)}
          </span>
        )}
      </td>
    </tr>
  );
}

export default function AdminLivePage() {
  const { data, loading } = useAdminOverview();
  const liveList = data?.liveNow || [];
  const liveKeys = new Set(liveList.map((v) => v.key));
  const recent = (data?.visitors || []).filter((v) => !liveKeys.has(v.key)).slice(0, 30);

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Live Presence & Active Heartbeats
            </h1>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              {liveList.length} Online Now
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-[#94A3B8]">
            Students currently browsing Placement.Wire with an active browser tab (synced every 2 minutes).
          </p>
        </div>
      </header>

      {/* Online Now Table */}
      <Card noPadding>
        <div className="flex items-center justify-between border-b border-slate-200/80 p-4 dark:border-[#1F2430]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Radio className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-[#E2E4ED]">
                Currently Active Students ({liveList.length})
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-[#64748B]">
                Active within the last 5 minutes
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-[#1F2430] dark:bg-[#0F131D] dark:text-[#94A3B8]">
                <th className="px-4 py-3">Student / Device</th>
                <th className="px-4 py-3">Active Page</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Presence Status</th>
              </tr>
            </thead>
            <tbody>
              {liveList.map((v) => (
                <LiveTableRow key={v.key} v={v} isLive />
              ))}
              {liveList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                    {loading ? 'Detecting active users...' : 'No active students online at this exact moment.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recently Active Table */}
      <Card noPadding>
        <div className="flex items-center justify-between border-b border-slate-200/80 p-4 dark:border-[#1F2430]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-[#1F2430] dark:text-[#94A3B8]">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-[#E2E4ED]">
                Recently Active Visitors
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-[#64748B]">
                Last 30 students who opened the portal
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-[#1F2430] dark:bg-[#0F131D] dark:text-[#94A3B8]">
                <th className="px-4 py-3">Student / Device</th>
                <th className="px-4 py-3">Last Opened Page</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((v) => (
                <LiveTableRow key={v.key} v={v} isLive={false} />
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                    {loading ? 'Loading...' : 'No recent visitor activity recorded.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
