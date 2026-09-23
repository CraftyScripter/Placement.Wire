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
        badge: 'bg-primary-soft text-primary dark:bg-primary/20 dark:text-[#A5B4FC]',
      },
      {
        key: 'active',
        label: 'Active Applications',
        value: active,
        sub: `${applied} applied · ${interviews} interviews`,
        badge: 'bg-primary-soft text-primary dark:bg-primary/20 dark:text-[#A5B4FC]',
      },
      {
        key: 'expiring',
        label: 'Expiring Soon',
        value: expiring,
        sub: expiring > 0 ? 'Action needed' : 'All clear',
        badge: 'bg-accent-soft text-[#9A6B0F] dark:bg-accent/20 dark:text-[#FCD34D]',
      },
      {
        key: 'starred',
        label: 'Starred',
        value: starred,
        sub: 'Saved for later',
        badge: 'bg-accent-soft text-[#9A6B0F] dark:bg-accent/20 dark:text-[#FCD34D]',
      },
    ];
  }, [drives]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.key}
          className="card-base min-w-0 p-3.5 sm:p-4"
        >
          <span
            className={`overline-tag inline-block max-w-full truncate rounded-full px-2.5 py-1 text-[11px] ${s.badge}`}
          >
            {s.label}
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-[#323243] tabular-nums dark:text-[#E2E4ED]">
            {s.value}
          </div>
          <p className="mt-0.5 truncate text-xs font-normal text-muted dark:text-[#94A3B8]" title={s.sub}>{s.sub}</p>
        </div>
      ))}
    </div>
  );
});
