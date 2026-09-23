'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Laptop,
  LogIn,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAdminOverview } from '@/hooks/use-admin-overview';
import { Card, CardTitle, Stat, fmtNumber, fmtTime } from '@/components/admin/ui';

export default function AdminLoginsPage() {
  const { data, loading } = useAdminOverview();
  const [hoveredDay, setHoveredDay] = useState<{ date: string; logins: number } | null>(null);

  const perDay = data?.perDay || [];
  const maxDay = Math.max(1, ...(perDay.map((d) => d.logins) || [1]));
  const byLogin = [...(data?.visitors || [])]
    .filter((v) => v.loginCount > 0)
    .sort((a, b) => ((a.lastLogin || '') < (b.lastLogin || '') ? 1 : -1));

  const todayStr = new Date().toISOString().slice(0, 10);
  const loginsToday = perDay.find((d) => d.date === todayStr)?.logins ?? 0;
  const total30dLogins = perDay.reduce((sum, d) => sum + d.logins, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Student Login Activity & Authentications
            </h1>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary dark:bg-primary/20">
              {byLogin.length} Active Accounts
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-[#94A3B8]">
            Audit log of student login frequencies, repeat visits, and authentication timestamps.
          </p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label="Total Logins (All Time)"
          value={fmtNumber(data?.totals.logins)}
          sub="Cumulative authentications"
          icon={LogIn}
        />
        <Stat
          label="Active Logged-in Accounts"
          value={fmtNumber(byLogin.length)}
          sub="Unique student accounts"
          icon={Users}
        />
        <Stat
          label="Logins Today"
          value={loginsToday}
          sub="Today's signin sessions"
          icon={UserCheck}
          badge={loginsToday > 0 ? `${loginsToday} active today` : undefined}
        />
      </div>

      {/* 30-Day Logins Trend Chart */}
      <Card>
        <CardTitle
          icon={TrendingUp}
          subtitle="Daily authentications over the past 30 days"
          right={
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">
              <span>30-Day Logins:</span>
              <strong className="text-slate-900 dark:text-white">{total30dLogins}</strong>
            </div>
          }
        >
          Daily Login Activity
        </CardTitle>

        {/* Hover info badge */}
        <div className="mt-2 min-h-[22px]">
          {hoveredDay ? (
            <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary dark:bg-primary/20">
              <span>{hoveredDay.date}:</span>
              <span>{hoveredDay.logins} student logins</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Hover over bars to inspect daily login volume
            </p>
          )}
        </div>

        {!data || perDay.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
            {loading ? 'Loading login data...' : 'No login activity recorded yet.'}
          </div>
        ) : (
          <div className="mt-3 flex items-end gap-1.5 overflow-x-auto pb-2 pt-3">
            {perDay.map((d) => {
              const heightPct = Math.max(8, Math.round((d.logins / maxDay) * 100));
              const isPeak = d.logins === maxDay && maxDay > 1;

              return (
                <div
                  key={d.date}
                  onMouseEnter={() => setHoveredDay(d)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="group relative flex w-12 shrink-0 cursor-pointer flex-col items-center gap-1.5"
                >
                  {/* Tooltip on hover */}
                  <div className="pointer-events-none absolute -top-8 z-20 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg group-hover:block dark:bg-white dark:text-slate-900">
                    {d.logins} logins
                  </div>

                  {/* Bar */}
                  <div className="relative flex h-24 w-full items-end justify-center rounded-lg bg-slate-50 p-1 dark:bg-[#0B0E14]">
                    <div
                      className={`w-full rounded-md transition-all duration-200 group-hover:brightness-110 ${
                        isPeak
                          ? 'bg-gradient-to-t from-primary to-indigo-400'
                          : 'bg-gradient-to-t from-primary/80 to-indigo-400/80'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  {/* Day Date Label */}
                  <span className="text-[10px] font-medium text-slate-500 dark:text-[#94A3B8]">
                    {d.date.slice(5)}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {d.logins}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Login Activity Records Table */}
      <Card noPadding>
        <div className="flex items-center justify-between border-b border-slate-200/80 p-4 dark:border-[#1F2430]">
          <div className="flex items-center gap-2">
            <LogIn className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-[#E2E4ED]">
              Login Activity Log ({byLogin.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-[#1F2430] dark:bg-[#0F131D] dark:text-[#94A3B8]">
                <th className="px-4 py-3">Student Account</th>
                <th className="px-4 py-3">Last Login Time</th>
                <th className="px-4 py-3">Total Logins</th>
                <th className="px-4 py-3">Total Visits</th>
                <th className="px-4 py-3">Primary Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1F2430]">
              {byLogin.slice(0, 200).map((v) => {
                const initial = v.email ? v.email[0].toUpperCase() : 'S';

                return (
                  <tr
                    key={v.key}
                    className="transition-colors duration-150 hover:bg-slate-50/80 dark:hover:bg-[#1A202E]/60"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary dark:bg-primary/20">
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
                      {fmtTime(v.lastLogin)}
                    </td>

                    <td className="px-4 py-3 font-mono text-xs font-bold text-primary">
                      {fmtNumber(v.loginCount)}
                    </td>

                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {fmtNumber(v.totalVisits)}
                    </td>

                    <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-[#94A3B8]">
                      {v.device || 'Desktop Browser'}
                    </td>
                  </tr>
                );
              })}

              {byLogin.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                    {loading ? 'Loading login records...' : 'No login activity recorded yet.'}
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
