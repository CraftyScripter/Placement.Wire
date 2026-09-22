'use client';

import React, { useState } from 'react';
import { CloudUpload, Download } from 'lucide-react';
import { useAdminOverview } from '@/hooks/use-admin-overview';
import { Card, CardTitle, Stat, fmtBytes, fmtTime } from '@/components/admin/ui';

export default function AdminBackupPage() {
  const { data } = useAdminOverview();
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState<string | null>(null);

  const backupToDrive = async () => {
    setState('working');
    setMsg(null);
    try {
      const res = await fetch('/api/v1/admin/backup', { method: 'POST' });
      const json = await res.json();
      if (res.ok && json.success) {
        setState('done');
        setMsg(`Saved to your Drive as ${json.fileName}.`);
      } else {
        setState('error');
        setMsg(json.message || 'Backup failed.');
      }
    } catch {
      setState('error');
      setMsg('Backup failed — network error.');
    }
  };

  const exportCsv = () => {
    if (!data) return;
    const head = 'key,email,name,first_seen,last_active,visits,sessions,session_secs,logins,last_login,ip,location,device,referrer,is_admin,top_pages';
    const lines = data.visitors.map((v) => {
      const pages = Object.entries(v.pages)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([p, s]) => `${p}:${s.count}`)
        .join(' | ');
      const q = (s: string | null | undefined) => `"${(s || '').replace(/"/g, '""')}"`;
      return [
        v.key, v.email || '', q(v.name), v.firstSeen, v.lastActive,
        v.totalVisits, v.sessions, v.sessionSecs, v.loginCount, v.lastLogin || '',
        v.lastIp || '', q([v.city, v.country || v.region].filter(Boolean).join(', ')),
        q(v.device), v.referrer || '', v.isAdmin ? 'yes' : 'no', q(pages),
      ].join(',');
    });
    const blob = new Blob([[head, ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placementwire-visitors-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-extrabold text-white sm:text-2xl">Backup</h1>
        <p className="text-xs text-neutral-500">
          Local log file + compact copy in your own Google Drive. No MongoDB anywhere.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Log file size" value={data ? fmtBytes(data.fileBytes) : '—'} sub="data/analytics.json" />
        <Stat label="Visitor rows" value={data?.totals.visitors ?? '—'} sub="grouped, not raw events" />
        <Stat label="Last updated" value={data ? fmtTime(data.updatedAt) : '—'} sub="server time" />
        <Stat label="Retention" value="30d / 90d" sub="daily rollups / stale anon prune" />
      </div>

      {msg && (
        <p
          className={`rounded-xl border px-4 py-2.5 text-xs ${
            state === 'error'
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          }`}
        >
          {msg}
        </p>
      )}

      <Card>
        <CardTitle>Storage & export</CardTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={backupToDrive}
            disabled={state === 'working'}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-50"
          >
            <CloudUpload className="h-4 w-4" />
            {state === 'working' ? 'Saving...' : 'Backup to my Drive'}
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!data}
            className="inline-flex items-center gap-1.5 rounded-xl bg-ink-card border border-white/10 px-4 py-2.5 text-xs font-semibold text-neutral-200 hover:text-white disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export visitors CSV
          </button>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
          Backup writes a minified copy to <span className="font-mono">PlacementWire_Data/admin_analytics.json</span> in
          your Drive using your login token. Space stays small because: one row per visitor, short device labels
          instead of full user-agents, query strings stripped from paths, 20-pages-per-visitor cap, 30-day rolling
          daily counters, and 90-day auto-prune of single-visit anonymous rows.
        </p>
      </Card>
    </div>
  );
}
