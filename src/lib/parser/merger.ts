import { PlacementDrive } from '@/schemas/placement.schema';

export interface MergeResult {
  mergedDrives: PlacementDrive[];
  addedCount: number;
  updatedCount: number;
  unchangedCount: number;
}

/**
 * Normalizes company names for deduplication (removes common legal suffixes and non-alphanumerics).
 * e.g. "RGF India Pvt. Ltd." -> "rgf", "Capgemini Technologies" -> "capgemini"
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\b(pvt|ltd|limited|private|inc|technologies|solutions|services|group|india)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

const GENERIC_COMPANIES = new Set([
  'campusopportunity',
  'placementnotice',
  'unknowncompany',
  'campusplacement',
  'placementdrive',
  'hiringnotice',
  'opportunity',
]);

/**
 * Determines whether two placement drives represent the same recruitment opportunity
 * (e.g. original announcement vs reminder vs shortlist vs interview update).
 */
export function isSameDrive(a: PlacementDrive, b: PlacementDrive): boolean {
  // 1. Direct ID match
  if (a.id === b.id) return true;

  // 2. Exact Gmail message ID match
  if (
    a.source?.gmail_message_id &&
    b.source?.gmail_message_id &&
    a.source.gmail_message_id === b.source.gmail_message_id
  ) {
    return true;
  }

  // 3. Gmail Conversation Thread match (emails in the same thread are the same drive)
  if (
    a.source?.gmail_thread_id &&
    b.source?.gmail_thread_id &&
    a.source.gmail_thread_id === b.source.gmail_thread_id
  ) {
    return true;
  }

  // 4. Normalized Company Name match
  const normA = normalizeCompanyName(a.company);
  const normB = normalizeCompanyName(b.company);

  if (
    normA &&
    normB &&
    !GENERIC_COMPANIES.has(normA) &&
    !GENERIC_COMPANIES.has(normB) &&
    normA === normB
  ) {
    // If both have explicit apply URLs and they match
    if (a.apply_url && b.apply_url && a.apply_url === b.apply_url) {
      return true;
    }

    // If announced within 90 days of each other (same placement season)
    const dateA = new Date(a.received_at || a.created_at).getTime();
    const dateB = new Date(b.received_at || b.created_at).getTime();
    if (!isNaN(dateA) && !isNaN(dateB)) {
      const diffDays = Math.abs(dateA - dateB) / (1000 * 60 * 60 * 24);
      if (diffDays <= 90) {
        return true;
      }
    } else {
      return true;
    }
  }

  return false;
}

/**
 * Merges newly parsed placement drives into existing drives list.
 * Deduplicates by:
 * 1. Placement ID
 * 2. Gmail Message ID
 * 3. Gmail Thread ID (reminders/updates in same conversation)
 * 4. Company name within placement season
 *
 * Crucially preserves user customizations (status, notes, starred, archived, read state).
 */
export function mergePlacementDrives(
  existingDrives: PlacementDrive[],
  newDrives: PlacementDrive[]
): MergeResult {
  // 1. First consolidate existing drives to clean up any duplicates from earlier syncs
  const consolidatedExisting: PlacementDrive[] = [];
  for (const drive of existingDrives) {
    const existingIdx = consolidatedExisting.findIndex((d) => isSameDrive(d, drive));
    if (existingIdx >= 0) {
      const prev = consolidatedExisting[existingIdx];
      consolidatedExisting[existingIdx] = {
        ...prev,
        // Prefer active user status over 'NEW'
        status: prev.status !== 'NEW' ? prev.status : drive.status,
        user_notes: prev.user_notes || drive.user_notes,
        starred: prev.starred || drive.starred,
        archived: prev.archived || drive.archived,
        apply_url: prev.apply_url || drive.apply_url,
        job_description_url: prev.job_description_url || drive.job_description_url,
        deadline: prev.deadline || drive.deadline,
      };
    } else {
      consolidatedExisting.push(drive);
    }
  }

  const mergedList: PlacementDrive[] = [...consolidatedExisting];
  let addedCount = 0;
  let updatedCount = 0;

  for (const incoming of newDrives) {
    const existingIndex = mergedList.findIndex((ex) => isSameDrive(ex, incoming));

    if (existingIndex >= 0) {
      const existing = mergedList[existingIndex];

      const incomingDate = new Date(incoming.received_at || incoming.created_at).getTime();
      const existingDate = new Date(existing.received_at || existing.created_at).getTime();
      const incomingIsNewer = isNaN(existingDate) || incomingDate >= existingDate;

      // Merge positions/roles without duplicates
      const existingRoles = new Set(existing.positions.map((p) => p.role.toLowerCase().trim()));
      const combinedPositions = [...existing.positions];
      for (const p of incoming.positions) {
        const normRole = p.role.toLowerCase().trim();
        if (!existingRoles.has(normRole)) {
          combinedPositions.push(p);
          existingRoles.add(normRole);
        }
      }

      const merged: PlacementDrive = {
        ...incoming,
        id: existing.id, // Retain stable existing ID
        company: existing.company.length >= incoming.company.length ? existing.company : incoming.company,
        positions: combinedPositions,
        drive_type: existing.drive_type !== 'FINAL_PLACEMENT' ? existing.drive_type : incoming.drive_type,
        deadline: incomingIsNewer && incoming.deadline ? incoming.deadline : (existing.deadline || incoming.deadline),
        deadline_precision: incomingIsNewer && incoming.deadline_precision ? incoming.deadline_precision : (existing.deadline_precision || incoming.deadline_precision),
        apply_url: existing.apply_url || incoming.apply_url,
        job_description_url: existing.job_description_url || incoming.job_description_url,
        company_website: existing.company_website || incoming.company_website,
        // Crucially preserve user custom state
        status: existing.status,
        user_notes: existing.user_notes,
        starred: existing.starred,
        archived: existing.archived,
        is_read: existing.is_read,
        created_at: existing.created_at,
        received_at: incomingIsNewer ? (incoming.received_at || existing.received_at) : existing.received_at,
        updated_at: new Date().toISOString(),
        source: {
          ...existing.source,
          subject: incomingIsNewer ? incoming.source.subject : existing.source.subject,
        },
      };

      mergedList[existingIndex] = merged;
      updatedCount++;
    } else {
      mergedList.push(incoming);
      addedCount++;
    }
  }

  const unchangedCount = Math.max(0, existingDrives.length - updatedCount);

  return {
    mergedDrives: mergedList,
    addedCount,
    updatedCount,
    unchangedCount,
  };
}
