import React from 'react';

export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function fmtDur(totalSecs: number): string {
  if (!totalSecs || totalSecs < 0) return '—';
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  if (m === 0) return `${s}s`;
  if (m < 60) return `${m}m ${s}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export function fmtBytes(bytes: number): string {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl bg-ink-card p-4 ${className}`}>{children}</section>;
}

export function CardTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-sm font-bold text-white">{children}</h2>
      {right}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-2xl bg-ink-card p-4">
      <p className="text-2xl font-extrabold text-white">{value}</p>
      <p className="text-[11px] font-medium text-neutral-500">{label}</p>
      {sub && <p className="mt-0.5 text-[10px] text-neutral-600">{sub}</p>}
    </div>
  );
}

/** Horizontal bar list: [{label, value}] auto-scaled. */
export function BarList({ items, max }: { items: { label: string; value: number }[]; max?: number }) {
  const top = max ?? Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0) return <p className="mt-2 text-xs text-neutral-500">No data yet.</p>;
  return (
    <div className="mt-3 space-y-2">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-2 text-xs">
          <span className="w-40 shrink-0 truncate text-neutral-400 xl:w-52" title={i.label}>
            {i.label}
          </span>
          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-amber-500/70"
              style={{ width: `${Math.max(2, (i.value / top) * 100)}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right font-bold text-white">{i.value}</span>
        </div>
      ))}
    </div>
  );
}

export function EventBadge({ event }: { event: string }) {
  const cls =
    event === 'signup'
      ? 'bg-emerald-500/15 text-emerald-300'
      : event === 'login'
        ? 'bg-sky-500/15 text-sky-300'
        : 'bg-white/5 text-neutral-400';
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cls}`}>{event}</span>
  );
}
