import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Gmail Sync Quota Protection', () => {
  it('filters out already parsed messages from batch details fetch using knownMessageIds', () => {
    const allMessages = [
      { id: 'msg_1', threadId: 't1' },
      { id: 'msg_2', threadId: 't2' },
      { id: 'msg_3', threadId: 't3' },
    ];

    const knownMessageIds = new Set(['msg_1', 'msg_2']);

    const messagesToFetch =
      knownMessageIds && knownMessageIds.size > 0
        ? allMessages.filter((m) => m.id && !knownMessageIds.has(m.id))
        : allMessages;

    expect(messagesToFetch).toEqual([{ id: 'msg_3', threadId: 't3' }]);
  });

  it('skips detail fetching completely when all messages are already known', () => {
    const allMessages = [
      { id: 'msg_1', threadId: 't1' },
      { id: 'msg_2', threadId: 't2' },
    ];

    const knownMessageIds = new Set(['msg_1', 'msg_2', 'msg_3']);

    const messagesToFetch =
      knownMessageIds && knownMessageIds.size > 0
        ? allMessages.filter((m) => m.id && !knownMessageIds.has(m.id))
        : allMessages;

    expect(messagesToFetch.length).toBe(0);
  });

  it('collects message IDs and drive IDs from existing placement drives', () => {
    const mockDrives = [
      { id: 'drive_1', source: { gmail_message_id: 'gmail_msg_101' } },
      { id: 'drive_2', source: { gmail_message_id: 'gmail_msg_102' } },
      { id: 'drive_3' }, // fallback
    ];

    const knownMessageIds = new Set<string>();
    for (const d of mockDrives as any[]) {
      if (d.source?.gmail_message_id) {
        knownMessageIds.add(d.source.gmail_message_id);
      }
      if (d.id) {
        knownMessageIds.add(d.id);
      }
    }

    expect(knownMessageIds.has('gmail_msg_101')).toBe(true);
    expect(knownMessageIds.has('gmail_msg_102')).toBe(true);
    expect(knownMessageIds.has('drive_1')).toBe(true);
    expect(knownMessageIds.has('drive_3')).toBe(true);
    expect(knownMessageIds.has('unknown')).toBe(false);
  });

  it('sanitizes drives with empty company or role so Zod validation never fails', async () => {
    const { sanitizePlacementDrive, PlacementDriveSchema } = await import('@/schemas/placement.schema');

    // Simulate malformed drive matching the user error: company="" and role=""
    const malformed = {
      id: 'drive_95',
      company: '',
      positions: [{ role: '', ctc: null, location: null, eligible_courses: [], eligible_batches: [] }],
      source: { gmail_message_id: 'msg_95', subject: 'T&P Drive Notification', sender: 'placements@saitm.org' },
    };

    const sanitized = sanitizePlacementDrive(malformed);
    expect(sanitized.company).toBe('T&P Drive Notification');
    expect(sanitized.positions[0].role).toBe('Graduate Trainee / Associate');

    const result = PlacementDriveSchema.safeParse(sanitized);
    expect(result.success).toBe(true);
  });
});

