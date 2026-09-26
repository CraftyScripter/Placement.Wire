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

/**
 * Sanitizes any raw or potentially malformed placement drive object so that
 * fields like `company` and `positions[0].role` are never empty strings,
 * preventing Zod validation failures during Drive storage.
 */
export function sanitizePlacementDrive(drive: any): PlacementDrive {
  const rawCompany = typeof drive?.company === 'string' ? drive.company.trim() : '';
  const fallbackCompany =
    typeof drive?.source?.subject === 'string' && drive.source.subject.trim()
      ? drive.source.subject.trim().slice(0, 80)
      : 'Campus Placement Opportunity';
  const company = rawCompany || fallbackCompany;

  let positions: Position[] = [];
  if (Array.isArray(drive?.positions) && drive.positions.length > 0) {
    positions = drive.positions.map((p: any) => {
      const rawRole = typeof p?.role === 'string' ? p.role.trim() : '';
      return {
        role: rawRole || 'Graduate Trainee / Associate',
        ctc: typeof p?.ctc === 'string' && p.ctc.trim() ? p.ctc.trim() : null,
        location: typeof p?.location === 'string' && p.location.trim() ? p.location.trim() : null,
        eligible_courses: Array.isArray(p?.eligible_courses) ? p.eligible_courses : [],
        eligible_batches: Array.isArray(p?.eligible_batches) ? p.eligible_batches : [],
      };
    });
  }

  if (positions.length === 0) {
    positions = [
      {
        role: 'Graduate Trainee / Associate',
        ctc: null,
        location: null,
        eligible_courses: [],
        eligible_batches: [],
      },
    ];
  }

  const now = new Date().toISOString();

  return {
    id: typeof drive?.id === 'string' && drive.id.trim() ? drive.id.trim() : `drive_${Date.now()}`,
    company,
    positions,
    drive_type: DriveTypeEnum.options.includes(drive?.drive_type)
      ? drive.drive_type
      : 'FINAL_PLACEMENT',
    deadline: typeof drive?.deadline === 'string' ? drive.deadline : null,
    deadline_precision:
      drive?.deadline_precision === 'EXACT_TIME' || drive?.deadline_precision === 'DATE_ONLY'
        ? drive.deadline_precision
        : null,
    apply_url: typeof drive?.apply_url === 'string' && drive.apply_url.trim() ? drive.apply_url.trim() : null,
    job_description_url:
      typeof drive?.job_description_url === 'string' && drive.job_description_url.trim()
        ? drive.job_description_url.trim()
        : null,
    company_website:
      typeof drive?.company_website === 'string' && drive.company_website.trim()
        ? drive.company_website.trim()
        : null,
    status: ApplicationStatusEnum.options.includes(drive?.status) ? drive.status : 'NEW',
    user_notes: typeof drive?.user_notes === 'string' ? drive.user_notes : '',
    starred: Boolean(drive?.starred),
    received_at: typeof drive?.received_at === 'string' ? drive.received_at : now,
    source: {
      gmail_message_id:
        typeof drive?.source?.gmail_message_id === 'string'
          ? drive.source.gmail_message_id
          : typeof drive?.id === 'string'
          ? drive.id
          : 'unknown_msg',
      subject:
        typeof drive?.source?.subject === 'string' && drive.source.subject.trim()
          ? drive.source.subject.trim()
          : company,
      sender: typeof drive?.source?.sender === 'string' ? drive.source.sender.trim() : '',
      gmail_thread_id:
        typeof drive?.source?.gmail_thread_id === 'string'
          ? drive.source.gmail_thread_id
          : null,
    },
    is_read: Boolean(drive?.is_read),
    archived: Boolean(drive?.archived),
    created_at: typeof drive?.created_at === 'string' ? drive.created_at : now,
    updated_at: typeof drive?.updated_at === 'string' ? drive.updated_at : now,
  };
}
