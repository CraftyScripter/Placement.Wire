'use client';

import { useAdminOverview } from '@/hooks/use-admin-overview';
import { BarList, Card, CardTitle } from '@/components/admin/ui';

export default function AdminInsightsPage() {
  const { data } = useAdminOverview();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-extrabold text-white sm:text-2xl">Insights</h1>
        <p className="text-xs text-neutral-500">
          Where visitors come from, what devices they use, and which sites send them.
          Counted once per visitor (first seen) to stay compact.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2 3xl:grid-cols-3">
        <Card>
          <CardTitle>Top locations</CardTitle>
          <BarList items={(data?.topLocations || []).map((l) => ({ label: l.label, value: l.visitors }))} />
        </Card>
        <Card>
          <CardTitle>Devices & browsers</CardTitle>
          <BarList items={(data?.topDevices || []).map((d) => ({ label: d.label, value: d.visitors }))} />
        </Card>
        <Card className="lg:col-span-2 3xl:col-span-1">
          <CardTitle>Referrers (which site sent them)</CardTitle>
          <BarList items={(data?.topReferrers || []).map((r) => ({ label: r.label, value: r.visitors }))} />
          {(!data || (data.topReferrers || []).length === 0) && (
            <p className="mt-1 text-[11px] text-neutral-600">
              Most visits are direct (no referrer) — normal for a site opened from bookmarks or Gmail links.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
