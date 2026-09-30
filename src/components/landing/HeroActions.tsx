'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

/** Hero CTA island — swaps between signed-in and signed-out actions. */
export const HeroActions: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
        <div className="h-14 w-full animate-pulse rounded-xl bg-white/70 sm:w-64 dark:bg-white/10" />
        <div className="h-14 w-full animate-pulse rounded-xl bg-white/50 sm:w-64 dark:bg-white/5" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
        <Link
          href="/dashboard"
          className="inline-flex h-14 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-8 text-base font-semibold text-white shadow-pop transition-all duration-150 hover:bg-primary-hover active:scale-95 sm:w-auto"
        >
          Go to Dashboard
          <ArrowRight className="h-5 w-5 shrink-0" />
        </Link>
        <div className="inline-flex items-center gap-2.5 rounded-xl border border-line bg-white px-5 py-3.5 text-sm text-muted shadow-card dark:border-white/10 dark:bg-[#141824] dark:text-[#94A3B8]">
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
          <span>
            Signed in as{' '}
            <strong className="font-semibold text-[#323243] dark:text-[#E2E4ED]">
              {user.email}
            </strong>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
      <Link
        href="/login"
        className="inline-flex h-14 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-7 text-base font-semibold text-white shadow-pop transition-all duration-150 hover:bg-primary-hover active:scale-95 sm:w-auto"
      >
        Connect @saitm.ac.in
        <ArrowRight className="h-5 w-5 shrink-0" />
      </Link>
      <Link
        href="/dashboard"
        className="inline-flex h-14 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-line bg-white px-7 text-base font-semibold shadow-card transition-colors duration-150 hover:border-primary hover:text-primary sm:w-auto dark:border-white/10 dark:bg-[#141824] dark:hover:border-primary"
      >
        Explore Demo
      </Link>
    </div>
  );
};
