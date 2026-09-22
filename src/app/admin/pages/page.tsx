'use client';

import { useAdminOverview } from '@/hooks/use-admin-overview';
import { Card, CardTitle, fmtTime } from '@/components/admin/ui';

export default function AdminPagesPage() {
  const { data, loading } = useAdminOverview();
  const pages = data?.topPages || [];
  const maxViews = Math.max(1, ...pages.map((p) => p.views));

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-extrabold text-white sm:text-2xl">Pages</h1>
        <p className="text-xs text-neutral-500">
          Which pages get opened, by how many unique visitors. Query strings are stripped
          (they can carry tokens and would explode key counts).
        </p>
      </header>

      <Card>
        <CardTitle>Page ranking ({pages.length} paths)</CardTitle>
        <div className="mt-3 space-y-2.5">
          {pages.map((p) => (
            <div key={p.path} className="text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-mono text-[12px] font-semibold text-white" title={p.path}>
                  {p.path}
                </span>
                <span className="shrink-0 text-neutral-400">
                  <span className="font-bold text-amber-300">{p.views}</span> views ·{' '}
                  <span className="font-bold text-white">{p.visitors}</span> visitors · last {fmtTime(p.lastVisited)}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-amber-500/70"
                  style={{ width: `${Math.max(2, (p.views / maxViews) * 100)}%` }}
                />
              </div>
            </div>
          ))}
          {pages.length === 0 && (
            <p className="py-6 text-center text-xs text-neutral-500">
              {loading ? 'Loading...' : 'No pageviews yet.'}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
