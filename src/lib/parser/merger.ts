import { PlacementDrive } from '@/schemas/placement.schema';

export interface MergeResult {
  mergedDrives: PlacementDrive[];
  addedCount: number;
  updatedCount: number;
  unchangedCount: number;
}

/**
 * Merges newly parsed placement drives into existing drives list.
 * Crucially preserves user customizations (status, notes, starred, archived, read state).
 */
export function mergePlacementDrives(
  existingDrives: PlacementDrive[],
  newDrives: PlacementDrive[]
): MergeResult {
  const existingMap = new Map<string, PlacementDrive>();
  for (const drive of existingDrives) {
    existingMap.set(drive.id, drive);
  }

  let addedCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;

  for (const incoming of newDrives) {
    if (existingMap.has(incoming.id)) {
      const existing = existingMap.get(incoming.id)!;

      // Preserve user-modified state
      const merged: PlacementDrive = {
        ...incoming,
        // Preserve user state
        status: existing.status,
        user_notes: existing.user_notes,
        starred: existing.starred,
        archived: existing.archived,
        is_read: existing.is_read,
        created_at: existing.created_at,
        updated_at: new Date().toISOString(),
      };

      existingMap.set(incoming.id, merged);
      updatedCount++;
    } else {
      existingMap.set(incoming.id, incoming);
      addedCount++;
    }
  }

  unchangedCount = existingDrives.length - (updatedCount);

  return {
    mergedDrives: Array.from(existingMap.values()),
    addedCount,
    updatedCount,
    unchangedCount: Math.max(0, unchangedCount),
  };
}
