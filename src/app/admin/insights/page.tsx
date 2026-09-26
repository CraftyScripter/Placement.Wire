'use client';

import React from 'react';
import {
  Compass,
  Globe2,
  Laptop,
  MapPin,
  Share2,
  Smartphone,
  TrendingUp,
} from 'lucide-react';
import { useAdminOverview } from '@/hooks/use-admin-overview';
import { BarList, Card, CardTitle, Stat, fmtNumber } from '@/components/admin/ui';

export default function AdminInsightsPage() {
  const { data, loading } = useAdminOverview();

  const totalVisitors = data?.totals.visitors ?? 0;
  const topLocations = data?.topLocations || [];
  const topDevices = data?.topDevices || [];
  const topReferrers = data?.topReferrers || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Audience Insights & Demographics
            </h1>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary dark:bg-primary/20">
              {totalVisitors} Unique Students
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-[#94A3B8]">
            Geographic distribution, device environments, and incoming referral channels.
          </p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label="Top Geographic Region"
          value={topLocations[0]?.label || '—'}
          sub={topLocations[0] ? `${fmtNumber(topLocations[0].visitors)} students` : 'Collecting data'}
          icon={MapPin}
        />
        <Stat
          label="Dominant Device Platform"
          value={topDevices[0]?.label || '—'}
          sub={topDevices[0] ? `${fmtNumber(topDevices[0].visitors)} students` : 'Collecting data'}
          icon={Laptop}
        />
        <Stat
          label="Primary Traffic Source"
          value={topReferrers[0]?.label || 'Direct Navigation'}
          sub="Bookmarks / Direct Link"
          icon={Share2}
        />
      </div>

      {/* Insights Cards Grid */}
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {/* Locations */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardTitle
              icon={MapPin}
              subtitle="Where students access the portal from"
            >
              Geographic Locations
            </CardTitle>
            <BarList
              items={topLocations.map((l) => ({ label: l.label, value: l.visitors }))}
              barColor="bg-gradient-to-r from-primary to-indigo-500"
            />
          </div>
          <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-[#1F2430] dark:text-[#64748B]">
            Aggregated by city and state IP geolocation
          </p>
        </Card>

        {/* Devices */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardTitle
              icon={Laptop}
              subtitle="Hardware & browser distribution"
            >
              Devices & Browsers
            </CardTitle>
            <BarList
              items={topDevices.map((d) => ({ label: d.label, value: d.visitors }))}
              barColor="bg-gradient-to-r from-emerald-500 to-teal-400"
            />
          </div>
          <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-[#1F2430] dark:text-[#64748B]">
            Parsed from user-agent device signatures
          </p>
        </Card>

        {/* Referrers */}
        <Card className="flex flex-col justify-between lg:col-span-2 xl:col-span-1">
          <div>
            <CardTitle
              icon={Globe2}
              subtitle="Incoming referral URLs"
            >
              Traffic Acquisition Sources
            </CardTitle>
            <BarList
              items={topReferrers.map((r) => ({ label: r.label, value: r.visitors }))}
              barColor="bg-gradient-to-r from-amber-500 to-amber-400"
            />
            {topReferrers.length === 0 && (
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400 dark:text-[#7D889E]">
                Most visits are direct (no referrer) — expected for students opening Placement.Wire directly from email notifications or bookmarks.
              </p>
            )}
          </div>
          <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-[#1F2430] dark:text-[#64748B]">
            HTTP origin header tracking
          </p>
        </Card>
      </div>
    </div>
  );
}
