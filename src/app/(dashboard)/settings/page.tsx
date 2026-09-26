'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  HardDrive,
  ShieldCheck,
  LogOut,
  Trash2,
  CheckCircle,
  GraduationCap,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/components/theme/ThemeProvider';
import { CACHE_KEY as PLACEMENTS_CACHE_KEY } from '@/hooks/use-placements';
import { extractDegrees } from '@/lib/utils/course';
import { PlacementDrive } from '@/schemas/placement.schema';

const COURSE_PREF_KEY = 'pw_course_pref';
const FALLBACK_DEGREES = ['BTECH', 'MTECH', 'MBA', 'MCA', 'BCA', 'BBA'];

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [driveInfo, setDriveInfo] = useState<any>(null);
  const [availableDegrees, setAvailableDegrees] = useState<string[]>(FALLBACK_DEGREES);
  const [coursePref, setCoursePref] = useState<string[]>([]);
  const [prefSaved, setPrefSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COURSE_PREF_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCoursePref(parsed.filter((x) => typeof x === 'string'));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetch('/api/v1/drive/status')
      .then((res) => res.json())
      .then((data) => setDriveInfo(data))
      .catch(() => {});

    // Derive the course list from the locally cached drives (no API change).
    try {
      const raw = localStorage.getItem(PLACEMENTS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const drives: PlacementDrive[] = parsed.drives || [];
        const degrees = extractDegrees(drives);
        if (degrees.length > 0) setAvailableDegrees(degrees);
      }
    } catch {
      /* keep fallback list */
    }
  }, []);

  const toggleDegree = (deg: string) => {
    setCoursePref((prev) => {
      const next = prev.includes(deg) ? prev.filter((d) => d !== deg) : [...prev, deg];
      localStorage.setItem(COURSE_PREF_KEY, JSON.stringify(next));
      setPrefSaved(true);
      setTimeout(() => setPrefSaved(false), 2000);
      return next;
    });
  };

  const clearPref = () => {
    setCoursePref([]);
    localStorage.setItem(COURSE_PREF_KEY, JSON.stringify([]));
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 2000);
  };

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect your Google account and log out?')) {
      await fetch('/api/v1/auth/disconnect', { method: 'POST' });
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-canvas text-[#323243] p-3 min-[400px]:p-4 sm:p-6 lg:p-8 2xl:p-10 dark:bg-[#0B0E14] dark:text-[#E2E4ED]">
      <div className="mx-auto max-w-6xl xl:max-w-7xl 3xl:max-w-[1500px] space-y-4 sm:space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-[#323243] dark:text-[#E2E4ED]">Settings</h1>
            <p className="mt-0.5 text-xs font-normal text-muted dark:text-[#94A3B8]">
              Profile, storage, course preferences and session.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex shrink-0 h-9 items-center gap-1.5 rounded-md border border-line bg-white px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[#323243] shadow-card transition-colors duration-150 hover:border-primary hover:text-primary dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#E2E4ED]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden min-[400px]:inline">Back to Dashboard</span>
            <span className="min-[400px]:hidden">Back</span>
          </Link>
        </div>

        <div className="grid items-start gap-3 sm:gap-4 lg:grid-cols-2">
          <div className="min-w-0 space-y-3 sm:space-y-4">
        <div className="rounded-lg border border-line bg-white p-4 shadow-card sm:p-5 space-y-4 dark:border-[#1F2430] dark:bg-[#141824]">
          <div className="flex items-center gap-2 border-b border-line dark:border-[#1F2430] pb-3">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-[#323243] dark:text-[#E2E4ED]">College Identity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted dark:text-[#94A3B8] block text-[11px] font-normal">Full Name</span>
              <span className="font-semibold text-[#323243] dark:text-[#E2E4ED] text-sm mt-0.5 block">{user?.name || 'Loading...'}</span>
            </div>
            <div>
              <span className="text-muted dark:text-[#94A3B8] block text-[11px] font-normal">College Email</span>
              <span className="font-semibold text-[#323243] dark:text-[#E2E4ED] text-sm mt-0.5 block break-all">{user?.email || 'Loading...'}</span>
            </div>
            <div>
              <span className="text-muted dark:text-[#94A3B8] block text-[11px] font-normal">Domain</span>
              <span className="inline-flex items-center gap-1 text-success font-normal mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5" /> @saitm.ac.in (Verified)
              </span>
            </div>
            <div>
              <span className="text-muted dark:text-[#94A3B8] block text-[11px] font-normal">Account Type</span>
              <span className="text-[#323243] dark:text-[#E2E4ED] font-semibold mt-0.5 block">
                {user?.isMockUser ? 'Demo Account' : 'Google Workspace Account'}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-4 shadow-card sm:p-5 space-y-4 dark:border-[#1F2430] dark:bg-[#141824]">
          <div className="flex items-center gap-2 border-b border-line dark:border-[#1F2430] pb-3">
            <HardDrive className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-[#323243] dark:text-[#E2E4ED]">Drive Storage</h2>
          </div>

          <p className="text-xs font-normal text-muted dark:text-[#94A3B8] leading-relaxed">
            Records, notes and statuses live in your personal Google Drive. No central database.
          </p>

          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3 text-xs">
            <div className="rounded-md border border-line bg-canvas p-3 dark:border-[#1F2430] dark:bg-[#0B0E14]">
              <span className="text-[11px] font-normal text-muted dark:text-[#94A3B8]">Folder</span>
              <span className="font-mono text-xs font-normal text-[#323243] dark:text-[#E2E4ED] block mt-1 break-all">
                {driveInfo?.folderName || 'PlacementWire_Data'}
              </span>
            </div>
            <div className="rounded-md border border-line bg-canvas p-3 dark:border-[#1F2430] dark:bg-[#0B0E14]">
              <span className="text-[11px] font-normal text-muted dark:text-[#94A3B8]">Data File</span>
              <span className="font-mono text-xs font-normal text-[#323243] dark:text-[#E2E4ED] block mt-1 break-all">
                {driveInfo?.fileName || 'placements.json'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-success font-normal">
            <CheckCircle className="h-4 w-4" />
            <span>Synced with local caching.</span>
          </div>
        </div>
          </div>

          <div className="space-y-4">

        {/* Course Preferences */}
        <div className="rounded-lg border border-line bg-white p-4 shadow-card sm:p-5 space-y-4 dark:border-[#1F2430] dark:bg-[#141824]">
          <div className="flex items-center justify-between border-b border-line dark:border-[#1F2430] pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-[#323243] dark:text-[#E2E4ED]">Course Preferences</h2>
            </div>
            {prefSaved && (
              <span className="flex items-center gap-1 text-[11px] text-success font-normal">
                <CheckCircle className="h-3 w-3" /> Saved
              </span>
            )}
          </div>

          <p className="text-xs font-normal text-muted dark:text-[#94A3B8] leading-relaxed">
            Select your courses once — the dashboard will only show matching drives, no manual
            filtering needed. Drives without course info are always shown so nothing is missed.
          </p>

          <div className="flex flex-wrap gap-2">
            {availableDegrees.map((deg) => {
              const selected = coursePref.includes(deg);
              return (
                <button
                  key={deg}
                  type="button"
                  onClick={() => toggleDegree(deg)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ${
                    selected
                      ? 'bg-primary text-white shadow-sm'
                      : 'border border-line bg-canvas text-muted hover:border-primary hover:text-primary dark:border-[#1F2430] dark:bg-[#0B0E14] dark:text-[#94A3B8]'
                  }`}
                >
                  {deg}
                </button>
              );
            })}
          </div>

          {coursePref.length > 0 && (
            <button
              type="button"
              onClick={clearPref}
              className="text-[11px] font-normal text-muted transition-colors duration-150 hover:text-error dark:text-[#94A3B8]"
            >
              Clear selection (show all courses)
            </button>
          )}
        </div>

        {/* Appearance & Theme */}
        <div className="rounded-lg border border-line bg-white p-4 shadow-card sm:p-5 space-y-4 dark:border-[#1F2430] dark:bg-[#141824]">
          <div className="flex items-center gap-2 border-b border-line dark:border-[#1F2430] pb-3">
            <Sun className="h-4 w-4 text-primary dark:hidden" />
            <Moon className="hidden h-4 w-4 text-primary dark:block" />
            <h2 className="text-sm font-semibold text-[#323243] dark:text-[#E2E4ED]">Appearance & Theme</h2>
          </div>
          <p className="text-xs font-normal text-muted dark:text-[#94A3B8] leading-relaxed">
            Select light or dark interface theme, or match your system settings.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Laptop },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id as any)}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border py-3 px-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'border-primary bg-primary-soft text-primary shadow-sm font-semibold dark:bg-primary/20'
                      : 'border-line bg-canvas text-muted hover:border-primary/50 hover:text-[#323243] dark:border-[#1F2430] dark:bg-[#0B0E14] dark:text-[#94A3B8] dark:hover:text-[#E2E4ED]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-error/30 bg-error-soft p-4 shadow-card space-y-4 dark:bg-error/10 dark:border-error/20">
          <h2 className="text-sm font-semibold text-error">Session</h2>
          <p className="text-xs font-normal text-muted dark:text-[#94A3B8]">
            Sign out or revoke Google access.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={logout}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-white px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[#323243] shadow-card hover:border-primary hover:text-primary transition-colors duration-150 dark:border-[#1F2430] dark:bg-[#141824] dark:text-[#E2E4ED]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>

            <button
              onClick={handleDisconnect}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-error px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity duration-150"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Disconnect Google Account</span>
            </button>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
