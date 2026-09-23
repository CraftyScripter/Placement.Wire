'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  MapPin,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAdminOverview } from '@/hooks/use-admin-overview';
import { Card, CardTitle, Stat, fmtNumber, fmtTime } from '@/components/admin/ui';

export default function AdminSignupsPage() {
  const { data, loading } = useAdminOverview();
  const [hoveredDay, setHoveredDay] = useState<{ date: string; signups: number } | null>(null);

  const perDay = data?.perDay || [];
  const maxDay = Math.max(1, ...(perDay.map((d) => d.signups) || [1]));
  const signups = data?.signups || [];
  const newUsers = signups.filter((v) => v.loginCount > 0);

  const todayStr = new Date().toISOString().slice(0, 10);
  const signupsToday = perDay.find((d) => d.date === todayStr)?.signups ?? 0;
  const total30dSignups = perDay.reduce((sum, d) => sum + d.signups, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Student Registrations & Onboarding
            </h1>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              {data?.totals.signups ?? 0} Registered
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-[#94A3B8]">
            Records of every student account onboarded through institutional or personal Google login.
          </p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label="Total Registered Students"
          value={fmtNumber(data?.totals.signups)}
          sub="Verified accounts"
          icon={UserPlus}
        />
        <Stat
          label="New Registrations Today"
          value={signupsToday}
          sub="First-time student signins"
          icon={Sparkles}
          badge={signupsToday > 0 ? `+${signupsToday} today` : undefined}
        />
        <Stat
          label="Total Student Logins"
          value={fmtNumber(data?.totals.logins)}
          sub="All-time authentication events"
          icon={UserCheck}
        />
      </div>

      {/* 30-Day Signups Trend Chart */}
      <Card>
        <CardTitle
          icon={TrendingUp}
          subtitle="Daily account registrations over the past 30 days"
          right={
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">
              <span>30-Day Signups:</span>
              <strong className="text-slate-900 dark:text-white">{total30dSignups}</strong>
            </div>
          }
        >
          Registration Trend
        </CardTitle>

        {/* Hover info badge */}
        <div className="mt-2 min-h-[22px]">
          {hoveredDay ? (
            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
              <span>{hoveredDay.date}:</span>
              <span>{hoveredDay.signups} new registrations</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Hover over bars to inspect daily registration counts
            </p>
          )}
        </div>

        {!data || perDay.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
            {loading ? 'Loading signups...' : 'No registrations recorded yet.'}
          </div>
        ) : (
          <div className="mt-3 flex items-end gap-1.5 overflow-x-auto pb-2 pt-3">
            {perDay.map((d) => {
              const heightPct = Math.max(8, Math.round((d.signups / maxDay) * 100));
              const isPeak = d.signups === maxDay && maxDay > 1;

              return (
                <div
                  key={d.date}
                  onMouseEnter={() => setHoveredDay(d)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="group relative flex w-12 shrink-0 cursor-pointer flex-col items-center gap-1.5"
                >
                  {/* Tooltip on hover */}
                  <div className="pointer-events-none absolute -top-8 z-20 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg group-hover:block dark:bg-white dark:text-slate-900">
                    {d.signups} signups
                  </div>

                  {/* Bar */}
                  <div className="relative flex h-24 w-full items-end justify-center rounded-lg bg-slate-50 p-1 dark:bg-[#0B0E14]">
                    <div
                      className={`w-full rounded-md transition-all duration-200 group-hover:brightness-110 ${
                        isPeak
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                          : 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  {/* Day Date Label */}
                  <span className="text-[10px] font-medium text-slate-500 dark:text-[#94A3B8]">
                    {d.date.slice(5)}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {d.signups}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Newest Registered Students Table */}
      <Card noPadding>
        <div className="flex items-center justify-between border-b border-slate-200/80 p-4 dark:border-[#1F2430]">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-[#E2E4ED]">
              Newest Registered Students ({newUsers.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-[#1F2430] dark:bg-[#0F131D] dark:text-[#94A3B8]">
                <th className="px-4 py-3">Student Account</th>
                <th className="px-4 py-3">Registered On</th>
                <th className="px-4 py-3">Total Visits</th>
                <th className="px-4 py-3">Logins</th>
                <th className="px-4 py-3">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1F2430]">
              {newUsers.slice(0, 100).map((v) => {
                const initial = v.email ? v.email[0].toUpperCase() : 'S';
                const location = [v.city, v.country || v.region].filter(Boolean).join(', ') || '—';

                return (
                  <tr
                    key={v.key}
                    className="transition-colors duration-150 hover:bg-slate-50/80 dark:hover:bg-[#1A202E]/60"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate font-semibold text-slate-800 dark:text-[#E2E4ED]" title={v.email || ''}>
                              {v.email}
                            </span>
                            {v.isAdmin && (
                              <span className="rounded-full bg-amber-500/10 px-1.5 py-0.2 text-[9px] font-black uppercase text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 dark:text-[#64748B]">
                            {v.name || 'Verified Student'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-[11px] text-slate-500 dark:text-[#94A3B8]">
                      {fmtTime(v.firstSeen)}
                    </td>

                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {fmtNumber(v.totalVisits)}
                    </td>

                    <td className="px-4 py-3 font-mono text-xs font-bold text-primary">
                      {fmtNumber(v.loginCount)}
                    </td>

                    <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-[#94A3B8]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                        <span>{location}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}

              {newUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                    {loading ? 'Loading signups...' : 'No registered students recorded yet.'}
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
