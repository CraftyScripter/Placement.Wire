'use client';

import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAdminOverview } from '@/hooks/use-admin-overview';
import { Card, CardTitle, fmtTime } from '@/components/admin/ui';
import type { Visitor } from '@/lib/analytics/store';

function who(v: Visitor): string {
  return v.email || `anonymous · ${v.key.slice(5, 11)}`;
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
        who(v).toLowerCase().includes(q) ||
        (v.name || '').toLowerCase().includes(q) ||
        (v.city || '').toLowerCase().includes(q) ||
        (v.country || '').toLowerCase().includes(q) ||
        (v.lastIp || '').includes(q)
    );
  }, [data, query]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-extrabold text-white sm:text-2xl">Visitors</h1>
        <p className="text-xs text-neutral-500">
          Grouped — one row per visitor no matter how many pages they open. Expand a row for the
          per-page breakdown.
        </p>
      </header>

      <Card>
        <CardTitle
          right={
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search email, city, IP..."
              className="w-full max-w-xs rounded-xl border border-white/10 bg-ink px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:border-amber-500/50 focus:outline-none"
            />
          }
        >
          All visitors ({list.length})
        </CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-neutral-500">
                <th className="px-2 py-2">Who</th>
                <th className="px-2 py-2">Visits</th>
                <th className="px-2 py-2">Sessions</th>
                <th className="px-2 py-2">First seen</th>
                <th className="px-2 py-2">Last active</th>
                <th className="px-2 py-2">Location</th>
                <th className="px-2 py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {list.map((v) => {
                const pages = Object.entries(v.pages).sort((a, b) => b[1].count - a[1].count);
                const isOpen = open === v.key;
                return (
                  <React.Fragment key={v.key}>
                    <tr
                      className="cursor-pointer border-t border-white/5 hover:bg-white/[0.02]"
                      onClick={() => setOpen(isOpen ? null : v.key)}
                    >
                      <td className="px-2 py-2">
                        <p className="flex items-center gap-1 font-semibold text-white">
                          <ChevronDown
                            className={`h-3.5 w-3.5 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          />
                          {who(v)}
                          {v.isAdmin && (
                            <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                              ADMIN
                            </span>
                          )}
                        </p>
                        <p className="pl-5 text-[11px] text-neutral-500">
                          {[v.name, v.device].filter(Boolean).join(' · ')}
                        </p>
                      </td>
                      <td className="px-2 py-2 font-bold text-white">{v.totalVisits}</td>
                      <td className="px-2 py-2 text-neutral-300">{v.sessions}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-neutral-400">{fmtTime(v.firstSeen)}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-neutral-400">{fmtTime(v.lastActive)}</td>
                      <td className="px-2 py-2 text-neutral-400">{locOf(v)}</td>
                      <td className="px-2 py-2 font-mono text-[11px] text-neutral-500">{v.lastIp || '—'}</td>
                    </tr>
                    {isOpen && (
                      <tr className="border-t border-white/5 bg-white/[0.015]">
                        <td colSpan={7} className="px-2 py-2 pl-8">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                            Pages visited ({pages.length})
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {pages.map(([p, s]) => (
                              <span
                                key={p}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1 font-mono text-[11px] text-neutral-300"
                                title={`Last opened ${fmtTime(s.lastSeen)}`}
                              >
                                {p}
                                <span className="font-bold text-amber-300">×{s.count}</span>
                              </span>
                            ))}
                            {pages.length === 0 && <span className="text-[11px] text-neutral-600">No pageviews.</span>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-center text-neutral-500">
                    {loading ? 'Loading...' : 'No visitors match.'}
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
