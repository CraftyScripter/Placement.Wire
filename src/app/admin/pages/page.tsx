'use client';

import React from 'react';
import {
  ArrowUpRight,
  Clock,
  Eye,
  Globe2,
  MousePointerClick,
  Users,
} from 'lucide-react';
import { useAdminOverview } from '@/hooks/use-admin-overview';
import { Card, CardTitle, Stat, fmtNumber, fmtTime } from '@/components/admin/ui';

export default function AdminPagesPage() {
  const { data, loading } = useAdminOverview();
  const pages = data?.topPages || [];
  const maxViews = Math.max(1, ...pages.map((p) => p.views));
  const totalViews = pages.reduce((sum, p) => sum + p.views, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Page Views & Content Analytics
            </h1>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary dark:bg-primary/20">
              {pages.length} Tracked Routes
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-[#94A3B8]">
            Popularity rankings of portal pages, total views, and unique student engagement across each route.
          </p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label="Tracked Routes"
          value={fmtNumber(pages.length)}
          sub="Distinct URL endpoints"
          icon={Globe2}
        />
        <Stat
          label="Total Page Views"
          value={fmtNumber(totalViews)}
          sub="Across all tracked paths"
          icon={Eye}
        />
        <Stat
          label="Top Route"
          value={pages[0]?.path || '—'}
          sub={pages[0] ? `${fmtNumber(pages[0].views)} views (${pages[0].visitors} unique)` : 'No data'}
          icon={MousePointerClick}
        />
      </div>

      {/* Page Ranking List */}
      <Card noPadding>
        <div className="flex items-center justify-between border-b border-slate-200/80 p-4 dark:border-[#1F2430]">
          <div className="flex items-center gap-2">
            <MousePointerClick className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-[#E2E4ED]">
              Route Leaderboard & Engagement Share
            </h2>
          </div>
          <span className="text-xs text-slate-400 dark:text-[#64748B]">
            Ranked by total pageviews
          </span>
        </div>

        <div className="divide-y divide-slate-100 p-4 sm:p-5 dark:divide-[#1F2430]">
          {pages.map((p, idx) => {
            const pct = Math.round((p.views / maxViews) * 100);
            const shareOfTotal = totalViews > 0 ? Math.round((p.views / totalViews) * 100) : 0;

            return (
              <div key={p.path} className="group py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  {/* Route & Rank */}
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        idx === 0
                          ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-700 dark:bg-[#1F2430] dark:text-slate-300'
                          : idx === 2
                          ? 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-[#1F2430] dark:text-[#94A3B8]'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className="truncate font-mono text-[13px] font-semibold text-slate-800 transition-colors group-hover:text-primary dark:text-[#E2E4ED] dark:group-hover:text-primary"
                      title={p.path}
                    >
                      {p.path}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-mono text-slate-900 dark:text-white">
                      <strong className="text-primary">{fmtNumber(p.views)}</strong> views
                      <span className="ml-1 text-slate-400 dark:text-slate-500">
                        ({shareOfTotal}%)
                      </span>
                    </span>
                    <span className="text-slate-300 dark:text-[#1F2430]">·</span>
                    <span className="text-slate-600 dark:text-[#94A3B8]">
                      <strong className="font-mono text-slate-900 dark:text-white">
                        {fmtNumber(p.visitors)}
                      </strong>{' '}
                      unique students
                    </span>
                    <span className="text-slate-300 dark:text-[#1F2430]">·</span>
                    <span className="text-[11px] text-slate-400 dark:text-[#64748B]">
                      Last visited {fmtTime(p.lastVisited)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#0B0E14]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-300"
                    style={{ width: `${Math.max(3, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}

          {pages.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
              {loading ? 'Analyzing page data...' : 'No pageviews tracked yet.'}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
