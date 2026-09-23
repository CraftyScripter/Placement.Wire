'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PlacementDrive, ApplicationStatus, PlacementFile } from '@/schemas/placement.schema';

// Bumped to v2 because v1 cache rows contain deadlines corrupted by the old
// timezone-dependent parser (IST parses stored "23 September" as 22nd).
// v1 is deleted on load so stale dates can never resurface.
export const CACHE_KEY = 'pw_placements_cache_v2';
const LEGACY_CACHE_KEY = 'pw_placements_cache_v1';
const DEBOUNCE_DELAY_MS = 2000;

export type SyncState = 'synced' | 'syncing' | 'saved_locally' | 'error';

export function usePlacements() {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncingMails, setIsSyncingMails] = useState<boolean>(false);
  const [revision, setRevision] = useState<number>(1);
  const [syncError, setSyncError] = useState<string | null>(null);

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestDrivesRef = useRef<PlacementDrive[]>([]);
  latestDrivesRef.current = drives;

  // 1. Initial Load: Read from LocalStorage cache, then fetch from API
  useEffect(() => {
    let cachedDrives: PlacementDrive[] = [];

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(LEGACY_CACHE_KEY);
      } catch {
        /* storage unavailable */
      }
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed.drives)) {
            const valid = parsed.drives.filter((d: PlacementDrive) => {
              const s = d.source?.sender?.toLowerCase() || '';
              return s.includes('placements@saitm.org') || s.includes('placements@saitm.ac.in');
            });
            cachedDrives = valid;
            setDrives(valid);
            latestDrivesRef.current = valid;
            setLastSyncedAt(parsed.last_synced_at || null);
            setRevision(parsed.revision || 1);
            setIsLoading(false);
          }
        }
      } catch (e) {
        console.warn('Failed to parse local placement cache:', e);
      }
    }

    // Fetch from Google Drive API
    fetch('/api/v1/placements')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch from Google Drive');
        const json = await res.json();
        if (json.data && Array.isArray(json.data.drives)) {
          const valid = json.data.drives.filter((d: PlacementDrive) => {
            const s = d.source?.sender?.toLowerCase() || '';
            return s.includes('placements@saitm.org') || s.includes('placements@saitm.ac.in');
          });
          setDrives(valid);
          latestDrivesRef.current = valid;
          setLastSyncedAt(json.data.last_synced_at);
          setRevision(json.data.revision || 1);
          setSyncState('synced');

          // Save to local cache
          if (typeof window !== 'undefined') {
            localStorage.setItem(CACHE_KEY, JSON.stringify(json.data));
          }
        }
      })
      .catch((err) => {
        console.warn('Initial Drive fetch fallback to cache:', err);
        if (cachedDrives.length > 0) {
          setSyncState('saved_locally');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // 2. Debounced save to Google Drive
  const scheduleDriveSync = useCallback((updatedDrives: PlacementDrive[], currentRev: number) => {
    setSyncState('saved_locally');

    // Update local cache immediately
    if (typeof window !== 'undefined') {
      const payload: PlacementFile = {
        app: 'PlacementWire',
        version: '1.0',
        last_synced_at: new Date().toISOString(),
        revision: currentRev,
        drives: updatedDrives,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      setSyncState('syncing');
      setSyncError(null);

      try {
        const payload: PlacementFile = {
          app: 'PlacementWire',
          version: '1.0',
          last_synced_at: new Date().toISOString(),
          revision: currentRev,
          drives: latestDrivesRef.current,
        };

        const res = await fetch('/api/v1/placements', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error('Drive sync request failed');
        }

        const json = await res.json();
        setSyncState('synced');
        setLastSyncedAt(json.data?.last_synced_at || new Date().toISOString());
        if (json.data?.revision) {
          setRevision(json.data.revision);
        }
      } catch (err: any) {
        console.error('Debounced Drive sync error:', err);
        setSyncState('error');
        setSyncError('Could not sync to Google Drive. Changes saved locally.');
      }
    }, DEBOUNCE_DELAY_MS);
  }, []);

  // Mutation: Update Application Status
  const updateStatus = useCallback(
    (id: string, newStatus: ApplicationStatus) => {
      setDrives((prev) => {
        const updated = prev.map((drive) =>
          drive.id === id ? { ...drive, status: newStatus, updated_at: new Date().toISOString() } : drive
        );
        scheduleDriveSync(updated, revision);
        return updated;
      });
    },
    [scheduleDriveSync, revision]
  );

  // Mutation: Toggle Star
  const toggleStar = useCallback(
    (id: string) => {
      setDrives((prev) => {
        const updated = prev.map((drive) =>
          drive.id === id ? { ...drive, starred: !drive.starred, updated_at: new Date().toISOString() } : drive
        );
        scheduleDriveSync(updated, revision);
        return updated;
      });
    },
    [scheduleDriveSync, revision]
  );

  // Mutation: Toggle Archive
  const toggleArchive = useCallback(
    (id: string) => {
      setDrives((prev) => {
        const updated = prev.map((drive) => {
          if (drive.id !== id) return drive;
          const nextArchived = !drive.archived;
          return {
            ...drive,
            archived: nextArchived,
            status: nextArchived ? ('ARCHIVED' as const) : ('NEW' as const),
            updated_at: new Date().toISOString(),
          };
        });
        scheduleDriveSync(updated, revision);
        return updated;
      });
    },
    [scheduleDriveSync, revision]
  );

  // Mutation: Update Notes
  const updateNotes = useCallback(
    (id: string, notes: string) => {
      setDrives((prev) => {
        const updated = prev.map((drive) =>
          drive.id === id ? { ...drive, user_notes: notes, updated_at: new Date().toISOString() } : drive
        );
        scheduleDriveSync(updated, revision);
        return updated;
      });
    },
    [scheduleDriveSync, revision]
  );

  // Mutation: Apply Now Workflow
  const applyToDrive = useCallback(
    (id: string) => {
      const targetDrive = drives.find((d) => d.id === id);
      if (!targetDrive || !targetDrive.apply_url) return;

      // 1. Open external link securely
      window.open(targetDrive.apply_url, '_blank', 'noopener,noreferrer');

      // 2. Mark as APPLIED
      updateStatus(id, 'APPLIED');
    },
    [drives, updateStatus]
  );

  // Trigger Gmail Sync — drains the mailbox by chaining sync invocations
  // until the server reports hasMore=false. The server caps each invocation
  // at 25 new mails (Gmail quota protection), so a single POST can never
  // fetch 60 mails at once; without this loop production always lags behind
  // a localhost whose Drive file was built up over many manual syncs.
  const syncMails = useCallback(async () => {
    setIsSyncingMails(true);
    setSyncError(null);

    try {
      let liveDrives = latestDrivesRef.current.length > 0 ? latestDrivesRef.current : drives;
      let totalAdded = 0;
      let totalUpdated = 0;
      let lastWarning: string | undefined;
      let lastSynced: string | null = null;

      // At most 10 chained calls = up to 250 mails per button press.
      for (let i = 0; i < 10; i++) {
        const res = await fetch('/api/v1/gmail/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentDrives: liveDrives }),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.message || 'Gmail sync failed');
        }

        const json = await res.json();

        if (json.warning) {
          lastWarning = json.warning;
          setSyncError(json.warning);
        }

        totalAdded += json.addedCount || 0;
        totalUpdated += json.updatedCount || 0;

        if (Array.isArray(json.drives)) {
          liveDrives = json.drives;
          setDrives(json.drives);
          latestDrivesRef.current = json.drives;
          lastSynced = json.syncedAt || new Date().toISOString();
          setLastSyncedAt(lastSynced);
          setSyncState('synced');

          if (typeof window !== 'undefined') {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                app: 'PlacementWire',
                version: '1.0',
                last_synced_at: lastSynced,
                revision,
                drives: json.drives,
              })
            );
          }
        }

        if (!json.hasMore || (json.remainingCount || 0) <= 0) break;
      }

      return {
        success: true,
        addedCount: totalAdded,
        updatedCount: totalUpdated,
        hasMore: false,
        remainingCount: 0,
        warning: lastWarning,
      };
    } catch (err: any) {
      console.error('Manual Gmail sync error:', err);
      const message = err?.message || 'Gmail sync failed. Check your connection.';
      setSyncError(message);
      return { success: false, addedCount: 0, updatedCount: 0, hasMore: false, remainingCount: 0, error: message };
    } finally {
      setIsSyncingMails(false);
    }
  }, [drives, revision]);

  return {
    drives,
    isLoading,
    isSyncingMails,
    syncState,
    syncError,
    lastSyncedAt,
    updateStatus,
    toggleStar,
    toggleArchive,
    updateNotes,
    applyToDrive,
    syncMails,
  };
}
