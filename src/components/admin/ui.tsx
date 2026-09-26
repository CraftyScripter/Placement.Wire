import React from 'react';
import { LucideIcon, Search, X } from 'lucide-react';

export function fmtNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}

export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return iso;
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

export function fmtDur(totalSecs: number): string {
  if (!totalSecs || totalSecs < 0) return '—';
  const m = Math.floor(totalSecs / 60);
  const s = Math.round(totalSecs % 60);
  if (m === 0) return `${s}s`;
  if (m < 60) return `${m}m ${s > 0 ? `${s}s` : ''}`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export function fmtBytes(bytes: number): string {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function Card({
  children,
  className = '',
  noPadding = false,
}: {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200/80 bg-white shadow-sm transition-all dark:border-[#1F2430] dark:bg-[#141824] dark:shadow-none ${
        noPadding ? '' : 'p-4 sm:p-5'
      } ${className}`}
    >
      {children}
    </section>
  );
}

export function CardTitle({
  children,
  subtitle,
  right,
  icon: Icon,
}: {
  children: React.ReactNode;
  subtitle?: string;
  right?: React.ReactNode;
  icon?: LucideIcon | React.ElementType;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-[#E2E4ED] sm:text-base">
            {children}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-[#94A3B8]">{subtitle}</p>
          )}
        </div>
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  icon: Icon,
  badge,
  trend,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: LucideIcon | React.ElementType;
  badge?: string;
  trend?: string;
}) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[#1F2430] dark:bg-[#141824] dark:shadow-none dark:hover:border-[#2E364B]">
      {/* Top row: Label + Icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">
          {label}
        </span>
        {Icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-primary/10 group-hover:text-primary dark:bg-[#1F2430] dark:text-[#94A3B8] dark:group-hover:bg-primary/20 dark:group-hover:text-primary">
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      {/* Main value */}
      <div className="mt-2.5 flex items-baseline gap-2">
        <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-[#F3F4F6] sm:text-3xl">
          {value}
        </p>
        {trend && (
          <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            {trend}
          </span>
        )}
        {badge && (
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary dark:bg-primary/20">
            {badge}
          </span>
        )}
      </div>

      {/* Subtitle / note */}
      {sub && (
        <p className="mt-1 text-[11px] font-medium text-slate-400 dark:text-[#7D889E]">
          {sub}
        </p>
      )}
    </div>
  );
}

/** Horizontal bar list: [{label, value}] auto-scaled with clean visuals */
export function BarList({
  items,
  max,
  barColor = 'bg-primary',
}: {
  items: { label: string; value: number }[];
  max?: number;
  barColor?: string;
}) {
  const top = max ?? Math.max(1, ...items.map((i) => i.value));
  const total = items.reduce((sum, i) => sum + i.value, 0);

  if (items.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">No data collected yet</p>
      </div>
    );
  }

  return (
    <div className="mt-3.5 space-y-2.5">
      {items.map((i) => {
        const pct = top > 0 ? Math.round((i.value / top) * 100) : 0;
        const sharePct = total > 0 ? Math.round((i.value / total) * 100) : 0;
        return (
          <div key={i.label} className="group flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span
                className="max-w-[70%] truncate font-medium text-slate-700 transition-colors group-hover:text-primary dark:text-[#C7CDD9] dark:group-hover:text-primary"
                title={i.label}
              >
                {i.label}
              </span>
              <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                <span className="font-bold text-slate-900 dark:text-white">
                  {fmtNumber(i.value)}
                </span>
                {total > 0 && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    ({sharePct}%)
                  </span>
                )}
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#0B0E14]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${Math.max(3, pct)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EventBadge({ event }: { event: string }) {
  let cls =
    'border-slate-200 bg-slate-100 text-slate-600 dark:border-[#2D3548] dark:bg-[#1A202E] dark:text-[#94A3B8]';

  if (event === 'signup' || event === 'register') {
    cls =
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-400';
  } else if (event === 'login') {
    cls =
      'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/40 dark:bg-indigo-950/40 dark:text-indigo-400';
  } else if (event === 'admin') {
    cls =
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-400';
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`}
    >
      {event}
    </span>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200/90 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-[#1F2430] dark:bg-[#0B0E14] dark:text-[#E2E4ED] dark:placeholder:text-[#64748B]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Clear search"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
