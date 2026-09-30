'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  GraduationCap,
  Trophy,
  BookOpen,
  Star,
  Archive,
  Settings,
  ShieldCheck,
  LogOut,
  X,
} from 'lucide-react';

import { ThemeToggle } from '@/components/theme/ThemeToggle';

export type NavKey =
  | 'dashboard'
  | 'applications'
  | 'placements'
  | 'internships'
  | 'hackathons'
  | 'trainings'
  | 'starred'
  | 'archived';

interface SidebarProps {
  activeNav: NavKey;
  onNavigate: (nav: NavKey) => void;
  counts: Partial<Record<NavKey, number>>;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

const NAV_ITEMS: { key: NavKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'applications', label: 'My Applications', icon: ClipboardList },
  { key: 'placements', label: 'Placements', icon: Building2 },
  { key: 'internships', label: 'Internships', icon: GraduationCap },
  { key: 'hackathons', label: 'Hackathons', icon: Trophy },
  { key: 'trainings', label: 'Trainings', icon: BookOpen },
  { key: 'starred', label: 'Starred', icon: Star },
  { key: 'archived', label: 'Archived', icon: Archive },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onNavigate,
  counts,
  mobileOpen,
  onCloseMobile,
  onLogout,
  isAdmin = false,
}) => {
  const pathname = usePathname();
  const settingsActive = pathname === '/settings';
  const adminActive = pathname === '/admin' || pathname?.startsWith('/admin/');

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, onCloseMobile]);

  const navBtn =
    'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors duration-150';

  const content = (
    <div className="flex h-full flex-col rounded-lg border border-line bg-white p-4 shadow-card dark:border-white/10 dark:bg-[#141824]">
      <Link href="/" className="flex items-center gap-2.5 px-2 py-2">
        <Image
          src="/icon_light.png"
          alt="PlacementWire"
          width={30}
          height={38}
          className="h-8 w-auto object-contain dark:hidden"
        />
        <Image
          src="/icon_dark.png"
          alt="PlacementWire"
          width={30}
          height={38}
          className="hidden h-8 w-auto object-contain dark:block"
        />
        <span className="text-base font-semibold tracking-tight text-[#323243] dark:text-[#E2E4ED]">
          Placement<span className="text-primary">Wire</span>
        </span>
      </Link>

      <p className="overline-tag mt-6 px-3 text-muted">
        Menu
      </p>
      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.key && !settingsActive && !adminActive;
          const count = counts[item.key];
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onNavigate(item.key);
                onCloseMobile();
              }}
              className={`${navBtn} ${
                isActive
                  ? 'bg-primary-soft text-primary dark:bg-primary/20 dark:text-primary'
                  : 'text-[#323243] hover:bg-canvas hover:text-primary dark:text-[#CBD5E1] dark:hover:bg-[#0B0E14] dark:hover:text-[#E2E4ED]'
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {typeof count === 'number' && count > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-canvas text-muted dark:border dark:border-[#1F2430] dark:bg-[#0B0E14] dark:text-[#94A3B8]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <Link
          href="/settings"
          onClick={onCloseMobile}
          className={`${navBtn} ${
            settingsActive
              ? 'bg-primary-soft text-primary dark:bg-primary/20 dark:text-primary'
              : 'text-[#323243] hover:bg-canvas hover:text-primary dark:text-[#CBD5E1] dark:hover:bg-[#0B0E14] dark:hover:text-[#E2E4ED]'
          }`}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          <span className="flex-1 text-left">Settings</span>
        </Link>

        {isAdmin && (
          <Link
            href="/admin"
            onClick={onCloseMobile}
            className={`${navBtn} ${
              adminActive
                ? 'bg-accent text-[#1f1f2e] font-semibold'
                : 'border border-accent/50 text-[#323243] hover:bg-accent-soft hover:text-[#323243] dark:border-accent/40 dark:text-[#FCD34D] dark:hover:bg-accent/10 dark:hover:text-[#FCD34D]'
            }`}
          >
            <ShieldCheck className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1 text-left">Admin Panel</span>
          </Link>
        )}
      </nav>

      <div className="border-t border-line dark:border-[#1F2430] pt-3 space-y-2">
        <div className="flex items-center justify-between px-3 py-1.5 text-xs text-muted dark:text-[#94A3B8]">
          <span className="font-medium">Theme</span>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={onLogout}
          className={`${navBtn} text-muted hover:bg-error-soft hover:text-error dark:text-[#94A3B8] dark:hover:bg-error/20 dark:hover:text-[#F87171]`}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          <span className="flex-1 text-left">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[260px] shrink-0 lg:block xl:w-[280px] 3xl:w-[300px]">
        <div className="sticky top-4 h-[calc(100vh-2rem)] 2xl:top-6 2xl:h-[calc(100vh-3rem)]">{content}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 animate-overlay-fade bg-[#323243]/40"
            onClick={onCloseMobile}
          />
          <div className="absolute left-0 top-0 h-full w-[280px] max-w-[85vw] animate-drawer-in p-2">
            <div className="relative h-full overflow-hidden">
              {content}
              <button
                type="button"
                onClick={onCloseMobile}
                className="absolute right-3 top-3 rounded-md p-1.5 text-muted hover:bg-canvas hover:text-[#323243]"
                title="Close menu"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
