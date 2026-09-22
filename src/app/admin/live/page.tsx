'use client';

import { useAdminOverview } from '@/hooks/use-admin-overview';
import { Card, CardTitle, fmtTime } from '@/components/admin/ui';
import type { Visitor } from '@/lib/analytics/store';

function locOf(v: Visitor): string {
  const parts = [v.city, v.country || v.region].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}

function Row({ v, live }: { v: Visitor; live: boolean }) {
  return (
    <tr className="border-t border-white/5 hover:bg-white/[0.02]">
      <td className="px-2 py-2">
        <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-400" />
        <span className="font-semibold text-white">{v.email || `anonymous · ${v.key.slice(5, 11)}`}</span>
        {v.isAdmin && (
          <span className="ml-1.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
            ADMIN
          </span>
        )}
        <p className="pl-3.5 text-[11px] text-neutral-500">{v.name || v.device}</p>
      </td>
      <td className="max-w-[140px] truncate px-2 py-2 font-mono text-[11px] text-neutral-400">
        {v.lastPath || '—'}
      </td>
      <td className="px-2 py-2 text-neutral-400">{locOf(v)}</td>
      <td className="px-2 py-2 font-mono text-[11px] text-neutral-500">{v.lastIp || '—'}</td>
      <td className="whitespace-nowrap px-2 py-2 text-neutral-400">
        {live ? 'now' : fmtTime(v.lastActive)}
      </td>
    </tr>
  );
}

export default function AdminLivePage() {
  const { data, loading } = useAdminOverview();
  const liveKeys = new Set((data?.liveNow || []).map((v) => v.key));
  const recent = (data?.visitors || []).filter((v) => !liveKeys.has(v.key)).slice(0, 30);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-extrabold text-white sm:text-2xl">Live Now</h1>
        <p className="text-xs text-neutral-500">
          Visitors active in the last 5 minutes (tab-open heartbeat). Sessions are stateless JWTs,
          so this is presence — not a session list.
        </p>
      </header>

      <Card>
        <CardTitle>Online now ({data?.liveNow.length ?? (loading ? '…' : 0)})</CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-neutral-500">
                <th className="px-2 py-2">Who</th>
                <th className="px-2 py-2">On page</th>
                <th className="px-2 py-2">Location</th>
                <th className="px-2 py-2">IP</th>
                <th className="px-2 py-2">Active</th>
              </tr>
            </thead>
            <tbody>
              {(data?.liveNow || []).map((v) => (
                <Row key={v.key} v={v} live />
              ))}
              {(data?.liveNow || []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-2 py-6 text-center text-neutral-500">
                    {loading ? 'Loading...' : 'Nobody online right now.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardTitle>Recently active</CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <tbody>
              {recent.map((v) => (
                <Row key={v.key} v={v} live={false} />
              ))}
              {recent.length === 0 && (
                <tr>
                  <td className="px-2 py-6 text-center text-neutral-500">
                    {loading ? 'Loading...' : 'No recent visitors.'}
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
