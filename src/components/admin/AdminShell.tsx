'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Activity,
  CloudUpload,
  Compass,
  Gauge,
  Globe2,
  LogIn,
  MousePointerClick,
  Radio,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useAdminOverview } from '@/hooks/use-admin-overview';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: 'live' | string;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'ANALYTICS',
    items: [
      { href: '/admin', label: 'Overview', icon: Gauge, exact: true },
      { href: '/admin/live', label: 'Live Presence', icon: Radio, exact: false, badge: 'live' },
    ],
  },
  {
    title: 'STUDENT ACTIVITY',
    items: [
      { href: '/admin/visitors', label: 'All Visitors', icon: Users, exact: false },
      { href: '/admin/signups', label: 'Registrations', icon: UserPlus, exact: false },
      { href: '/admin/logins', label: 'Login History', icon: LogIn, exact: false },
      { href: '/admin/pages', label: 'Page Views', icon: MousePointerClick, exact: false },
    ],
  },
  {
    title: 'SYSTEM & DATA',
    items: [
      { href: '/admin/insights', label: 'Device & Geo', icon: Globe2, exact: false },
      { href: '/admin/backup', label: 'Data & Backup', icon: CloudUpload, exact: false },
    ],
  },
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-500 dark:bg-[#0B0E14] dark:text-[#94A3B8]">
        <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-primary dark:border-[#1F2430] dark:border-t-primary" />
        <span className="text-xs font-semibold tracking-wide">Authenticating Admin Session...</span>
      </div>
    );
  }

  if (user && !user.isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-[#0B0E14]">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Access Restricted</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-[#94A3B8]">
          Signed in as <span className="font-semibold text-slate-800 dark:text-slate-200">{user.email}</span>. This administrative management console is only accessible by verified platform administrators.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-xs font-semibold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary-hover active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Student Portal
        </Link>
      </div>
    );
  }

  const online = data?.totals.onlineNow ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B0E14] dark:text-[#E2E4ED] transition-colors">
      <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-4 p-3 sm:p-5 lg:flex-row lg:gap-6">
        {/* Desktop Modern Sidebar */}
        <aside className="hidden w-[260px] shrink-0 lg:block xl:w-[280px]">
          <div className="sticky top-5 flex h-[calc(100vh-2.5rem)] flex-col rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm backdrop-blur-sm dark:border-[#1F2430] dark:bg-[#141824] dark:shadow-none">
            {/* Header Brand */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-[#1F2430]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 text-white shadow-md shadow-primary/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                      Placement<span className="text-primary">.Wire</span>
                    </span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-black uppercase text-primary dark:bg-primary/20">
                      ADMIN
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 dark:text-[#7D889E]">
                    Control & Analytics
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Groups */}
            <nav className="mt-4 flex-1 space-y-5 overflow-y-auto pr-1">
              {NAV_GROUPS.map((group) => (
                <div key={group.title} className="space-y-1">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#64748B]">
                    {group.title}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = item.exact
                        ? pathname === item.href
                        : pathname === item.href || pathname?.startsWith(item.href + '/');
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                            active
                              ? 'bg-primary text-white shadow-md shadow-primary/25'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:bg-[#1A202E] dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon
                              className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                                active
                                  ? 'text-white'
                                  : 'text-slate-400 group-hover:text-slate-700 dark:text-[#64748B] dark:group-hover:text-slate-200'
                              }`}
                            />
                            <span>{item.label}</span>
                          </div>

                          {item.badge === 'live' && (
                            <span
                              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                active
                                  ? 'bg-white/20 text-white'
                                  : online > 0
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                  : 'bg-slate-100 text-slate-400 dark:bg-[#1A202E] dark:text-[#64748B]'
                              }`}
                            >
                              <span className="relative flex h-1.5 w-1.5">
                                {online > 0 && (
                                  <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                                )}
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    online > 0 ? 'bg-emerald-500' : 'bg-slate-400'
                                  }`}
                                />
                              </span>
                              {online}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Bottom Footer User Card & Theme Switch */}
            <div className="mt-auto border-t border-slate-100 pt-3 dark:border-[#1F2430]">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-[#0B0E14]">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary dark:bg-primary/20">
                    {user?.name ? user.name[0].toUpperCase() : 'A'}
                  </div>
                  <div className="truncate">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-[#E2E4ED]">
                      {user?.name || 'Administrator'}
                    </p>
                    <p className="truncate text-[10px] text-slate-400 dark:text-[#64748B]" title={user?.email}>
                      {user?.email}
                    </p>
                  </div>
                </div>
                <ThemeToggle />
              </div>

              <Link
                href="/dashboard"
                className="mt-2.5 flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white py-2 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#94A3B8] dark:hover:border-[#2D3548] dark:hover:bg-[#1A202E] dark:hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Exit to Student Portal</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile Modern Header & Nav Bar */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm dark:border-[#1F2430] dark:bg-[#141824]">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white">
                  Placement<span className="text-primary">.Wire</span>
                </span>
                <span className="ml-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary dark:bg-primary/20">
                  ADMIN
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {online > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {online} online
                </span>
              )}
              <ThemeToggle />
              <Link
                href="/dashboard"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-[#1F2430] dark:text-[#94A3B8] dark:hover:bg-[#1A202E]"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Horizontal scroll pill nav */}
          <nav className="no-scrollbar -mx-1 mt-2.5 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {NAV_GROUPS.flatMap((g) => g.items).map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname?.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'border border-slate-200/80 bg-white text-slate-600 dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#94A3B8]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                  {item.badge === 'live' && online > 0 && (
                    <span className="ml-1 rounded-full bg-emerald-500 px-1.5 py-0.2 text-[9px] text-white">
                      {online}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:bg-slate-50 dark:[&_thead_th]:bg-[#141824] [&_thead_th]:border-b [&_thead_th]:border-slate-200 dark:[&_thead_th]:border-[#1F2430] [&_thead_th]:text-slate-500 dark:[&_thead_th]:text-[#94A3B8]">
          {children}
        </main>
      </div>
    </div>
  );
}
