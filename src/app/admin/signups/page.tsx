'use client';

import { useAdminOverview } from '@/hooks/use-admin-overview';
import { Card, CardTitle, Stat, fmtTime } from '@/components/admin/ui';

export default function AdminSignupsPage() {
  const { data, loading } = useAdminOverview();
  const maxDay = Math.max(1, ...(data?.perDay.map((d) => d.signups) || [1]));
  const signups = data?.signups || [];
  const newUsers = signups.filter((v) => v.loginCount > 0);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-extrabold text-white sm:text-2xl">Signups</h1>
        <p className="text-xs text-neutral-500">
          First-ever login = signup. Determined server-side — the frontend can&apos;t know this.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Total signups" value={data?.totals.signups ?? '—'} />
        <Stat
          label="New today"
          value={data ? (data.perDay.find((d) => d.date === new Date().toISOString().slice(0, 10))?.signups ?? 0) : '—'}
        />
        <Stat label="Total logins" value={data?.totals.logins ?? '—'} sub="all time" />
      </div>

      <Card>
        <CardTitle>Signups per day (last 30 days)</CardTitle>
        {!data || data.perDay.length === 0 ? (
          <p className="mt-2 text-xs text-neutral-500">{loading ? 'Loading...' : 'No data yet.'}</p>
        ) : (
          <div className="mt-3 flex items-end gap-1.5 overflow-x-auto pb-1">
            {data.perDay.map((d) => (
              <div key={d.date} className="flex w-11 shrink-0 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-emerald-500/70"
                  style={{ height: `${Math.max(4, (d.signups / maxDay) * 96)}px` }}
                  title={`${d.date}: ${d.signups} signups`}
                />
                <span className="text-[9px] text-neutral-500">{d.date.slice(5)}</span>
                <span className="text-[10px] font-bold text-neutral-300">{d.signups}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>Newest users ({newUsers.length})</CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-neutral-500">
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Signed up</th>
                <th className="px-2 py-2">Visits</th>
                <th className="px-2 py-2">Logins</th>
                <th className="px-2 py-2">Location</th>
              </tr>
            </thead>
            <tbody>
              {newUsers.slice(0, 100).map((v) => (
                <tr key={v.key} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-2 py-2">
                    <p className="font-semibold text-white">
                      {v.email}
                      {v.isAdmin && (
                        <span className="ml-1.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                          ADMIN
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-neutral-500">{v.name || '—'}</p>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-neutral-400">{fmtTime(v.firstSeen)}</td>
                  <td className="px-2 py-2 font-bold text-white">{v.totalVisits}</td>
                  <td className="px-2 py-2 font-bold text-white">{v.loginCount}</td>
                  <td className="px-2 py-2 text-neutral-400">
                    {[v.city, v.country || v.region].filter(Boolean).join(', ') || '—'}
                  </td>
                </tr>
              ))}
              {newUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-2 py-6 text-center text-neutral-500">
                    {loading ? 'Loading...' : 'No signed-up users yet.'}
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
