'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  HardDrive,
  Mail,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0c10] p-6 text-slate-100">
      <div className="w-full max-w-xl rounded-lg border border-white/10 bg-white/[0.03] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/5 p-1.5 border border-white/10 flex items-center justify-center">
            <Image
              src="/pw_icon_dark_only.png"
              alt="PlacementWire Icon"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Welcome to PlacementWire</h1>
            <p className="text-xs text-slate-400">SAITM Student Placement Portal</p>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-3 text-xs">
          <div className="space-y-2 text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Gmail scan:</strong> only placement emails are read. Personal emails are never opened.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <HardDrive className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Your Drive:</strong> data file (<code className="bg-white/[0.06] px-1 py-0.5 rounded text-slate-300">PlacementWire_Data/placements.json</code>) lives in your own Google Drive.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>SAITM only:</strong> <code className="bg-white/[0.06] px-1 py-0.5 rounded text-slate-300">@saitm.ac.in</code> accounts only.
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 active:scale-95 transition-colors duration-150"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
