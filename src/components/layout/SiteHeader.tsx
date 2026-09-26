'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuth } from '@/hooks/use-auth';
import { useScrolled } from '@/hooks/use-scrolled';

export const SiteHeader: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const scrolled = useScrolled(16);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? 'border-line bg-white shadow-card dark:border-white/10 dark:bg-[#141824]'
          : 'border-transparent bg-white/70 backdrop-blur-md dark:bg-[#141824]/70'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="PlacementWire home">
          <Image
            src="/icon_light.png"
            alt="PlacementWire"
            width={40}
            height={52}
            className="h-9 w-auto shrink-0 object-contain sm:h-11 dark:hidden"
          />
          <Image
            src="/icon_dark.png"
            alt="PlacementWire"
            width={40}
            height={52}
            className="hidden h-9 w-auto shrink-0 object-contain sm:h-11 dark:block"
          />
          <span className="truncate text-xl font-semibold tracking-tight text-[#323243] sm:text-2xl dark:text-[#E2E4ED]">
            Placement<span className="text-primary">Wire</span>
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2.5" aria-label="Site">
          <Link
            href="/about"
            className="hidden rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#323243] transition-colors duration-150 hover:text-primary dark:text-[#E2E4ED] dark:hover:text-primary sm:inline-flex"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="hidden rounded-lg px-4 py-2.5 text-[15px] font-medium text-[#323243] transition-colors duration-150 hover:text-primary dark:text-[#E2E4ED] dark:hover:text-primary sm:inline-flex"
          >
            Contact
          </Link>
          <ThemeToggle className="!h-10 !w-10" />
          {isLoading ? (
            <div className="h-11 w-32 animate-pulse rounded-lg border border-line bg-canvas dark:border-white/10 dark:bg-[#0B0E14]" />
          ) : isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-primary px-5 text-[15px] font-semibold text-white shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-95"
            >
              <span>Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-primary px-5 text-[15px] font-semibold text-white shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-95"
            >
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
