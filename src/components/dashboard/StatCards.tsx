'use client';

import React, { useMemo } from 'react';
import { PlacementDrive } from '@/schemas/placement.schema';
import { resolveDeadlineMs } from '@/lib/utils/deadline';

interface StatCardsProps {
  drives: PlacementDrive[];
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export const StatCards: React.FC<StatCardsProps> = React.memo(({ drives }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = monthKey(now);
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = monthKey(last);

    let thisMonthCount = 0;
    let lastMonthCount = 0;
    let active = 0;
    let applied = 0;
    let interviews = 0;
    let expiring = 0;
    let starred = 0;

    for (const d of drives) {
      const created = new Date(d.received_at || d.created_at);
      if (!isNaN(created.getTime())) {
        const k = monthKey(created);
        if (k === thisMonth) thisMonthCount++;
        else if (k === lastMonth) lastMonthCount++;
      }

      const deadlineMs = resolveDeadlineMs(d.deadline, d.deadline_precision);
      const isExpired = deadlineMs !== null && deadlineMs < Date.now();
      const isTerminal = d.status === 'ARCHIVED' || d.status === 'REJECTED';

      if (!isExpired && !isTerminal) active++;
      if (d.status === 'APPLIED') applied++;
      if (d.status === 'INTERVIEW_SCHEDULED') interviews++;
      if (d.starred) starred++;

      if (deadlineMs !== null) {
        const diffHours = (deadlineMs - Date.now()) / (1000 * 60 * 60);
        if (diffHours > 0 && diffHours <= 48) expiring++;
      }
    }

    const monthDiff = thisMonthCount - lastMonthCount;
    const monthText =
      monthDiff > 0
        ? `↑ ${monthDiff} vs last month`
        : monthDiff < 0
        ? `↓ ${-monthDiff} vs last month`
        : 'Same as last month';

    return [
      {
        key: 'total',
        label: 'Total Drives',
        value: drives.length,
        sub: monthText,
        badge: 'bg-violet-500/15 text-violet-300',
      },
      {
        key: 'active',
        label: 'Active Applications',
        value: active,
        sub: `${applied} applied · ${interviews} interviews`,
        badge: 'bg-sky-500/15 text-sky-300',
      },
      {
        key: 'expiring',
        label: 'Expiring Soon',
        value: expiring,
        sub: expiring > 0 ? 'Action needed' : 'All clear',
        badge: 'bg-orange-500/15 text-orange-300',
      },
      {
        key: 'starred',
        label: 'Starred',
        value: starred,
        sub: 'Saved for later',
        badge: 'bg-yellow-500/15 text-yellow-300',
      },
    ];
  }, [drives]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.key}
          className="rounded-2xl border border-white/5 bg-ink-card p-4 sm:p-5"
        >
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.badge}`}
          >
            {s.label}
          </span>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-white">
            {s.value}
          </div>
          <p className="mt-1 text-xs text-neutral-500">{s.sub}</p>
        </div>
      ))}
    </div>
  );
});
