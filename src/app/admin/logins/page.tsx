'use client';

import { useAdminOverview } from '@/hooks/use-admin-overview';
import { Card, CardTitle, Stat, fmtTime } from '@/components/admin/ui';

export default function AdminLoginsPage() {
  const { data, loading } = useAdminOverview();
  const maxDay = Math.max(1, ...(data?.perDay.map((d) => d.logins) || [1]));
  const byLogin = [...(data?.visitors || [])]
    .filter((v) => v.loginCount > 0)
    .sort((a, b) => ((a.lastLogin || '') < (b.lastLogin || '') ? 1 : -1));

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-extrabold text-white sm:text-2xl">Logins</h1>
        <p className="text-xs text-neutral-500">Who logs in, how often, and when they last did.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Total logins" value={data?.totals.logins ?? '—'} />
        <Stat label="Logged-in users" value={byLogin.length} sub="unique emails" />
        <Stat
          label="Logins today"
          value={data ? (data.perDay.find((d) => d.date === new Date().toISOString().slice(0, 10))?.logins ?? 0) : '—'}
        />
      </div>

      <Card>
        <CardTitle>Logins per day (last 30 days)</CardTitle>
        {!data || data.perDay.length === 0 ? (
          <p className="mt-2 text-xs text-neutral-500">{loading ? 'Loading...' : 'No data yet.'}</p>
        ) : (
          <div className="mt-3 flex items-end gap-1.5 overflow-x-auto pb-1">
            {data.perDay.map((d) => (
              <div key={d.date} className="flex w-11 shrink-0 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-sky-500/70"
                  style={{ height: `${Math.max(4, (d.logins / maxDay) * 96)}px` }}
                  title={`${d.date}: ${d.logins} logins`}
                />
                <span className="text-[9px] text-neutral-500">{d.date.slice(5)}</span>
                <span className="text-[10px] font-bold text-neutral-300">{d.logins}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>Login activity ({byLogin.length})</CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-neutral-500">
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Last login</th>
                <th className="px-2 py-2">Logins</th>
                <th className="px-2 py-2">Visits</th>
                <th className="px-2 py-2">Device</th>
              </tr>
            </thead>
            <tbody>
              {byLogin.slice(0, 200).map((v) => (
                <tr key={v.key} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-2 py-2 font-semibold text-white">{v.email}</td>
                  <td className="whitespace-nowrap px-2 py-2 text-neutral-400">{fmtTime(v.lastLogin)}</td>
                  <td className="px-2 py-2 font-bold text-white">{v.loginCount}</td>
                  <td className="px-2 py-2 text-neutral-300">{v.totalVisits}</td>
                  <td className="px-2 py-2 text-neutral-400">{v.device}</td>
                </tr>
              ))}
              {byLogin.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-2 py-6 text-center text-neutral-500">
                    {loading ? 'Loading...' : 'No logins yet.'}
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
