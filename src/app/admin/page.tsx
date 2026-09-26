'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Flame,
  Globe2,
  LogIn,
  MousePointerClick,
  Radio,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAdminOverview } from '@/hooks/use-admin-overview';
import { Card, CardTitle, Stat, fmtDur, fmtNumber, fmtTime } from '@/components/admin/ui';

export default function AdminOverviewPage() {
  const { data, loading, refresh } = useAdminOverview();
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    visits: number;
    logins: number;
    signups: number;
    visitors: number;
  } | null>(null);

  const t = data?.totals;
  const perDay = data?.perDay || [];
  const maxDay = Math.max(1, ...(perDay.map((d) => d.visits) || [1]));
  const totalShownVisits = perDay.reduce((sum, d) => sum + d.visits, 0);

  const hourly = data?.hourly || [];
  const maxHour = Math.max(1, ...(hourly || [1]));
  const peakHourIndex = hourly.indexOf(Math.max(...hourly));

  // Format peak hour nicely e.g. "2:00 PM"
  const fmtHourLabel = (h: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12} ${period}`;
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Platform Overview & Analytics
            </h1>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary dark:bg-primary/20">
              Live
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-[#94A3B8]">
            Real-time student portal traffic, active sessions, and engagement metrics.
            <span className="mt-0.5 block">1 profile = 1 college email, or 1 anonymous browser — logging in merges the two.</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {data?.updatedAt && (
            <span className="hidden text-[11px] text-slate-400 dark:text-slate-500 sm:inline">
              Updated {fmtTime(data.updatedAt)}
            </span>
          )}
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:opacity-50 dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#E2E4ED] dark:hover:bg-[#1A202E]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8">
        <Stat
          label="Total Visitors"
          value={fmtNumber(t?.visitors)}
          sub="Unique students"
          icon={Users}
        />
        <Stat
          label="Total Page Views"
          value={fmtNumber(t?.visits)}
          sub="All-time visits"
          icon={MousePointerClick}
        />
        <Stat
          label="Live Online Now"
          value={t?.onlineNow ?? 0}
          sub="Active last 5 min"
          icon={Radio}
          badge={t && t.onlineNow > 0 ? 'Active' : undefined}
        />
        <Stat
          label="Active Today (DAU)"
          value={t?.dau ?? 0}
          sub={`7d: ${t?.wau ?? 0} · 30d: ${t?.mau ?? 0}`}
          icon={Activity}
        />
        <Stat
          label="Student Signups"
          value={fmtNumber(t?.signups)}
          sub="New accounts"
          icon={UserPlus}
        />
        <Stat
          label="Total Logins"
          value={fmtNumber(t?.logins)}
          sub="Auth sessions"
          icon={LogIn}
        />
        <Stat
          label="Avg Session Time"
          value={t ? fmtDur(t.avgSessionSecs) : '—'}
          sub={`${fmtNumber(t?.sessions)} sessions`}
          icon={Clock}
        />
        <Stat
          label="Single-Visit (Bounce)"
          value={fmtNumber(t?.bounced)}
          sub={
            t && t.visitors > 0
              ? `${Math.round((t.bounced / t.visitors) * 100)}% bounce rate`
              : 'One page only'
          }
          icon={TrendingUp}
        />
      </div>

      {/* Failed sign-in attempts — people who TRIED but never became users */}
      {data && data.failedLogins.total > 0 && (
        <Card>
          <CardTitle
            icon={ShieldCheck}
            subtitle="Rejected logins by reason — wrong domain, unverified email, or Google OAuth errors"
            right={
              data.failedLogins.lastAt ? (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Last: {fmtTime(data.failedLogins.lastAt)}
                  {data.failedLogins.lastEmail ? ` · ${data.failedLogins.lastEmail}` : ''}
                </span>
              ) : undefined
            }
          >
            Failed Sign-in Attempts
            <span className="ml-2 rounded-full bg-error-soft px-2 py-0.5 text-[11px] font-bold text-error">
              {fmtNumber(data.failedLogins.total)}
            </span>
          </CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.failedLogins.byReason.map((r) => (
              <span
                key={r.reason}
                className="inline-flex items-center gap-1.5 rounded-lg border border-error/25 bg-error-soft/50 px-2.5 py-1 font-mono text-[11px] font-semibold text-error"
                title="Count of rejected attempts for this reason"
              >
                {r.reason}
                <span className="rounded bg-error/15 px-1.5 font-bold">×{r.count}</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Full-history Activity Bar Chart */}
      <Card>
        <CardTitle
          icon={TrendingUp}
          subtitle={`Daily traffic trends — full history (${perDay.length} days, nothing ever deleted)`}
          right={
            <div className="flex items-center gap-3 text-xs">
              <span className="hidden font-medium text-slate-500 dark:text-[#94A3B8] sm:inline">
                Total shown:{' '}
                <strong className="text-slate-900 dark:text-white">
                  {fmtNumber(totalShownVisits)} views
                </strong>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-primary to-indigo-500" />
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Visits</span>
              </div>
            </div>
          }
        >
          Daily Activity Trend
        </CardTitle>

        {/* Hover info badge */}
        <div className="mt-2 min-h-[24px]">
          {hoveredDay ? (
            <div className="inline-flex flex-wrap items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-[#1F2430] dark:text-[#E2E4ED]">
              <span className="font-bold text-primary">{hoveredDay.date}</span>
              <span>·</span>
              <span>{fmtNumber(hoveredDay.visits)} visits</span>
              <span>·</span>
              <span>{hoveredDay.visitors} unique</span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {hoveredDay.signups} signups
              </span>
              <span>·</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {hoveredDay.logins} logins
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Hover over any day bar below to view full breakdown
            </p>
          )}
        </div>

        {!data || perDay.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
            {loading ? 'Fetching analytics...' : 'No daily activity recorded yet.'}
          </div>
        ) : (
          <div className="mt-4 flex items-end gap-1.5 overflow-x-auto pb-2 pt-4">
            {perDay.map((d) => {
              const heightPct = Math.max(8, Math.round((d.visits / maxDay) * 100));
              const isPeak = d.visits === maxDay && maxDay > 1;

              return (
                <div
                  key={d.date}
                  onMouseEnter={() => setHoveredDay(d)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="group relative flex w-12 shrink-0 cursor-pointer flex-col items-center gap-1.5"
                >
                  {/* Tooltip on hover */}
                  <div className="pointer-events-none absolute -top-8 z-20 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg group-hover:block dark:bg-white dark:text-slate-900">
                    {d.visits} visits
                  </div>

                  {/* Bar */}
                  <div className="relative flex h-28 w-full items-end justify-center rounded-lg bg-slate-50 p-1 dark:bg-[#0B0E14]">
                    <div
                      className={`w-full rounded-md transition-all duration-200 group-hover:brightness-110 ${
                        isPeak
                          ? 'bg-gradient-to-t from-amber-500 to-amber-400'
                          : 'bg-gradient-to-t from-primary to-indigo-400'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  {/* Day Date Label */}
                  <span className="text-[10px] font-medium text-slate-500 dark:text-[#94A3B8]">
                    {d.date.slice(5)}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {d.visits}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Grid: 24h Hourly Distribution + Top Visited Pages */}
      <div className="grid gap-5 xl:grid-cols-5">
        {/* Hourly Distribution (3 cols) */}
        <div className="xl:col-span-3">
          <Card className="h-full">
            <CardTitle
              icon={Clock}
              subtitle="24-hour traffic distribution (server local time)"
              right={
                hourly.length > 0 && maxHour > 0 ? (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                    <Flame className="h-3 w-3" />
                    <span>Peak at {fmtHourLabel(peakHourIndex)}</span>
                  </div>
                ) : undefined
              }
            >
              When are Students Most Active?
            </CardTitle>

            {!data || hourly.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                Loading hourly distribution...
              </div>
            ) : (
              <div className="mt-6">
                <div className="flex items-end gap-1 sm:gap-2">
                  {hourly.map((val, h) => {
                    const isPeak = h === peakHourIndex && maxHour > 0;
                    const heightPct = Math.max(6, Math.round((val / maxHour) * 100));

                    return (
                      <div
                        key={h}
                        className="group relative flex min-w-0 flex-1 flex-col items-center gap-1.5"
                        title={`${fmtHourLabel(h)}: ${val} visits`}
                      >
                        {/* Tooltip */}
                        <div className="pointer-events-none absolute -top-7 z-20 hidden whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-white group-hover:block dark:bg-white dark:text-slate-900">
                          {fmtHourLabel(h)}: {val}
                        </div>

                        {/* Bar container */}
                        <div className="relative flex h-24 w-full items-end justify-center rounded bg-slate-50 p-0.5 dark:bg-[#0B0E14]">
                          <div
                            className={`w-full rounded-sm transition-all duration-200 group-hover:opacity-100 ${
                              isPeak
                                ? 'bg-amber-500'
                                : 'bg-primary/75 group-hover:bg-primary'
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>

                        {/* Labels for every 3 hours */}
                        {h % 3 === 0 ? (
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                            {h === 0 ? '12A' : h === 12 ? '12P' : `${h % 12}${h >= 12 ? 'P' : 'A'}`}
                          </span>
                        ) : (
                          <span className="text-[8px] text-transparent select-none">·</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-[#1F2430] dark:text-slate-500">
                  <span>Night (12 AM - 6 AM)</span>
                  <span>Morning (6 AM - 12 PM)</span>
                  <span>Afternoon (12 PM - 6 PM)</span>
                  <span>Evening (6 PM - 12 AM)</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Top Pages Leaderboard (2 cols) */}
        <div className="xl:col-span-2">
          <Card className="h-full">
            <CardTitle
              icon={MousePointerClick}
              subtitle="Most popular pages & views"
              right={
                <Link
                  href="/admin/pages"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover"
                >
                  <span>All Pages</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              }
            >
              Top Visited Pages
            </CardTitle>

            {(!data || (data.topPages || []).length === 0) ? (
              <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                No page data recorded yet.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {data.topPages.slice(0, 6).map((p, idx) => {
                  const maxViews = Math.max(1, ...(data.topPages.map((item) => item.views) || [1]));
                  const pct = Math.round((p.views / maxViews) * 100);

                  return (
                    <div key={p.path} className="group space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-[#1F2430] dark:text-[#94A3B8]">
                            #{idx + 1}
                          </span>
                          <span
                            className="truncate font-mono text-[12px] font-semibold text-slate-800 transition-colors group-hover:text-primary dark:text-[#E2E4ED] dark:group-hover:text-primary"
                            title={p.path}
                          >
                            {p.path}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 font-mono text-[11px]">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {fmtNumber(p.views)}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            ({p.visitors} u)
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#0B0E14]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-300"
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/live"
          className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md dark:border-[#1F2430] dark:bg-[#141824] dark:shadow-none"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Live Presence</p>
              <p className="text-[11px] text-slate-400 dark:text-[#94A3B8]">
                {t?.onlineNow ?? 0} students online right now
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        </Link>

        <Link
          href="/admin/visitors"
          className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md dark:border-[#1F2430] dark:bg-[#141824] dark:shadow-none"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Student Directory</p>
              <p className="text-[11px] text-slate-400 dark:text-[#94A3B8]">
                {fmtNumber(t?.visitors)} unique profiles tracked
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        </Link>

        <Link
          href="/admin/insights"
          className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md dark:border-[#1F2430] dark:bg-[#141824] dark:shadow-none"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Devices & Geo</p>
              <p className="text-[11px] text-slate-400 dark:text-[#94A3B8]">
                Cities, browsers & referrers
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        </Link>

        <Link
          href="/admin/backup"
          className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md dark:border-[#1F2430] dark:bg-[#141824] dark:shadow-none"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Backup & Storage</p>
              <p className="text-[11px] text-slate-400 dark:text-[#94A3B8]">
                {data?.storage.mode === 'drive' ? 'Google Drive Cloud' : 'Local Disk Active'}
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        </Link>
      </div>
    </div>
  );
}
