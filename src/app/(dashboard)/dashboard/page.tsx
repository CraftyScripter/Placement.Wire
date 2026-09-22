'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Bell, Menu, RefreshCw, Check, AlertCircle, CheckCircle2, Cloud, X } from 'lucide-react';
import { Sidebar, NavKey } from '@/components/layout/Sidebar';
import { NotificationPanel } from '@/components/dashboard/NotificationPanel';
import { StatCards } from '@/components/dashboard/StatCards';
import {
  FilterBar,
  ViewMode,
  PillKey,
  FilterCriteria,
} from '@/components/dashboard/FilterBar';
import { JobCard } from '@/components/dashboard/JobCard';
// Below-the-fold / on-demand chunks: excluded from the initial dashboard
// bundle so first paint stays fast. The modal returns null until opened,
// so lazy-loading it costs nothing on load.
const PlacementCardView = dynamic(
  () => import('@/components/cards/PlacementCardView').then((m) => m.PlacementCardView),
  { ssr: false, loading: () => <CardsFallback /> }
);
const PlacementDetailModal = dynamic(
  () => import('@/components/placements/PlacementDetailModal').then((m) => m.PlacementDetailModal),
  { ssr: false }
);

function CardsFallback() {
  return (
    <div className="grid grid-cols-1 min-[560px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-3 sm:gap-4 3xl:gap-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-56 animate-pulse rounded-2xl border border-white/5 bg-ink-card" />
      ))}
    </div>
  );
}
import { EmptyState } from '@/components/shared/EmptyState';
import { usePlacements } from '@/hooks/use-placements';
import { useAuth } from '@/hooks/use-auth';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useAutoSync } from '@/hooks/use-auto-sync';
import { resolveDeadlineMs } from '@/lib/utils/deadline';
import { driveMatchesPref } from '@/lib/utils/course';
import { PlacementDrive } from '@/schemas/placement.schema';

const PAGE_SIZE = 15;

const NAV_PRESETS: Record<NavKey, { category: string; status: string }> = {
  dashboard: { category: 'ALL', status: 'ALL' },
  applications: { category: 'ALL', status: 'MY_APPLICATIONS' },
  placements: { category: 'FINAL_PLACEMENT', status: 'ALL' },
  internships: { category: 'INTERNSHIP', status: 'ALL' },
  hackathons: { category: 'HACKATHON', status: 'ALL' },
  trainings: { category: 'TRAINING', status: 'ALL' },
  starred: { category: 'ALL', status: 'STARRED' },
  archived: { category: 'ALL', status: 'ARCHIVED' },
};

const PILL_PRESETS: Record<PillKey, { category: string; status: string }> = {
  all: { category: 'ALL', status: 'ALL' },
  active: { category: 'ALL', status: 'ACTIVE' },
  expiring: { category: 'ALL', status: 'EXPIRING_SOON' },
  internship: { category: 'INTERNSHIP', status: 'ALL' },
  fulltime: { category: 'FINAL_PLACEMENT', status: 'ALL' },
};

const HEADINGS: Record<string, string> = {
  MY_APPLICATIONS: 'My Applications',
  STARRED: 'Starred',
  ARCHIVED: 'Archived',
  ACTIVE: 'Active Drives',
  EXPIRING_SOON: 'Expiring Soon',
  FINAL_PLACEMENT: 'Placements',
  INTERNSHIP: 'Internships',
  HACKATHON: 'Hackathons',
  TRAINING: 'Trainings',
};

function deriveNav(filters: FilterCriteria): NavKey {
  for (const [key, preset] of Object.entries(NAV_PRESETS)) {
    if (preset.category === filters.category && preset.status === filters.status) {
      return key as NavKey;
    }
  }
  return 'dashboard';
}

function derivePill(filters: FilterCriteria): PillKey | null {
  for (const [key, preset] of Object.entries(PILL_PRESETS)) {
    if (preset.category === filters.category && preset.status === filters.status) {
      return key as PillKey;
    }
  }
  return null;
}

function deriveHeading(filters: FilterCriteria): string {
  if (filters.status !== 'ALL' && HEADINGS[filters.status]) return HEADINGS[filters.status];
  if (filters.category !== 'ALL' && HEADINGS[filters.category]) return HEADINGS[filters.category];
  return 'Recommended for you';
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();

  // Unauthenticated visits must not see cached drives: no session means
  // every API call 401s, so bounce to /login (covers expired/tampered
  // cookies that pass the middleware cookie-presence check).
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);
  const {
    drives,
    isLoading,
    isSyncingMails,
    syncState,
    syncError,
    updateStatus,
    toggleStar,
    toggleArchive,
    updateNotes,
    applyToDrive,
    syncMails,
  } = usePlacements();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Notification read/dismiss state (persisted; loaded post-mount, see below)
  const [notifState, setNotifState] = useState<{ read: string[]; dismissed: string[] }>({
    read: [],
    dismissed: [],
  });

  // Seen drives (persisted) — powers the "NEW" highlight + bell arrivals.
  const [seenIds, setSeenIds] = useState<string[]>([]);

  // Course preference from Settings (personalized base filter).
  const [coursePref, setCoursePref] = useState<string[]>([]);

  // Mounted flag is no longer needed (no persist effects — see below).

  const writeNotifState = (next: { read: string[]; dismissed: string[] }) => {
    setNotifState(next);
    // Write-through: persists synchronously at click time. There is
    // deliberately NO persist effect — effects re-run on StrictMode remounts
    // with pre-load defaults and would overwrite saved data.
    try {
      localStorage.setItem('pw_notif_state', JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };

  const markNotifRead = (id: string) => {
    if (notifState.read.includes(id)) return;
    writeNotifState({ ...notifState, read: [...notifState.read, id] });
  };
  const markAllNotifRead = (ids: string[]) =>
    writeNotifState({ ...notifState, read: Array.from(new Set([...notifState.read, ...ids])) });
  const dismissNotif = (id: string) => {
    if (notifState.dismissed.includes(id)) return;
    writeNotifState({ ...notifState, dismissed: [...notifState.dismissed, id] });
  };
  const clearAllNotifs = (ids: string[]) =>
    writeNotifState({
      ...notifState,
      dismissed: Array.from(new Set([...notifState.dismissed, ...ids])),
    });

  const markSeen = (id: string) => {
    if (seenIds.includes(id)) return;
    const next = [...seenIds.slice(-499), id];
    setSeenIds(next);
    // Write-through (see above — no persist effect on purpose).
    try {
      localStorage.setItem('pw_seen_ids', JSON.stringify(next.slice(-500)));
    } catch {
      /* storage unavailable */
    }
  };

  // Loader only READS (see above — no persist effects on purpose).
  useEffect(() => {
    try {
      const vm = localStorage.getItem('pw_view_mode');
      if (vm === 'cards' || vm === 'list') setViewMode(vm);
      const ns = localStorage.getItem('pw_notif_state');
      if (ns) {
        const p = JSON.parse(ns);
        if (Array.isArray(p.read) && Array.isArray(p.dismissed)) setNotifState(p);
      }
      const sid = localStorage.getItem('pw_seen_ids');
      if (sid) {
        const p = JSON.parse(sid);
        if (Array.isArray(p)) setSeenIds(p.filter((x) => typeof x === 'string'));
      }
      const cp = localStorage.getItem('pw_course_pref');
      if (cp) {
        const p = JSON.parse(cp);
        if (Array.isArray(p)) setCoursePref(p.filter((x) => typeof x === 'string'));
      }
    } catch {
      /* ignore corrupt state */
    }
  }, []);

  const handleSelectDrive = (d: PlacementDrive) => {
    setSelectedDrive(d);
    markSeen(d.id);
  };

  const [filters, setFilters] = useState<FilterCriteria>({
    query: '',
    category: 'ALL',
    status: 'ALL',
    batch: 'ALL',
    sortBy: 'newest_received',
  });

  const clearCoursePref = () => {
    setCoursePref([]);
    localStorage.setItem('pw_course_pref', JSON.stringify([]));
  };

  // Close bell dropdown on outside click / Escape
  useEffect(() => {
    if (!bellOpen) return;
    const onDown = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBellOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [bellOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApply = (id: string) => {
    const target = drives.find((d) => d.id === id);
    if (!target) return;
    applyToDrive(id);
    showToast(`Application form opened. Marked ${target.company} as Applied!`);
  };

  const handleManualSync = async () => {
    const res = await syncMails();
    if (res?.success) {
      showToast(res.warning || `Scan complete! ${res.addedCount} new, ${res.updatedCount} updated.`);
    } else {
      showToast(res?.error || 'Could not scan mailbox. Check Google authorization.');
    }
  };

  const handleNavigate = (nav: NavKey) => {
    const preset = NAV_PRESETS[nav];
    setFilters((f) => ({ ...f, category: preset.category, status: preset.status }));
    window.scrollTo({ top: 0 });
  };

  const handlePill = (pill: PillKey) => {
    const preset = PILL_PRESETS[pill];
    setFilters((f) => ({ ...f, category: preset.category, status: preset.status }));
    window.scrollTo({ top: 0 });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('pw_view_mode', mode);
    } catch {
      /* storage unavailable */
    }
    window.scrollTo({ top: 0 });
  };

  // Preference-filtered base: sidebar counts + stats describe your view,
  // so every number on screen stays consistent.
  const prefBase = useMemo(
    () => drives.filter((d) => driveMatchesPref(d, coursePref)),
    [drives, coursePref]
  );

  // Sidebar counts (respect the course preference — they describe your view)
  const counts = useMemo(() => {
    const base = prefBase;
    const c: Record<string, number> = {
      dashboard: base.length,
      applications: 0,
      placements: 0,
      internships: 0,
      hackathons: 0,
      trainings: 0,
      starred: 0,
      archived: 0,
    };
    for (const d of base) {
      if (['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED'].includes(d.status)) c.applications++;
      if (d.drive_type === 'FINAL_PLACEMENT') c.placements++;
      if (d.drive_type === 'INTERNSHIP' || d.drive_type === 'TRAINING') c.internships++;
      if (d.drive_type === 'HACKATHON') c.hackathons++;
      if (d.drive_type === 'TRAINING') c.trainings++;
      if (d.starred) c.starred++;
      if (d.status === 'ARCHIVED') c.archived++;
    }
    return c;
  }, [drives, coursePref]);

  // Expiring drives for the bell (dismissed ones hidden)
  const expiringDrives = useMemo(() => {
    const now = Date.now();
    return drives
      .filter((d) => {
        if (notifState.dismissed.includes(d.id)) return false;
        const expiry = resolveDeadlineMs(d.deadline, d.deadline_precision);
        if (expiry === null) return false;
        const diff = (expiry - now) / (1000 * 60 * 60);
        return diff > 0 && diff <= 48;
      })
      .sort(
        (a, b) =>
          (resolveDeadlineMs(a.deadline, a.deadline_precision) || 0) -
          (resolveDeadlineMs(b.deadline, b.deadline_precision) || 0)
      );
  }, [drives, notifState.dismissed]);

  const unreadCount = expiringDrives.filter((d) => !notifState.read.includes(d.id)).length;

  // Recent arrivals (last 7 days) for the bell. Seen ones stay visible
  // but dimmed — only dismiss removes them.
  const recentArrivalDrives = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return drives
      .filter((d) => {
        if (notifState.dismissed.includes(d.id)) return false;
        const ts = d.received_at || d.created_at;
        if (!ts) return false;
        return new Date(ts).getTime() >= cutoff;
      })
      .sort((a, b) => {
        const ta = new Date(a.received_at || a.created_at).getTime();
        const tb = new Date(b.received_at || b.created_at).getTime();
        return tb - ta;
      });
  }, [drives, notifState.dismissed]);

  // Unseen subset → NEW pills on cards + bell badge count.
  const newArrivalDrives = useMemo(
    () => recentArrivalDrives.filter((d) => !seenIds.includes(d.id)),
    [recentArrivalDrives, seenIds]
  );

  const newIds = useMemo(() => new Set(newArrivalDrives.map((d) => d.id)), [newArrivalDrives]);

  // Background Gmail polling (15 min, daytime IST, visible tab only).
  useAutoSync({
    enabled: !isLoading,
    canRun: !isLoading && !isSyncingMails,
    syncMails,
    onNewArrivals: (count) =>
      showToast(`${count} new ${count === 1 ? 'drive' : 'drives'} arrived. Check them out!`),
  });

  // Prune read/dismissed ids that are no longer relevant.
  // Skip while drives haven't loaded yet, otherwise the persisted
  // state would be wiped on every refresh.
  useEffect(() => {
    if (drives.length === 0) return;
    const liveIds = new Set(drives.map((d) => d.id));
    setNotifState((s) => {
      const read = s.read.filter((id) => liveIds.has(id));
      const dismissed = s.dismissed.filter((id) => liveIds.has(id));
      if (read.length === s.read.length && dismissed.length === s.dismissed.length) return s;
      return { read, dismissed };
    });
  }, [drives]);

  const extractNumericCtc = (drive: PlacementDrive): number => {
    const ctcStr = drive.positions[0]?.ctc;
    if (!ctcStr) return 0;
    const match = ctcStr.match(/(\d+(?:\.\d+)?)/);
    if (match && match[1]) {
      const num = parseFloat(match[1]);
      if (/month|stipend/i.test(ctcStr)) return num * 0.12;
      return num;
    }
    return 0;
  };

  const filteredAndSortedDrives = useMemo(() => {
    const q = filters.query.toLowerCase().trim();
    const now = Date.now();

    const filtered = drives.filter((drive) => {
      // Personalized base filter from Settings course preference
      if (!driveMatchesPref(drive, coursePref)) return false;

      if (q) {
        const companyMatch = drive.company.toLowerCase().includes(q);
        const rolesMatch = drive.positions.some((p) => p.role.toLowerCase().includes(q));
        const locMatch = drive.positions.some((p) => p.location?.toLowerCase().includes(q));
        const courseMatch = drive.positions.some((p) =>
          p.eligible_courses.some((c) => c.toLowerCase().includes(q))
        );
        const batchMatch = drive.positions.some((p) =>
          p.eligible_batches.some((b) => b.toString().includes(q))
        );
        if (!companyMatch && !rolesMatch && !locMatch && !courseMatch && !batchMatch) return false;
      }

      if (filters.category !== 'ALL') {
        if (filters.category === 'INTERNSHIP') {
          if (drive.drive_type !== 'INTERNSHIP' && drive.drive_type !== 'TRAINING') return false;
        } else if (drive.drive_type !== filters.category) {
          return false;
        }
      }

      if (filters.status === 'EXPIRING_SOON') {
        const expiry = resolveDeadlineMs(drive.deadline, drive.deadline_precision);
        if (expiry === null) return false;
        const diffHours = (expiry - now) / (1000 * 60 * 60);
        if (diffHours <= 0 || diffHours > 48) return false;
      } else if (filters.status === 'STARRED') {
        if (!drive.starred) return false;
      } else if (filters.status === 'ARCHIVED') {
        if (drive.status !== 'ARCHIVED') return false;
      } else if (filters.status === 'ACTIVE') {
        const expiry = resolveDeadlineMs(drive.deadline, drive.deadline_precision);
        const expired = expiry !== null && expiry < now;
        if (expired || drive.status === 'ARCHIVED' || drive.status === 'REJECTED') return false;
      } else if (filters.status === 'MY_APPLICATIONS') {
        if (!['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED'].includes(drive.status)) {
          return false;
        }
      } else if (filters.status !== 'ALL') {
        if (drive.status !== filters.status) return false;
      }

      if (filters.batch !== 'ALL') {
        const targetBatch = parseInt(filters.batch, 10);
        const hasBatch = drive.positions.some((p) => p.eligible_batches.includes(targetBatch));
        if (!hasBatch) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (filters.sortBy === 'newest_received') {
        const timeA = a.received_at ? new Date(a.received_at).getTime() : new Date(a.created_at).getTime();
        const timeB = b.received_at ? new Date(b.received_at).getTime() : new Date(b.created_at).getTime();
        return timeB - timeA;
      }
      if (filters.sortBy === 'deadline_urgent') {
        const timeA = resolveDeadlineMs(a.deadline, a.deadline_precision);
        const timeB = resolveDeadlineMs(b.deadline, b.deadline_precision);
        const isExpiredA = timeA ? timeA < now : true;
        const isExpiredB = timeB ? timeB < now : true;
        if (!isExpiredA && !isExpiredB) return (timeA || 0) - (timeB || 0);
        if (!isExpiredA && isExpiredB) return -1;
        if (isExpiredA && !isExpiredB) return 1;
        return (timeB || 0) - (timeA || 0);
      }
      if (filters.sortBy === 'ctc_high') {
        return extractNumericCtc(b) - extractNumericCtc(a);
      }
      if (filters.sortBy === 'company_asc') {
        return a.company.localeCompare(b.company);
      }
      return 0;
    });
  }, [drives, filters, coursePref]);

  // Chunked rendering
  const resetKey = JSON.stringify({
    q: filters.query,
    c: filters.category,
    s: filters.status,
    b: filters.batch,
    sort: filters.sortBy,
    v: viewMode,
  });
  const { visible, sentinelRef } = useInfiniteScroll(resetKey, PAGE_SIZE);
  const visibleDrives = filteredAndSortedDrives.slice(0, visible);
  const hasMore = visible < filteredAndSortedDrives.length;

  const activeSelectedDrive = useMemo(() => {
    if (!selectedDrive) return null;
    return drives.find((d) => d.id === selectedDrive.id) || selectedDrive;
  }, [selectedDrive, drives]);

  const activeNav = deriveNav(filters);
  const activePill = derivePill(filters);
  const heading = deriveHeading(filters);

  const syncLabel =
    syncState === 'synced'
      ? 'Drive Synced'
      : syncState === 'syncing'
      ? 'Syncing...'
      : syncState === 'saved_locally'
      ? 'Saved locally'
      : 'Sync pending';

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink text-neutral-500">
        <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-brandviolet" />
        <span className="text-xs font-medium">Checking student session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-ink text-neutral-200">
      <div className="mx-auto flex w-full gap-3 p-2.5 min-[400px]:gap-4 min-[400px]:p-3 sm:p-4 2xl:gap-6 2xl:p-6">
        <Sidebar
          activeNav={activeNav}
          onNavigate={handleNavigate}
          counts={counts}
          mobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          onLogout={logout}
          isAdmin={Boolean(user?.isAdmin)}
        />

        <main className="min-w-0 flex-1 space-y-4 sm:space-y-5 py-1 sm:py-4 lg:px-4 xl:px-6 3xl:px-10 3xl:space-y-6">
          {/* Header */}
          <header className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="shrink-0 rounded-xl bg-ink-card p-2.5 text-neutral-400 hover:text-white lg:hidden"
                title="Open menu"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden items-center gap-1.5 rounded-full bg-ink-card px-3 py-1.5 text-xs font-medium text-neutral-400 md:flex">
                {syncState === 'synced' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : syncState === 'syncing' ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
                ) : syncState === 'saved_locally' ? (
                  <Cloud className="h-3.5 w-3.5 text-sky-400" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                )}
                <span>{syncLabel}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              {/* Notifications */}
              <div ref={bellRef} className="relative">
                <button
                  type="button"
                  onClick={() => setBellOpen((v) => !v)}
                  aria-expanded={bellOpen}
                  aria-label="Notifications"
                  className={`relative rounded-xl p-2.5 transition-all duration-200 active:scale-90 ${
                    bellOpen ? 'bg-white/10 text-white' : 'bg-ink-card text-neutral-400 hover:text-white'
                  }`}
                  title="Notifications"
                >
                  <Bell className={`h-5 w-5 transition-transform duration-200 ${bellOpen ? 'rotate-12' : ''}`} />
                  {unreadCount + newArrivalDrives.length > 0 && (
                    <span
                      key={unreadCount + newArrivalDrives.length}
                      className="absolute -right-1 -top-1 flex h-5 min-w-[20px] animate-badge-pop items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white"
                    >
                      {unreadCount + newArrivalDrives.length}
                    </span>
                  )}
                </button>
                {bellOpen && (
                  <NotificationPanel
                    recentArrivals={recentArrivalDrives}
                    expiring={expiringDrives}
                    seenIds={seenIds}
                    readIds={notifState.read}
                    onSelectArrival={(d) => {
                      handleSelectDrive(d);
                      setBellOpen(false);
                    }}
                    onSelectExpiring={(d) => {
                      handleSelectDrive(d);
                      markNotifRead(d.id);
                      setBellOpen(false);
                    }}
                    onDismiss={dismissNotif}
                    onMarkAllRead={() => {
                      markAllNotifRead(expiringDrives.map((d) => d.id));
                      recentArrivalDrives.forEach((d) => markSeen(d.id));
                    }}
                    onClearAll={() => {
                      clearAllNotifs([
                        ...expiringDrives.map((d) => d.id),
                        ...recentArrivalDrives.map((d) => d.id),
                      ]);
                      setBellOpen(false);
                    }}
                    onClose={() => setBellOpen(false)}
                  />
                )}
              </div>

              <button
                onClick={handleManualSync}
                disabled={isSyncingMails}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brandviolet px-2.5 py-2.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-brandviolet-hover active:scale-95 disabled:opacity-50 sm:px-4"
                title="Scan college Gmail for new announcements"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncingMails ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isSyncingMails ? 'Scanning...' : 'Sync Mails'}</span>
              </button>

              {user && (
                <div className="flex shrink-0 items-center gap-2 rounded-xl bg-ink-card p-1.5 sm:py-1.5 sm:pl-1.5 sm:pr-3">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/10 text-xs font-bold text-violet-300">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>{user.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="hidden text-right md:block">
                    <p className="max-w-[120px] truncate text-xs font-semibold text-white">{user.name}</p>
                    <p className="max-w-[120px] truncate text-[10px] text-neutral-500">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          </header>

          {syncError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{syncError}</span>
            </div>
          )}

          <StatCards drives={prefBase} />

          {coursePref.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs">
              <span className="text-neutral-500">Showing only:</span>
              {coursePref.map((deg) => (
                <span
                  key={deg}
                  className="rounded-full bg-brandviolet/15 px-2.5 py-0.5 text-[11px] font-bold text-violet-300"
                >
                  {deg}
                </span>
              ))}
              <button
                type="button"
                onClick={clearCoursePref}
                title="Show all courses"
                className="rounded-full p-1 text-neutral-500 transition-colors duration-150 hover:bg-white/5 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <Link href="/settings" className="font-semibold text-violet-300 hover:text-white">
                Change
              </Link>
            </div>
          )}

          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            activePill={activePill}
            onPillChange={handlePill}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            heading={heading}
            resultCount={filteredAndSortedDrives.length}
          />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 text-center text-neutral-500">
              <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-brandviolet" />
              <span className="text-xs font-medium">Loading placement records...</span>
            </div>
          ) : drives.length === 0 ? (
            <EmptyState type="no_drives" onSyncMails={handleManualSync} isSyncingMails={isSyncingMails} />
          ) : filteredAndSortedDrives.length === 0 ? (
            <EmptyState
              type="no_filter_results"
              onResetFilters={() =>
                setFilters({ query: '', category: 'ALL', status: 'ALL', batch: 'ALL', sortBy: 'newest_received' })
              }
            />
          ) : (
            // Key remounts the view on toggle: fresh chunk window, fresh
            // sentinel observer, no stale item-count flash from the other view.
            <div key={viewMode}>
              {viewMode === 'cards' ? (
            <div>
              <PlacementCardView
                drives={visibleDrives}
                newIds={newIds}
                onSelectDrive={handleSelectDrive}
                onUpdateStatus={updateStatus}
                onToggleStar={toggleStar}
                onApply={handleApply}
              />
              {hasMore && <div ref={sentinelRef} className="flex justify-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-brandviolet" />
              </div>}
            </div>
          ) : (
            <div className="space-y-2.5 min-[1700px]:grid min-[1700px]:grid-cols-2 min-[1700px]:items-start min-[1700px]:gap-3 min-[1700px]:space-y-0">
              {visibleDrives.map((d) => (
                <JobCard
                  key={d.id}
                  drive={d}
                  isNew={newIds.has(d.id)}
                  onSelectDrive={handleSelectDrive}
                  onUpdateStatus={updateStatus}
                  onToggleStar={toggleStar}
                  onApply={handleApply}
                />
              ))}
              {hasMore && <div ref={sentinelRef} className="flex justify-center py-6 min-[1700px]:col-span-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-brandviolet" />
              </div>}
            </div>
              )}
            </div>
          )}
        </main>
      </div>

      <PlacementDetailModal
        drive={activeSelectedDrive}
        isOpen={Boolean(selectedDrive)}
        onClose={() => setSelectedDrive(null)}
        onUpdateStatus={updateStatus}
        onToggleStar={toggleStar}
        onToggleArchive={toggleArchive}
        onUpdateNotes={updateNotes}
        onApply={handleApply}
      />

      {toastMessage && (
        <div className="safe-bottom fixed bottom-4 left-4 right-4 z-50 flex animate-menu-fade items-center gap-2 rounded-xl border border-white/10 bg-ink-card px-4 py-3 text-xs font-semibold text-white shadow-menu sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm">
          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="min-w-0 break-words">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
