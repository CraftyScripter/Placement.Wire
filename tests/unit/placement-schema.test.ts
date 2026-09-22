import { describe, it, expect } from 'vitest';
import {
  PlacementFileSchema,
  PlacementDriveSchema,
  createEmptyPlacementFile,
} from '@/schemas/placement.schema';

describe('Placement Data Zod Schema Validation', () => {
  it('should generate valid default empty placement file', () => {
    const emptyFile = createEmptyPlacementFile();
    const result = PlacementFileSchema.safeParse(emptyFile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.app).toBe('PlacementWire');
      expect(result.data.version).toBe('1.0');
      expect(result.data.drives).toEqual([]);
      expect(result.data.revision).toBe(1);
    }
  });

  it('should validate full placement drive object', () => {
    const sampleDrive = {
      id: 'gmail_msg_1234567890abcdef',
      company: 'RGF India',
      positions: [
        {
          role: 'Associate Consultant',
          ctc: null,
          location: 'Gurgaon',
          eligible_courses: ['B.Tech CSE', 'MBA'],
          eligible_batches: [2026, 2027],
        },
      ],
      drive_type: 'FINAL_PLACEMENT',
      deadline: '2026-09-22T23:59:59.000Z',
      deadline_precision: 'DATE_ONLY',
      apply_url: 'https://forms.gle/f8MLjTmvvt9C8tPm7',
      job_description_url: 'https://drive.google.com/drive/folders/test',
      company_website: 'http://www.rgf-professional.com/',
      status: 'NEW',
      user_notes: 'Researching company history',
      starred: true,
      received_at: '2026-09-18T10:30:00.000Z',
      source: {
        gmail_message_id: 'msg_001',
        subject: 'Final Placement Opportunity',
        sender: 'placements@saitm.ac.in',
      },
      is_read: true,
      archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const parsed = PlacementDriveSchema.safeParse(sampleDrive);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid drive statuses', () => {
    const invalidDrive = {
      id: 'drive_1',
      company: 'Test Co',
      positions: [{ role: 'Dev' }],
      status: 'INVALID_STATUS', // Invalid status enum
      source: {
        gmail_message_id: '1',
        subject: 'Sub',
        sender: 'test@saitm.ac.in',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const parsed = PlacementDriveSchema.safeParse(invalidDrive);
    expect(parsed.success).toBe(false);
  });
});
