import { PlacementDrive } from '@/schemas/placement.schema';

/** Canonical degree codes we recognise inside free-text course strings. */
export const KNOWN_DEGREES = [
  'BTECH',
  'MTECH',
  'MBA',
  'MCA',
  'BCA',
  'BBA',
  'BCOM',
  'BSC',
  'MSC',
  'BPHARM',
  'MPHARM',
  'DIPLOMA',
  'BA',
  'MA',
  'PHD',
  'BHM',
  'BDES',
  'MDES',
  'LLB',
  'BALLB',
] as const;

/** "B.Tech (CSE, AIML)" -> "BTECH CSE AIML" for reliable matching. */
export function normalizeCourse(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/\./g, '')
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Whole-word match so BTECH never matches MTECH. */
export function courseMatchesDegree(courseRaw: string, degree: string): boolean {
  const norm = ` ${normalizeCourse(courseRaw)} `;
  return norm.includes(` ${degree} `);
}

/** Clean checkbox list derived from the user's actual drives. */
export function extractDegrees(drives: PlacementDrive[]): string[] {
  const found = new Set<string>();
  for (const d of drives) {
    for (const p of d.positions) {
      for (const c of p.eligible_courses || []) {
        const norm = ` ${normalizeCourse(c)} `;
        for (const deg of KNOWN_DEGREES) {
          if (norm.includes(` ${deg} `)) found.add(deg);
        }
      }
    }
  }
  return Array.from(found).sort();
}

/** True when none of the drive's positions list any course info. */
export function hasNoCourseInfo(drive: PlacementDrive): boolean {
  return drive.positions.every(
    (p) => !p.eligible_courses || p.eligible_courses.length === 0
  );
}

/**
 * Preference filter (option A): a drive shows when it matches at least one
 * selected degree in any position, OR when it carries no course info at all
 * (so unspecified mails are never hidden).
 */
export function driveMatchesPref(drive: PlacementDrive, pref: string[]): boolean {
  if (pref.length === 0) return true;
  if (hasNoCourseInfo(drive)) return true;
  return drive.positions.some((p) =>
    (p.eligible_courses || []).some((c) => pref.some((deg) => courseMatchesDegree(c, deg)))
  );
}
