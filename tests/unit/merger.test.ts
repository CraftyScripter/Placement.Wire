import { describe, it, expect } from 'vitest';
import { mergePlacementDrives } from '@/lib/parser/merger';
import { parsePlacementEmail } from '@/lib/parser/email-parser';
import { FIXTURE_RGF_INDIA, FIXTURE_75WAY } from '@/lib/parser/fixtures';

describe('Placement Data Merger Engine', () => {
  it('should add newly discovered drives', () => {
    const rgf = parsePlacementEmail(FIXTURE_RGF_INDIA)!;
    const seventyFive = parsePlacementEmail(FIXTURE_75WAY)!;

    const result = mergePlacementDrives([rgf], [seventyFive]);
    expect(result.addedCount).toBe(1);
    expect(result.updatedCount).toBe(0);
    expect(result.mergedDrives.length).toBe(2);
  });

  it('should never overwrite user modifications (status, notes, starred) during sync', () => {
    const rgf = parsePlacementEmail(FIXTURE_RGF_INDIA)!;

    // Simulate user editing the drive in the UI
    const userModifiedRGF = {
      ...rgf,
      status: 'SHORTLISTED' as const,
      user_notes: 'Cleared technical round 1 on 20 Sept.',
      starred: true,
      archived: false,
    };

    // Simulate Gmail sync re-fetching the same RGF announcement email
    const newlyFetchedRGF = parsePlacementEmail(FIXTURE_RGF_INDIA)!;
    expect(newlyFetchedRGF.status).toBe('NEW');
    expect(newlyFetchedRGF.user_notes).toBe('');
    expect(newlyFetchedRGF.starred).toBe(false);

    const result = mergePlacementDrives([userModifiedRGF], [newlyFetchedRGF]);
    expect(result.addedCount).toBe(0);
    expect(result.updatedCount).toBe(1);
    expect(result.mergedDrives.length).toBe(1);

    const merged = result.mergedDrives[0];
    expect(merged.status).toBe('SHORTLISTED');
    expect(merged.user_notes).toBe('Cleared technical round 1 on 20 Sept.');
    expect(merged.starred).toBe(true);
  });
});
