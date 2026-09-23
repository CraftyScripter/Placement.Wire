'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  HardDrive,
  Mail,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-clip bg-canvas p-4 sm:p-6 text-[#323243]">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-xl rounded-lg border border-line bg-white p-4 shadow-card sm:p-8 space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Back to homepage" className="h-10 w-10 shrink-0 rounded-md bg-canvas p-1.5 border border-line flex items-center justify-center">
            <Image
              src="/pw_icon_light_only.png"
              alt="PlacementWire Icon"
              width={32}
              height={32}
              className="object-contain dark:hidden"
            />
            <Image
              src="/pw_icon_dark_only.png"
              alt="PlacementWire Icon"
              width={32}
              height={32}
              className="hidden object-contain dark:block"
            />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-[#323243]">Welcome to PlacementWire</h1>
            <p className="text-[11px] sm:text-xs font-normal text-muted">SAITM Student Placement Portal</p>
          </div>
        </div>

        <div className="rounded-md border border-line bg-canvas p-4 space-y-3 text-xs">
          <div className="space-y-2 font-normal text-muted">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <span className="text-[#323243]">
                <strong className="font-semibold">Gmail scan:</strong> <span className="font-normal text-muted">only placement emails are read. Personal emails are never opened.</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <HardDrive className="h-4 w-4 text-muted shrink-0 mt-0.5" />
              <span className="text-[#323243]">
                <strong className="font-semibold">Your Drive:</strong> <span className="font-normal text-muted">data file (<code className="bg-white border border-line px-1 py-0.5 rounded text-[#323243]">PlacementWire_Data/placements.json</code>) lives in your own Google Drive.</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-muted shrink-0 mt-0.5" />
              <span className="text-[#323243]">
                <strong className="font-semibold">SAITM only:</strong> <code className="bg-white border border-line px-1 py-0.5 rounded text-[#323243]">@saitm.ac.in</code> <span className="font-normal text-muted">accounts only.</span>
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover active:scale-95 transition-all duration-150"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
