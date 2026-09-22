import { z } from 'zod';

export const DriveTypeEnum = z.enum([
  'FINAL_PLACEMENT',
  'INTERNSHIP_WITH_PPO',
  'INTERNSHIP',
  'HACKATHON',
  'TRAINING',
  'OTHER',
]);
export type DriveType = z.infer<typeof DriveTypeEnum>;

export const ApplicationStatusEnum = z.enum([
  'NEW',
  'APPLIED',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'SELECTED',
  'REJECTED',
  'ARCHIVED',
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatusEnum>;

export const DeadlinePrecisionEnum = z.enum(['EXACT_TIME', 'DATE_ONLY']).nullable();
export type DeadlinePrecision = z.infer<typeof DeadlinePrecisionEnum>;

export const PositionSchema = z.object({
  role: z.string().min(1),
  ctc: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
  eligible_courses: z.array(z.string()).default([]),
  eligible_batches: z.array(z.number()).default([]),
});
export type Position = z.infer<typeof PositionSchema>;

export const SourceSchema = z.object({
  gmail_message_id: z.string(),
  subject: z.string(),
  sender: z.string(),
  gmail_thread_id: z.string().nullable().optional(),
});
export type PlacementSource = z.infer<typeof SourceSchema>;

export const PlacementDriveSchema = z.object({
  id: z.string(),
  company: z.string().min(1),
  positions: z.array(PositionSchema).min(1),
  drive_type: DriveTypeEnum.default('FINAL_PLACEMENT'),
  deadline: z.string().nullable().default(null),
  deadline_precision: DeadlinePrecisionEnum.default(null),
  apply_url: z.string().nullable().default(null),
  job_description_url: z.string().nullable().default(null),
  company_website: z.string().nullable().default(null),
  status: ApplicationStatusEnum.default('NEW'),
  user_notes: z.string().default(''),
  starred: z.boolean().default(false),
  received_at: z.string().nullable().default(null),
  source: SourceSchema,
  is_read: z.boolean().default(false),
  archived: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});
export type PlacementDrive = z.infer<typeof PlacementDriveSchema>;

export const PlacementFileSchema = z.object({
  app: z.literal('PlacementWire').default('PlacementWire'),
  version: z.literal('1.0').default('1.0'),
  last_synced_at: z.string().nullable().default(null),
  revision: z.number().int().default(1),
  drives: z.array(PlacementDriveSchema).default([]),
});
export type PlacementFile = z.infer<typeof PlacementFileSchema>;

export function createEmptyPlacementFile(): PlacementFile {
  return {
    app: 'PlacementWire',
    version: '1.0',
    last_synced_at: new Date().toISOString(),
    revision: 1,
    drives: [],
  };
}
