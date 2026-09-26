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

  it('should deduplicate reminder emails with the same gmail_thread_id', () => {
    const rgf = parsePlacementEmail(FIXTURE_RGF_INDIA)!;
    // Reminder email with a different message ID but SAME thread ID
    const reminder = {
      ...rgf,
      id: 'gmail_msg_different_id_for_reminder',
      source: {
        ...rgf.source,
        gmail_message_id: 'msg_reminder_123',
        subject: 'Reminder: Final Placement Opportunity | RGF India',
      },
    };

    const result = mergePlacementDrives([rgf], [reminder]);
    expect(result.addedCount).toBe(0);
    expect(result.updatedCount).toBe(1);
    expect(result.mergedDrives.length).toBe(1);
  });

  it('should deduplicate emails for the same company in the same placement season', () => {
    const rgf = parsePlacementEmail(FIXTURE_RGF_INDIA)!;
    // Another email for RGF India with different ID and subject
    const rgfUpdate = {
      ...rgf,
      id: 'gmail_msg_another_id',
      company: 'RGF India Pvt Ltd',
      source: {
        ...rgf.source,
        gmail_message_id: 'msg_update_456',
        subject: 'RGF India: Shortlist & Interview Process',
      },
    };

    const result = mergePlacementDrives([rgf], [rgfUpdate]);
    expect(result.addedCount).toBe(0);
    expect(result.updatedCount).toBe(1);
    expect(result.mergedDrives.length).toBe(1);
  });

  it('should self-deduplicate any existing duplicates in existingDrives', () => {
    const rgf1 = parsePlacementEmail(FIXTURE_RGF_INDIA)!;
    const rgfDuplicate = {
      ...rgf1,
      id: 'duplicate_id_99',
      company: 'RGF India',
    };

    // Both exist in existingDrives
    const result = mergePlacementDrives([rgf1, rgfDuplicate], []);
    expect(result.mergedDrives.length).toBe(1);
  });
});

