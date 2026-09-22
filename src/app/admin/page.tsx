'use client';

import { RefreshCw } from 'lucide-react';
import { useAdminOverview } from '@/hooks/use-admin-overview';
import { BarList, Card, CardTitle, Stat, fmtDur } from '@/components/admin/ui';

export default function AdminOverviewPage() {
  const { data, loading, refresh } = useAdminOverview();
  const t = data?.totals;
  const maxDay = Math.max(1, ...(data?.perDay.map((d) => d.visits) || [1]));
  const maxHour = Math.max(1, ...(data?.hourly || [1]));

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-white sm:text-2xl">Overview</h1>
          <p className="text-xs text-neutral-500">
            Grouped counters — one row per visitor, zero raw event rows. No MongoDB.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl bg-ink-card px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 3xl:grid-cols-8">
        <Stat label="Visitors (grouped)" value={t?.visitors ?? '—'} />
        <Stat label="Total visits" value={t?.visits ?? '—'} />
        <Stat label="Logins" value={t?.logins ?? '—'} />
        <Stat label="Signups" value={t?.signups ?? '—'} />
        <Stat label="Online now" value={t?.onlineNow ?? '—'} sub="active in last 5 min" />
        <Stat label="Active today / 7d" value={t ? `${t.dau} / ${t.wau}` : '—'} sub={`30d: ${t?.mau ?? '—'}`} />
        <Stat label="Avg session" value={t ? fmtDur(t.avgSessionSecs) : '—'} sub={`${t?.sessions ?? 0} sessions`} />
        <Stat label="Single-visit" value={t?.bounced ?? '—'} sub="bounce-ish" />
      </div>

      <Card>
        <CardTitle>Visits per day (last 30 days)</CardTitle>
        {!data || data.perDay.length === 0 ? (
          <p className="mt-2 text-xs text-neutral-500">{loading ? 'Loading...' : 'No data yet.'}</p>
        ) : (
          <div className="mt-3 flex items-end gap-1.5 overflow-x-auto pb-1">
            {data.perDay.map((d) => (
              <div key={d.date} className="flex w-11 shrink-0 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-amber-500/70"
                  style={{ height: `${Math.max(4, (d.visits / maxDay) * 96)}px` }}
                  title={`${d.date}: ${d.visits} visits, ${d.logins} logins, ${d.signups} signups, ${d.visitors} visitors`}
                />
                <span className="text-[9px] text-neutral-500">{d.date.slice(5)}</span>
                <span className="text-[10px] font-bold text-neutral-300">{d.visits}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
        <Card>
          <CardTitle>When do students open the site? (hour of day)</CardTitle>
          {!data ? (
            <p className="mt-2 text-xs text-neutral-500">Loading...</p>
          ) : (
            <div className="mt-3 flex items-end gap-[3px]">
              {(data.hourly || []).map((v, h) => (
                <div key={h} className="flex min-w-0 flex-1 flex-col items-center gap-1" title={`${h}:00 — ${v} visits`}>
                  <div
                    className="w-full rounded-t bg-sky-500/60"
                    style={{ height: `${Math.max(3, (v / maxHour) * 80)}px` }}
                  />
                  {h % 3 === 0 && <span className="text-[8px] text-neutral-600">{h}</span>}
                </div>
              ))}
            </div>
          )}
        </Card>
        </div>
        <div className="xl:col-span-2">
        <Card className="h-full">
          <CardTitle right={<a href="/admin/pages" className="text-[11px] font-semibold text-amber-300 hover:text-amber-200">All pages →</a>}>
            Top pages
          </CardTitle>
          <BarList items={(data?.topPages || []).slice(0, 8).map((p) => ({ label: `${p.path} (${p.visitors})`, value: p.views }))} />
        </Card>
        </div>
      </div>
    </div>
  );
}
