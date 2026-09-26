'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuth } from '@/hooks/use-auth';
import { useScrolled } from '@/hooks/use-scrolled';
import { UserAvatar } from '@/components/shared/UserAvatar';

/**
 * Landing header island — the only interactive part of the top bar.
 * Transparent + blur at top (nothing scrolls, so zero repaint cost);
 * solid + blur-free once scrolled. One rAF-throttled boolean flip.
 */
export const LandingHeader: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const scrolled = useScrolled(16);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? 'border-line/60 bg-canvas shadow-card dark:border-white/10 dark:bg-[#0B0E14]'
          : 'border-transparent bg-canvas/70 backdrop-blur-md dark:bg-[#0B0E14]/70'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src="/icon_light.png"
            alt="PlacementWire"
            width={40}
            height={52}
            className="h-9 w-auto shrink-0 object-contain sm:h-11 dark:hidden"
            priority
            fetchPriority="high"
          />
          <Image
            src="/icon_dark.png"
            alt="PlacementWire"
            width={40}
            height={52}
            className="hidden h-9 w-auto shrink-0 object-contain sm:h-11 dark:block"
            priority
            fetchPriority="high"
          />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
              Placement<span className="text-primary">Wire</span>
            </span>
            <span className="hidden text-xs font-normal text-muted min-[480px]:block dark:text-[#94A3B8]">
              Your Placement Emails. Organized.
            </span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <nav className="mr-1 hidden items-center gap-1 lg:flex" aria-label="Site">
            <Link href="/about" className="rounded-md px-4 py-2 text-[15px] font-medium transition-colors hover:text-primary">
              About
            </Link>
            <Link href="/contact" className="rounded-md px-4 py-2 text-[15px] font-medium transition-colors hover:text-primary">
              Contact
            </Link>
          </nav>
          <ThemeToggle className="!h-10 !w-10" />

          {isLoading ? (
            <div className="h-11 w-36 animate-pulse rounded-lg border border-line bg-white dark:border-white/10 dark:bg-[#141824]" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-4 shadow-card md:flex dark:border-white/10 dark:bg-[#141824]">
                <UserAvatar
                  name={user.name}
                  picture={user.picture}
                  className="h-8 w-8 border border-line bg-canvas text-xs font-semibold text-[#323243] dark:border-white/10 dark:bg-[#0B0E14] dark:text-[#E2E4ED]"
                />
                <span className="max-w-[140px] truncate text-sm font-medium">{user.name}</span>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-primary px-5 text-[15px] font-semibold text-white shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-95"
              >
                Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                onClick={logout}
                className="rounded-lg p-2.5 text-muted transition-colors duration-150 hover:bg-error-soft hover:text-error"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden h-11 items-center rounded-lg px-4 text-[15px] font-semibold text-primary transition-colors hover:text-primary-hover sm:inline-flex"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-primary px-5 text-[15px] font-semibold text-white shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-95"
              >
                Connect College Gmail
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
