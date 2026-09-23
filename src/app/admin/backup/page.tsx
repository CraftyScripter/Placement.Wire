'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CloudUpload,
  Database,
  Download,
  FileSpreadsheet,
  HardDrive,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useAdminOverview } from '@/hooks/use-admin-overview';
import { Card, CardTitle, Stat, fmtBytes, fmtNumber, fmtTime } from '@/components/admin/ui';

export default function AdminBackupPage() {
  const { data } = useAdminOverview();
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState<string | null>(null);
  const [tokenState, setTokenState] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [tokenInfo, setTokenInfo] = useState<{
    tokenConfigured: boolean;
    hasRefreshToken: boolean;
    refreshToken: string | null;
    hint: string;
  } | null>(null);

  const storage = data?.storage;

  const backupToDrive = async () => {
    setState('working');
    setMsg(null);
    try {
      const res = await fetch('/api/v1/admin/backup', { method: 'POST' });
      const json = await res.json();
      if (res.ok && json.success) {
        setState('done');
        setMsg(`Successfully backed up to your Google Drive as "${json.fileName || 'admin_analytics.json'}".`);
      } else {
        setState('error');
        setMsg(json.message || 'Backup process failed.');
      }
    } catch {
      setState('error');
      setMsg('Backup process failed due to a network error.');
    }
  };

  const fetchToken = async () => {
    setTokenState('working');
    try {
      const res = await fetch('/api/v1/admin/drive-token', { cache: 'no-store' });
      const json = await res.json();
      if (res.ok && json.success) {
        setTokenState('done');
        setTokenInfo({
          tokenConfigured: json.tokenConfigured,
          hasRefreshToken: json.hasRefreshToken,
          refreshToken: json.refreshToken,
          hint: json.hint,
        });
      } else {
        setTokenState('error');
      }
    } catch {
      setTokenState('error');
    }
  };

  const exportCsv = () => {
    if (!data) return;
    const head =
      'key,email,name,first_seen,last_active,visits,sessions,session_secs,logins,last_login,ip,location,device,referrer,is_admin,top_pages';
    const lines = data.visitors.map((v) => {
      const pages = Object.entries(v.pages)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([p, s]) => `${p}:${s.count}`)
        .join(' | ');
      const q = (s: string | null | undefined) => `"${(s || '').replace(/"/g, '""')}"`;
      return [
        v.key,
        v.email || '',
        q(v.name),
        v.firstSeen,
        v.lastActive,
        v.totalVisits,
        v.sessions,
        v.sessionSecs,
        v.loginCount,
        v.lastLogin || '',
        v.lastIp || '',
        q([v.city, v.country || v.region].filter(Boolean).join(', ')),
        q(v.device),
        v.referrer || '',
        v.isAdmin ? 'yes' : 'no',
        q(pages),
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
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Analytics Storage & Cloud Backup
            </h1>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary dark:bg-primary/20">
              System
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-[#94A3B8]">
            Local disk persistence status, one-click Google Drive sync, and CSV data export.
          </p>
        </div>
      </header>

      {/* Storage Backend Status Banner */}
      {storage && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 text-xs leading-relaxed shadow-sm transition-all ${
            storage.mode === 'disk'
              ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300'
              : storage.mode === 'drive'
              ? 'border-primary/20 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/20 dark:text-primary'
              : 'border-rose-200 bg-rose-50/70 text-rose-800 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-300'
          }`}
        >
          {storage.mode === 'none' ? (
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          )}
          <div>
            <p className="font-bold text-sm">
              {storage.mode === 'disk' && 'Storage Status: Local Disk Active (Logging Operational)'}
              {storage.mode === 'drive' && 'Storage Status: Google Drive Cloud Active (Serverless Mode)'}
              {storage.mode === 'none' && 'Storage Warning: No Writable Storage Found'}
            </p>
            <p className="mt-1 text-xs opacity-90">{storage.detail}</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Database Size"
          value={data ? fmtBytes(data.fileBytes) : '—'}
          sub={storage?.mode === 'drive' ? 'In Google Drive' : 'Local JSON file'}
          icon={HardDrive}
        />
        <Stat
          label="Visitor Records"
          value={fmtNumber(data?.totals.visitors)}
          sub="Individual profiles"
          icon={Database}
        />
        <Stat
          label="Last Synchronized"
          value={data ? fmtTime(data.updatedAt) : '—'}
          sub="Server timestamp"
          icon={CheckCircle2}
        />
        <Stat
          label="Retention Policy"
          value="30d / 90d"
          sub="30d daily, 90d prune"
          icon={ShieldCheck}
        />
      </div>

      {msg && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-4 text-xs font-semibold shadow-sm ${
            state === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/40 dark:text-rose-400'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-400'
          }`}
        >
          {state === 'error' ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
          <span>{msg}</span>
        </div>
      )}

      {/* Export & Drive Actions Card */}
      <Card>
        <CardTitle
          icon={CloudUpload}
          subtitle="Sync database to cloud or download offline report"
        >
          Backup & Data Export
        </CardTitle>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={backupToDrive}
            disabled={state === 'working'}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-50"
          >
            <CloudUpload className="h-4 w-4" />
            {state === 'working' ? 'Uploading to Drive...' : 'Backup to Google Drive'}
          </button>

          <button
            type="button"
            onClick={exportCsv}
            disabled={!data}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:opacity-50 dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#E2E4ED] dark:hover:bg-[#1A202E]"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export Visitors CSV</span>
          </button>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-[#94A3B8]">
          Backups are saved to <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">PlacementWire_Data/admin_analytics.json</span> inside your connected Google Drive account. Storage usage remains ultra-compact because metrics are grouped by visitor rather than storing raw clickstreams.
        </p>
      </Card>

      {/* Serverless Setup Card */}
      <Card>
        <CardTitle
          icon={KeyRound}
          subtitle="For deployment on serverless read-only platforms (Vercel, Cloud Run)"
        >
          Serverless Drive Authorization
        </CardTitle>

        <div className="mt-3 space-y-3 text-xs text-slate-500 dark:text-[#94A3B8]">
          <p className="leading-relaxed">
            On read-only hosting environments like Vercel, the server cannot write to local disk. In this scenario, analytics events are written directly to your Google Drive using a refresh token.
          </p>

          <ol className="list-decimal space-y-1.5 pl-5">
            <li>Ensure you are signed in with the primary administrator Google account.</li>
            <li>Click &quot;Reveal Session Refresh Token&quot; below.</li>
            <li>Copy the token into your hosting provider&apos;s environment variables as <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-800 dark:bg-[#1F2430] dark:text-slate-200">ADMIN_DRIVE_REFRESH_TOKEN</code> and redeploy.</li>
          </ol>

          <div className="pt-2">
            <button
              type="button"
              onClick={fetchToken}
              disabled={tokenState === 'working'}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:opacity-50 dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#E2E4ED] dark:hover:bg-[#1A202E]"
            >
              <KeyRound className="h-4 w-4" />
              {tokenState === 'working' ? 'Reading session credentials...' : 'Reveal Session Refresh Token'}
            </button>
          </div>

          {tokenState === 'done' && tokenInfo && (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 dark:border-[#1F2430] dark:bg-[#0B0E14]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Environment Configuration Status:
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    tokenInfo.tokenConfigured
                      ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                  }`}
                >
                  {tokenInfo.tokenConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}
                </span>
              </div>

              {tokenInfo.refreshToken ? (
                <div className="mt-3">
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Refresh Token:
                  </p>
                  <pre className="mt-1 max-w-full overflow-x-auto rounded-lg bg-white p-2.5 font-mono text-[11px] text-emerald-600 dark:bg-[#141824] dark:text-emerald-400 border border-slate-200 dark:border-[#1F2430]">
                    {tokenInfo.refreshToken}
                  </pre>
                </div>
              ) : (
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  {tokenInfo.hint}
                </p>
              )}
            </div>
          )}

          {tokenState === 'error' && (
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Unable to read session credentials from the server.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
