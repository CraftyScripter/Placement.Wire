'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CloudUpload,
  Gauge,
  Globe2,
  LogIn,
  MousePointerClick,
  Radio,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useAdminOverview } from '@/hooks/use-admin-overview';

const SECTIONS = [
  { href: '/admin', label: 'Overview', icon: Gauge, exact: true },
  { href: '/admin/live', label: 'Live Now', icon: Radio, exact: false },
  { href: '/admin/visitors', label: 'Visitors', icon: Users, exact: false },
  { href: '/admin/signups', label: 'Signups', icon: UserPlus, exact: false },
  { href: '/admin/logins', label: 'Logins', icon: LogIn, exact: false },
  { href: '/admin/pages', label: 'Pages', icon: MousePointerClick, exact: false },
  { href: '/admin/insights', label: 'Insights', icon: Globe2, exact: false },
  { href: '/admin/backup', label: 'Backup', icon: CloudUpload, exact: false },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { data } = useAdminOverview();

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink text-neutral-500">
        <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
        <span className="text-xs font-medium">Checking admin session...</span>
      </div>
    );
  }

  if (user && !user.isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink p-6 text-center">
        <ShieldCheck className="mb-3 h-10 w-10 text-amber-400" />
        <h1 className="text-lg font-bold text-white">Admins only</h1>
        <p className="mt-1 max-w-sm text-sm text-neutral-400">
          Signed in as {user.email}. This console is only visible to the site owner.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brandviolet px-4 py-2 text-sm font-semibold text-white hover:bg-brandviolet-hover"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const online = data?.totals.onlineNow ?? 0;

  const nav = (
    <>
      {SECTIONS.map((s) => {
        const active = s.exact ? pathname === s.href : pathname === s.href || pathname?.startsWith(s.href + '/');
        // '/admin' exact would also prefix-match everything — handled by `exact`.
        const Icon = s.icon;
        return (
          <Link
            key={s.href}
            href={s.href}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="whitespace-nowrap">{s.label}</span>
            {s.href === '/admin/live' && online > 0 && (
              <span
                className={`ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  active ? 'bg-black/15 text-black' : 'bg-emerald-500/15 text-emerald-300'
                }`}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                {online}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-ink text-neutral-200">
      <div className="mx-auto flex w-full flex-col gap-4 p-3 sm:p-4 lg:flex-row 2xl:gap-5 2xl:p-5">
        {/* Desktop sidebar */}
        <aside className="hidden w-[250px] shrink-0 lg:block xl:w-[270px]">
          <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col gap-1 overflow-y-auto rounded-2xl bg-ink-sidebar p-4">
            <div className="px-2 py-2">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </p>
              <p className="mt-2 truncate text-[11px] text-neutral-500" title={user?.email}>
                {user?.email}
              </p>
            </div>
            <nav className="mt-2 flex-1 space-y-1">{nav}</nav>
            <div className="border-t border-white/10 pt-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white"
              >
                <ArrowLeft className="h-[18px] w-[18px] shrink-0" />
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile top bar + horizontal section nav */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-ink-sidebar px-4 py-3">
            <p className="inline-flex items-center gap-1.5 text-sm font-extrabold text-white">
              <ShieldCheck className="h-4 w-4 text-amber-400" /> Admin Console
              {online > 0 && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  {online} online
                </span>
              )}
            </p>
            <Link href="/dashboard" className="rounded-lg p-1.5 text-neutral-400 hover:text-white" aria-label="Back to dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>
          <nav className="scrollbar-none -mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1">{nav}</nav>
        </div>

        <main className="min-w-0 flex-1 [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:bg-ink-card [&_thead_th]:shadow-[0_1px_0_rgba(255,255,255,0.08)]">{children}</main>
      </div>
    </div>
  );
}
