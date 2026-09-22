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
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { CACHE_KEY as PLACEMENTS_CACHE_KEY } from '@/hooks/use-placements';
import { extractDegrees } from '@/lib/utils/course';
import { PlacementDrive } from '@/schemas/placement.schema';

const COURSE_PREF_KEY = 'pw_course_pref';
const FALLBACK_DEGREES = ['BTECH', 'MTECH', 'MBA', 'MCA', 'BCA', 'BBA'];

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
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
    <div className="min-h-screen bg-ink text-neutral-200 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Settings</h1>
            <p className="mt-0.5 text-xs text-neutral-500">
              Profile, storage, course preferences and session.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-ink-card px-3.5 py-2 text-xs font-semibold text-neutral-200 transition-colors duration-150 hover:border-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-ink-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <User className="h-4 w-4 text-violet-300" />
            <h2 className="text-sm font-bold text-white">College Identity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-neutral-500 block text-[11px]">Full Name</span>
              <span className="font-semibold text-neutral-200 text-sm mt-0.5 block">{user?.name || 'Loading...'}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">College Email</span>
              <span className="font-semibold text-neutral-200 text-sm mt-0.5 block break-all">{user?.email || 'Loading...'}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">Domain</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5" /> @saitm.ac.in (Verified)
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">Account Type</span>
              <span className="text-neutral-300 font-semibold mt-0.5 block">
                {user?.isMockUser ? 'Demo Account' : 'Google Workspace Account'}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-ink-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <HardDrive className="h-4 w-4 text-violet-300" />
            <h2 className="text-sm font-bold text-white">Drive Storage</h2>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            Records, notes and statuses live in your personal Google Drive. No central database.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <span className="text-[11px] text-neutral-500">Folder</span>
              <span className="font-mono text-xs font-semibold text-neutral-300 block mt-1 break-all">
                {driveInfo?.folderName || 'PlacementWire_Data'}
              </span>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <span className="text-[11px] text-neutral-500">Data File</span>
              <span className="font-mono text-xs font-semibold text-neutral-300 block mt-1 break-all">
                {driveInfo?.fileName || 'placements.json'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <CheckCircle className="h-4 w-4" />
            <span>Synced with local caching.</span>
          </div>
        </div>
          </div>

          <div className="space-y-4">

        {/* Course Preferences */}
        <div className="rounded-xl border border-white/10 bg-ink-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-violet-300" />
              <h2 className="text-sm font-bold text-white">Course Preferences</h2>
            </div>
            {prefSaved && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle className="h-3 w-3" /> Saved
              </span>
            )}
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
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
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                    selected
                      ? 'bg-brandviolet text-white'
                      : 'border border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:border-white/20'
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
              className="text-[11px] font-semibold text-neutral-500 transition-colors duration-150 hover:text-rose-300"
            >
              Clear selection (show all courses)
            </button>
          )}
        </div>

        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5 space-y-4">
          <h2 className="text-sm font-bold text-rose-300">Session</h2>
          <p className="text-xs text-neutral-500">
            Sign out or revoke Google access.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-neutral-200 hover:bg-white/10 transition-colors duration-150"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>

            <button
              onClick={handleDisconnect}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors duration-150"
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
