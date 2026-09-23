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
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function LandingPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'applied'>('all');

  return (
    <div className="min-h-screen bg-canvas text-[#323243] dark:bg-[#0B0E14] dark:text-[#E2E4ED]">
      {/* Top Banner */}
      <div className="border-b border-line bg-white px-3 py-2 text-center text-[11px] sm:text-xs font-normal text-muted dark:border-white/10 dark:bg-[#141824]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-1">
          <span className="flex h-2 w-2 shrink-0 rounded-full bg-success" />
          <span className="text-muted dark:text-[#94A3B8]">Campus Drives 2026 & 2027:</span>
          <span className="font-semibold text-[#323243] dark:text-[#E2E4ED]">Exclusively for SAITM Students (@saitm.ac.in)</span>
        </div>
      </div>

      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-2 bg-canvas px-4 py-4 sm:px-6 sm:py-5 lg:px-8 dark:bg-[#0B0E14]">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <Image
            src="/icon_light.png"
            alt="PlacementWire"
            width={36}
            height={46}
            className="h-8 w-auto shrink-0 object-contain sm:h-9 dark:hidden"
            priority
          />
          <Image
            src="/icon_dark.png"
            alt="PlacementWire"
            width={36}
            height={46}
            className="hidden h-8 w-auto shrink-0 object-contain sm:h-9 dark:block"
            priority
          />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-lg font-semibold tracking-tight text-[#323243] sm:text-xl dark:text-[#E2E4ED]">
              Placement<span className="text-primary">Wire</span>
            </span>
            <span className="hidden text-[11px] font-normal text-muted min-[400px]:block -mt-0.5 dark:text-[#94A3B8]">Your Placement Emails. Organized.</span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle className="!h-9 !w-9" />

          {isLoading ? (
            <div className="h-9 w-28 rounded-md bg-white border border-line animate-pulse dark:bg-[#141824] dark:border-white/10" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-line bg-white shadow-card dark:border-white/10 dark:bg-[#141824]">
                <div className="relative h-6 w-6 rounded-full overflow-hidden border border-line bg-canvas flex items-center justify-center text-[10px] font-semibold text-[#323243] dark:border-white/10 dark:bg-[#0B0E14] dark:text-[#E2E4ED]">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <span>{user.name?.charAt(0) || 'S'}</span>
                  )}
                </div>
                <span className="text-xs font-normal text-[#323243] max-w-[130px] truncate dark:text-[#E2E4ED]">
                  {user.name}
                </span>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-primary-hover active:scale-95 transition-all duration-150"
              >
                <span className="hidden min-[400px]:inline">Go to Dashboard</span>
                <span className="min-[400px]:hidden">Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <button
                onClick={logout}
                className="p-2 rounded-md text-muted hover:text-error hover:bg-error-soft transition-colors duration-150 dark:hover:bg-error/10"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex h-9 items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:text-primary-hover transition-colors duration-150 px-3 py-2 rounded-md"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-primary-hover active:scale-95 transition-all duration-150"
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
        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1 text-[11px] sm:text-xs font-normal text-muted mb-6 shadow-card dark:border-white/10 dark:bg-[#141824] dark:text-[#94A3B8]">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">No central database — stored in your Google Drive</span>
        </div>

        <h1 className="text-balance text-[28px] leading-[1.15] font-semibold tracking-tight text-[#323243] min-[400px]:text-4xl sm:text-6xl sm:leading-[1.12] dark:text-[#E2E4ED]">
          Every Placement Email.
          <br />
          Organized. Private.
        </h1>

        <p className="mx-auto mt-5 sm:mt-6 max-w-2xl text-sm sm:text-lg font-normal text-muted leading-relaxed dark:text-[#94A3B8]">
          PlacementWire connects to your SAITM Gmail, extracts company details, CTC, roles and deadlines, and builds your private placement tracker in your Google Drive.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAuthenticated && user ? (
            <>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-hover active:scale-95 transition-all duration-150"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-line bg-white text-xs text-muted shadow-card dark:border-white/10 dark:bg-[#141824] dark:text-[#94A3B8]">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span>Signed in as <strong className="text-[#323243] font-semibold dark:text-[#E2E4ED]">{user.email}</strong></span>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-hover active:scale-95 transition-all duration-150"
              >
                <span>Connect @saitm.ac.in Account</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-6 py-2.5 text-sm font-medium text-[#323243] shadow-card hover:border-primary hover:text-primary transition-colors duration-150 dark:border-white/10 dark:bg-[#141824] dark:text-[#E2E4ED] dark:hover:border-primary"
              >
                <span>Explore Demo Dashboard</span>
              </Link>
            </>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-2 text-[11px] sm:text-xs font-normal text-muted dark:text-[#94A3B8]">
          <span>@saitm.ac.in sign-in only</span>
          <span className="hidden min-[400px]:inline">•</span>
          <span>Drive file in your Google Drive</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">No server database</span>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-10 sm:mt-14 rounded-lg border border-line bg-white shadow-card text-left overflow-hidden dark:border-white/10 dark:bg-[#141824]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line dark:border-white/10 px-3 sm:px-4 py-3 text-xs">
            <span className="min-w-0 truncate font-normal text-muted dark:text-[#94A3B8]">placementwire / dashboard</span>
            <span className="flex shrink-0 items-center gap-1.5 text-success font-normal text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="hidden min-[400px]:inline">Synced to Google Drive</span>
              <span className="min-[400px]:hidden">Synced</span>
            </span>
          </div>

          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-3 sm:px-4 pt-3 pb-2 border-b border-line dark:border-white/10 text-xs">
            {(['all', 'new', 'applied'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md font-normal transition-colors duration-150 ${
                  activeTab === tab
                    ? 'bg-primary text-white'
                    : 'text-muted hover:text-primary hover:bg-canvas dark:text-[#94A3B8] dark:hover:text-[#E2E4ED] dark:hover:bg-[#0B0E14]'
                }`}
              >
                {tab === 'all' ? 'All Drives (3)' : tab === 'new' ? 'New (1)' : 'Applied (1)'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 min-[560px]:grid-cols-2 md:grid-cols-3 gap-3 p-3 sm:p-5 bg-canvas dark:bg-[#0B0E14]">
            {(activeTab === 'all' || activeTab === 'new') && (
              <div className="rounded-lg border border-line bg-white shadow-card p-4 dark:border-white/10 dark:bg-[#141824]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-md bg-canvas text-[#323243] font-semibold flex items-center justify-center text-xs border border-line dark:border-white/10 dark:bg-[#0B0E14] dark:text-[#E2E4ED]">
                      R
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#323243] dark:text-[#E2E4ED]">RGF India</h4>
                      <span className="text-[10px] font-normal text-muted dark:text-[#94A3B8]">Final Placement</span>
                    </div>
                  </div>
                  <span className="rounded-full border border-line bg-canvas px-2 py-0.5 text-[10px] font-normal text-muted dark:border-white/10 dark:bg-[#0B0E14] dark:text-[#94A3B8]">
                    NEW
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs">
                  <p className="font-semibold text-[#323243] dark:text-[#E2E4ED]">Associate Consultant</p>
                  <p className="text-[11px] font-normal text-muted dark:text-[#94A3B8]">Gurgaon • B.Tech (CSE, CST, AIML), MBA</p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-line dark:border-white/10 text-[10px]">
                  <span className="inline-flex items-center gap-1 text-accent font-medium dark:text-[#FCD34D]">
                    <Clock className="h-3 w-3" /> Expires in 2 days
                  </span>
                  <span className="font-normal text-muted dark:text-[#94A3B8]">Batch 2026, 2027</span>
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'applied') && (
              <div className="rounded-lg border border-line bg-white shadow-card p-4 dark:border-white/10 dark:bg-[#141824]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-md bg-canvas text-[#323243] font-semibold flex items-center justify-center text-xs border border-line dark:border-white/10 dark:bg-[#0B0E14] dark:text-[#E2E4ED]">
                      7
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#323243] dark:text-[#E2E4ED]">75WAY Technologies</h4>
                      <span className="text-[10px] font-normal text-muted dark:text-[#94A3B8]">Internship with PPO</span>
                    </div>
                  </div>
                  <span className="rounded-full border border-line bg-canvas px-2 py-0.5 text-[10px] font-normal text-muted dark:border-white/10 dark:bg-[#0B0E14] dark:text-[#94A3B8]">
                    APPLIED
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs">
                  <p className="font-semibold text-[#323243] dark:text-[#E2E4ED]">SDE (Level I) & Associate Dev</p>
                  <p className="text-[11px] font-medium text-success dark:text-[#21C56E]">₹4.00 LPA – ₹5.40 LPA • Mohali</p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-line dark:border-white/10 text-[10px]">
                  <span className="text-success font-medium dark:text-[#21C56E]">Applied on 21 Sept</span>
                  <span className="font-normal text-muted dark:text-[#94A3B8]">B.Tech & MCA</span>
                </div>
              </div>
            )}

            {activeTab === 'all' && (
              <div className="rounded-lg border border-line bg-white shadow-card p-4 dark:border-white/10 dark:bg-[#141824]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-md bg-canvas text-[#323243] font-semibold flex items-center justify-center text-xs border border-line dark:border-white/10 dark:bg-[#0B0E14] dark:text-[#E2E4ED]">
                      B
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#323243] dark:text-[#E2E4ED]">BriBooks</h4>
                      <span className="text-[10px] font-normal text-muted dark:text-[#94A3B8]">Internship with PPO</span>
                    </div>
                  </div>
                  <span className="rounded-full border border-line bg-canvas px-2 py-0.5 text-[10px] font-normal text-muted dark:border-white/10 dark:bg-[#0B0E14] dark:text-[#94A3B8]">
                    INTERVIEW
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs">
                  <p className="font-semibold text-[#323243] dark:text-[#E2E4ED]">4 Distinct Profiles</p>
                  <p className="text-[11px] font-normal text-muted dark:text-[#94A3B8]">Python Dev, Graphic Design, Outreach</p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-line dark:border-white/10 text-[10px]">
                  <span className="text-[#323243] font-medium dark:text-[#E2E4ED]">Round 1 Cleared</span>
                  <span className="font-normal text-muted dark:text-[#94A3B8]">Batch 2026, 2027</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 border-t border-line bg-canvas dark:border-white/10 dark:bg-[#0B0E14]">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-xs font-normal text-muted dark:text-[#94A3B8]">How it works</h2>
          <p className="mt-2 text-xl sm:text-3xl font-semibold text-[#323243] dark:text-[#E2E4ED]">Simple, private, fast</p>
        </div>

        <div className="grid grid-cols-1 min-[560px]:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-lg border border-line bg-white shadow-card p-4 dark:border-white/10 dark:bg-[#141824]">
            <div className="h-9 w-9 rounded-md bg-canvas border border-line text-primary flex items-center justify-center mb-3 dark:border-white/10 dark:bg-[#0B0E14]">
              <Mail className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#323243] dark:text-[#E2E4ED]">Targeted Gmail scan</h3>
            <p className="mt-1.5 text-xs font-normal text-muted dark:text-[#94A3B8] leading-relaxed">
              Only placement announcements from CRC are read. Personal emails are never opened or stored.
            </p>
          </div>

          <div className="rounded-lg border border-line bg-white shadow-card p-4 dark:border-white/10 dark:bg-[#141824]">
            <div className="h-9 w-9 rounded-md bg-canvas border border-line text-primary flex items-center justify-center mb-3 dark:border-white/10 dark:bg-[#0B0E14]">
              <HardDrive className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#323243] dark:text-[#E2E4ED]">Your Drive, your data</h3>
            <p className="mt-1.5 text-xs font-normal text-muted dark:text-[#94A3B8] leading-relaxed">
              Everything lives in <code className="text-[#323243] bg-canvas px-1 py-0.5 rounded text-[11px] border border-line dark:border-white/10 dark:bg-[#0B0E14] dark:text-[#CBD5E1]">PlacementWire_Data/placements.json</code> inside your own Google Drive.
            </p>
          </div>

          <div className="rounded-lg border border-line bg-white shadow-card p-4 dark:border-white/10 dark:bg-[#141824]">
            <div className="h-9 w-9 rounded-md bg-canvas border border-line text-primary flex items-center justify-center mb-3 dark:border-white/10 dark:bg-[#0B0E14]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#323243] dark:text-[#E2E4ED]">Track and apply</h3>
            <p className="mt-1.5 text-xs font-normal text-muted dark:text-[#94A3B8] leading-relaxed">
              Move drives from New to Applied to Interview. Apply buttons open the official form and update status.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
