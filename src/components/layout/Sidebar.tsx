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

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Close the drawer on Escape.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, onCloseMobile]);

  const navBtn =
    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150';

  const content = (
    <div className="flex h-full flex-col rounded-2xl bg-ink-sidebar p-4">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2.5 px-2 py-2">
        <Image
          src="/icon_dark.png"
          alt="PlacementWire"
          width={30}
          height={38}
          className="h-8 w-auto object-contain"
        />
        <span className="text-base font-extrabold tracking-tight text-white">
          Placement<span className="text-brandviolet-hover">Wire</span>
        </span>
      </Link>

      {/* Menu */}
      <p className="mt-6 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
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
                  ? 'bg-brandviolet text-white'
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {typeof count === 'number' && count > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-neutral-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {/* Settings — in the menu flow, right below Archived */}
        <Link
          href="/settings"
          onClick={onCloseMobile}
          className={`${navBtn} ${
            settingsActive
              ? 'bg-brandviolet text-white'
              : 'text-neutral-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          <span className="flex-1 text-left">Settings</span>
        </Link>

        {/* Admin Panel — only rendered for the admin account */}
        {isAdmin && (
          <Link
            href="/admin"
            onClick={onCloseMobile}
            className={`${navBtn} ${
              adminActive
                ? 'bg-amber-500 text-black'
                : 'border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200'
            }`}
          >
            <ShieldCheck className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1 text-left">Admin Panel</span>
          </Link>
        )}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={onLogout}
          className={`${navBtn} text-neutral-400 hover:bg-rose-500/10 hover:text-rose-300`}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          <span className="flex-1 text-left">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-[260px] shrink-0 lg:block xl:w-[280px] 3xl:w-[300px]">
        <div className="sticky top-4 h-[calc(100vh-2rem)] 2xl:top-6 2xl:h-[calc(100vh-3rem)]">{content}</div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 animate-overlay-fade bg-black/60"
            onClick={onCloseMobile}
          />
          <div className="absolute left-0 top-0 h-full w-[280px] max-w-[85vw] animate-drawer-in p-2">
            <div className="relative h-full overflow-hidden">
              {content}
              <button
                type="button"
                onClick={onCloseMobile}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-neutral-400 hover:bg-white/5 hover:text-white"
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
