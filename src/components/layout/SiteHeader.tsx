import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const SiteHeader: React.FC = () => {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="PlacementWire home">
        <Image
          src="/icon_dark.png"
          alt="PlacementWire"
          width={36}
          height={46}
          className="h-8 w-auto shrink-0 object-contain"
        />
        <span className="truncate text-lg font-extrabold tracking-tight text-white">
          Placement<span className="text-indigo-400">Wire</span>
        </span>
      </Link>

      <nav className="flex shrink-0 items-center gap-1 sm:gap-2" aria-label="Site">
        <Link
          href="/about"
          className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition-colors duration-150 hover:bg-white/[0.05] hover:text-white sm:inline-flex"
        >
          About
        </Link>
        <Link
          href="/contact"
          className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition-colors duration-150 hover:bg-white/[0.05] hover:text-white sm:inline-flex"
        >
          Contact
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-indigo-500 active:scale-95 sm:px-4 sm:text-sm"
        >
          <span>Dashboard</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>
    </header>
  );
};
