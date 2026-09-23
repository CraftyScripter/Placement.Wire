import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export const SiteHeader: React.FC = () => {
  return (
    <header className="border-b border-line bg-white dark:border-white/10 dark:bg-[#141824]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-6 py-5 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="PlacementWire home">
          <Image
            src="/icon_light.png"
            alt="PlacementWire"
            width={36}
            height={46}
            className="h-8 w-auto shrink-0 object-contain dark:hidden"
          />
          <Image
            src="/icon_dark.png"
            alt="PlacementWire"
            width={36}
            height={46}
            className="hidden h-8 w-auto shrink-0 object-contain dark:block"
          />
          <span className="truncate text-lg font-semibold tracking-tight text-[#323243] dark:text-[#E2E4ED]">
            Placement<span className="text-primary">Wire</span>
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2.5" aria-label="Site">
          <Link
            href="/about"
            className="hidden rounded-md px-3 py-2 text-sm font-semibold text-[#323243] transition-colors duration-150 hover:text-primary dark:text-[#E2E4ED] dark:hover:text-primary sm:inline-flex"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="hidden rounded-md px-3 py-2 text-sm font-semibold text-[#323243] transition-colors duration-150 hover:text-primary dark:text-[#E2E4ED] dark:hover:text-primary sm:inline-flex"
          >
            Contact
          </Link>
          <ThemeToggle className="!h-9 !w-9" />
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-95"
          >
            <span>Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </div>
    </header>
  );
};
