'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  HardDrive,
  Mail,
  ArrowRight,
  Clock,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { SiteFooter } from '@/components/layout/SiteFooter';

export default function LandingPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'applied'>('all');

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Banner */}
      <div className="border-b border-white/10 bg-white/[0.03] px-3 py-2 text-center text-[11px] sm:text-xs font-medium text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-1">
          <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
          <span className="text-slate-400">Campus Drives 2026 & 2027:</span>
          <span className="font-semibold text-white">Exclusively for SAITM Students (@saitm.ac.in)</span>
        </div>
      </div>

      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <Image
            src="/icon_dark.png"
            alt="PlacementWire"
            width={36}
            height={46}
            className="h-8 w-auto shrink-0 object-contain sm:h-9"
            priority
          />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-lg font-extrabold tracking-tight text-white sm:text-xl">
              Placement<span className="text-indigo-400">Wire</span>
            </span>
            <span className="hidden text-[11px] text-slate-400 min-[400px]:block -mt-0.5">Your Placement Emails. Organized.</span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {isLoading ? (
            <div className="h-9 w-28 rounded-lg bg-white/[0.04] animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-white/10 bg-white/[0.03]">
                <div className="relative h-6 w-6 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-300">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <span>{user.name?.charAt(0) || 'S'}</span>
                  )}
                </div>
                <span className="text-xs font-medium text-slate-300 max-w-[130px] truncate">
                  {user.name}
                </span>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 active:scale-95 transition-colors duration-150 sm:px-4"
              >
                <span className="hidden min-[400px]:inline">Go to Dashboard</span>
                <span className="min-[400px]:hidden">Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors duration-150"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors duration-150 px-3 py-2 rounded-lg hover:bg-white/[0.05]"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 active:scale-95 transition-colors duration-150 sm:px-4"
              >
                <span className="hidden min-[400px]:inline">Connect College Gmail</span>
                <span className="min-[400px]:hidden">Connect Gmail</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 pt-8 pb-12 text-center sm:pt-16 sm:pb-24 sm:px-6 lg:px-8">
        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-[11px] sm:text-xs font-medium text-slate-300 mb-6">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
          <span className="truncate">No central database — stored in your Google Drive</span>
        </div>

        <h1 className="text-balance text-[28px] leading-[1.15] font-extrabold tracking-tight text-white min-[400px]:text-4xl sm:text-6xl sm:leading-[1.12]">
          Every Placement Email.
          <br />
          Organized. Private.
        </h1>

        <p className="mx-auto mt-5 sm:mt-6 max-w-2xl text-sm sm:text-lg text-slate-400 leading-relaxed">
          PlacementWire connects to your SAITM Gmail, extracts company details, CTC, roles and deadlines, and builds your private placement tracker in your Google Drive.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAuthenticated && user ? (
            <>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 active:scale-95 transition-colors duration-150"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-white/10 bg-white/[0.03] text-xs text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Signed in as <strong className="text-white">{user.email}</strong></span>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 active:scale-95 transition-colors duration-150"
              >
                <span>Connect @saitm.ac.in Account</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-white/[0.05] transition-colors duration-150"
              >
                <span>Explore Demo Dashboard</span>
              </Link>
            </>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-2 text-[11px] sm:text-xs text-slate-500">
          <span>@saitm.ac.in sign-in only</span>
          <span className="hidden min-[400px]:inline">•</span>
          <span>Drive file in your Google Drive</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">No server database</span>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-10 sm:mt-14 rounded-lg border border-white/10 bg-white/[0.03] text-left overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 sm:px-4 py-3 text-xs">
            <span className="min-w-0 truncate text-slate-400">placementwire / dashboard</span>
            <span className="flex shrink-0 items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="hidden min-[400px]:inline">Synced to Google Drive</span>
              <span className="min-[400px]:hidden">Synced</span>
            </span>
          </div>

          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-3 sm:px-4 pt-3 pb-2 border-b border-white/10 text-xs">
            {(['all', 'new', 'applied'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors duration-150 ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                {tab === 'all' ? 'All Drives (3)' : tab === 'new' ? 'New (1)' : 'Applied (1)'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 min-[560px]:grid-cols-2 md:grid-cols-3 gap-3 p-3 sm:p-5">
            {(activeTab === 'all' || activeTab === 'new') && (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-white/5 text-slate-300 font-bold flex items-center justify-center text-xs border border-white/10">
                      R
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">RGF India</h4>
                      <span className="text-[10px] text-slate-500">Final Placement</span>
                    </div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-bold text-slate-300">
                    NEW
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs">
                  <p className="font-semibold text-slate-100">Associate Consultant</p>
                  <p className="text-[11px] text-slate-500">Gurgaon • B.Tech (CSE, CST, AIML), MBA</p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-white/10 text-[10px]">
                  <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                    <Clock className="h-3 w-3" /> Expires in 2 days
                  </span>
                  <span className="text-slate-500">Batch 2026, 2027</span>
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'applied') && (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-white/5 text-slate-300 font-bold flex items-center justify-center text-xs border border-white/10">
                      7
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">75WAY Technologies</h4>
                      <span className="text-[10px] text-slate-500">Internship with PPO</span>
                    </div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-bold text-slate-300">
                    APPLIED
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs">
                  <p className="font-semibold text-slate-100">SDE (Level I) & Associate Dev</p>
                  <p className="text-[11px] font-semibold text-emerald-400">₹4.00 LPA – ₹5.40 LPA • Mohali</p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-white/10 text-[10px]">
                  <span className="text-emerald-400 font-medium">Applied on 21 Sept</span>
                  <span className="text-slate-500">B.Tech & MCA</span>
                </div>
              </div>
            )}

            {activeTab === 'all' && (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-white/5 text-slate-300 font-bold flex items-center justify-center text-xs border border-white/10">
                      B
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">BriBooks</h4>
                      <span className="text-[10px] text-slate-500">Internship with PPO</span>
                    </div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-bold text-slate-300">
                    INTERVIEW
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs">
                  <p className="font-semibold text-slate-100">4 Distinct Profiles</p>
                  <p className="text-[11px] text-slate-500">Python Dev, Graphic Design, Outreach</p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-white/10 text-[10px]">
                  <span className="text-slate-300 font-medium">Round 1 Cleared</span>
                  <span className="text-slate-500">Batch 2026, 2027</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-xs font-semibold text-slate-500">How it works</h2>
          <p className="mt-2 text-xl sm:text-3xl font-bold text-white">Simple, private, fast</p>
        </div>

        <div className="grid grid-cols-1 min-[560px]:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center mb-3">
              <Mail className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Targeted Gmail scan</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Only placement announcements from CRC are read. Personal emails are never opened or stored.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center mb-3">
              <HardDrive className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Your Drive, your data</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Everything lives in <code className="text-slate-300 bg-white/[0.06] px-1 py-0.5 rounded text-[11px]">PlacementWire_Data/placements.json</code> inside your own Google Drive.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center mb-3">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Track and apply</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Move drives from New to Applied to Interview. Apply buttons open the official form and update status.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
