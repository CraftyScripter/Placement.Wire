'use client';

import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  Globe2,
  Laptop,
  MapPin,
  MousePointerClick,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { useAdminOverview } from '@/hooks/use-admin-overview';
import { Card, CardTitle, SearchInput, fmtNumber, fmtTime } from '@/components/admin/ui';
import type { Visitor } from '@/lib/analytics/store';

function formatIdentity(v: Visitor): { name: string; isAnon: boolean } {
  if (v.email) return { name: v.email, isAnon: false };
  return { name: `Anonymous (${v.key.slice(5, 11)})`, isAnon: true };
}

function locOf(v: Visitor): string {
  const parts = [v.city, v.country || v.region].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}

export default function AdminVisitorsPage() {
  const { data, loading } = useAdminOverview();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const list = useMemo(() => {
    const all = data?.visitors || [];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (v) =>
        formatIdentity(v).name.toLowerCase().includes(q) ||
        (v.name || '').toLowerCase().includes(q) ||
        (v.city || '').toLowerCase().includes(q) ||
        (v.country || '').toLowerCase().includes(q) ||
        (v.lastIp || '').includes(q)
    );
  }, [data, query]);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Student Directory & Visitor Profiles
            </h1>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary dark:bg-primary/20">
              {list.length} Profiles
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-[#94A3B8]">
            Detailed visitor analytics, activity history, and page journey records. Click any row to view visited pages.
          </p>
        </div>
      </header>

      <Card noPadding>
        {/* Table Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 p-4 dark:border-[#1F2430]">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-[#E2E4ED]">
              All Tracked Visitors
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-[#1F2430] dark:text-[#94A3B8]">
              {list.length} {list.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search email, name, city, IP..."
            className="w-full sm:w-72"
          />
        </div>

        {/* Visitors Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-[#1F2430] dark:bg-[#0F131D] dark:text-[#94A3B8]">
                <th className="px-4 py-3">Student / Identity</th>
                <th className="px-4 py-3">Total Visits</th>
                <th className="px-4 py-3">Sessions</th>
                <th className="px-4 py-3">First Seen</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Last IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1F2430]">
              {list.map((v) => {
                const { name: identityName, isAnon } = formatIdentity(v);
                const pages = Object.entries(v.pages).sort((a, b) => b[1].count - a[1].count);
                const isOpen = open === v.key;

                return (
                  <React.Fragment key={v.key}>
                    <tr
                      className={`cursor-pointer transition-colors duration-150 hover:bg-slate-50/80 dark:hover:bg-[#1A202E]/60 ${
                        isOpen ? 'bg-primary/5 dark:bg-primary/10' : ''
                      }`}
                      onClick={() => setOpen(isOpen ? null : v.key)}
                    >
                      {/* Identity */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                              isOpen ? 'rotate-180 text-primary' : ''
                            }`}
                          />
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                              isAnon
                                ? 'bg-slate-100 text-slate-600 dark:bg-[#1F2430] dark:text-[#94A3B8]'
                                : 'bg-primary/10 text-primary dark:bg-primary/20'
                            }`}
                          >
                            {isAnon ? <User className="h-4 w-4" /> : identityName[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate font-semibold text-slate-800 dark:text-[#E2E4ED]" title={identityName}>
                                {identityName}
                              </p>
                              {v.isAdmin && (
                                <span className="rounded-full bg-amber-500/10 px-1.5 py-0.2 text-[9px] font-black uppercase text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <p className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-[#64748B]">
                              <span>{[v.name, v.device].filter(Boolean).join(' · ') || 'Web Browser'}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Total Visits */}
                      <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {fmtNumber(v.totalVisits)}
                      </td>

                      {/* Sessions */}
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {fmtNumber(v.sessions)}
                      </td>

                      {/* First Seen */}
                      <td className="whitespace-nowrap px-4 py-3 text-[11px] text-slate-500 dark:text-[#94A3B8]">
                        {fmtTime(v.firstSeen)}
                      </td>

                      {/* Last Active */}
                      <td className="whitespace-nowrap px-4 py-3 text-[11px] text-slate-500 dark:text-[#94A3B8]">
                        {fmtTime(v.lastActive)}
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
                    </tr>

                    {/* Expandable row: Visited Pages Breakdown */}
                    {isOpen && (
                      <tr className="border-t border-slate-100 bg-slate-50/50 dark:border-[#1F2430] dark:bg-[#0B0E14]/40">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <MousePointerClick className="h-3.5 w-3.5 text-primary" />
                            <span>Visited Pages History ({pages.length} unique routes)</span>
                          </div>

                          <div className="mt-2.5 flex flex-wrap gap-2">
                            {pages.map(([pathName, stat]) => (
                              <div
                                key={pathName}
                                className="group flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 shadow-sm dark:border-[#1F2430] dark:bg-[#141824]"
                                title={`Last visited: ${fmtTime(stat.lastSeen)}`}
                              >
                                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-[#E2E4ED]">
                                  {pathName}
                                </span>
                                <span className="rounded-md bg-primary/10 px-1.5 py-0.2 font-mono text-[10px] font-bold text-primary dark:bg-primary/20">
                                  ×{stat.count}
                                </span>
                              </div>
                            ))}
                            {pages.length === 0 && (
                              <p className="text-xs text-slate-400 dark:text-slate-500">
                                No page view details recorded.
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {list.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                    {loading ? 'Fetching visitors...' : 'No visitors matched your search query.'}
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
