import * as cheerio from 'cheerio';
import { generatePlacementId } from './id-generator';
import {
  PlacementDrive,
  DriveType,
  Position,
  DeadlinePrecision,
  sanitizePlacementDrive,
} from '@/schemas/placement.schema';

export interface RawEmailInput {
  id: string;
  threadId?: string | null;
  subject: string;
  sender: string;
  date?: string | null;
  bodyHtml?: string;
  bodyText?: string;
}

/**
 * Checks whether an email is relevant to college placements, internships, or hackathons.
 */
export function isPlacementEmail(subject: string, bodyText: string, sender: string = ''): boolean {
  if (sender) {
    const s = sender.toLowerCase();
    const isFromPlacementCell = s.includes('placements@saitm.org') || s.includes('placements@saitm.ac.in');
    if (!isFromPlacementCell) {
      return false;
    }
  }

  const combined = `${subject} ${bodyText} ${sender}`.toLowerCase();
  const placementKeywords = [
    'placement',
    'drive',
    'hiring',
    'recruitment',
    'campus',
    'opportunity',
    'internship',
    'ppo',
    'eligible batch',
    'job profile',
    't&p cell',
    'training & placement',
    'hackathon',
    'ideathon',
    'coding contest',
    'challenge',
    'saitm.org',
    'saitm.ac.in',
  ];

  return placementKeywords.some((keyword) => combined.includes(keyword));
}

/**
 * Extract company name from subject or body.
 */
export function extractCompany(subject: string, $: cheerio.CheerioAPI, text: string): string {
  // Pattern 1: Pipes in subject, e.g. "Final Placement Opportunity | RGF India | Associate Consultant | Batch 2026"
  const pipeParts = subject.split('|').map((p) => p.trim());
  if (pipeParts.length >= 2) {
    const candidate = pipeParts[1];
    if (
      candidate.length > 0 &&
      !/opportunity|placement|drive|hiring|recruitment|batch|hackathon/i.test(candidate) &&
      candidate.length < 50
    ) {
      return candidate;
    }
  }

  // Pattern 2: Regex look for "Company Name:" or "Company:" or "Organized by:"
  const bodyMatch = text.match(/(?:company\s*name|organization|company|hosted\s*by|organized\s*by)\s*[:\-]\s*([^\n\r,;]+)/i);
  if (bodyMatch && bodyMatch[1]) {
    const cleaned = bodyMatch[1].split(/\b(?:drive|type|job|location|profiles?|mode)\b/i)[0].trim();
    if (cleaned.length > 0 && cleaned.length < 50) {
      return cleaned;
    }
  }

  // Pattern 3: Subject keywords like "for / of / with / at / by <Company>"
  const subjMatch = subject.match(/(?:drive\s+(?:for|of|by|at)|opportunity\s+(?:with|at|for|by)|hiring\s+(?:at|by|with|for))\s+([A-Za-z0-9&.\- ]+?)(?:\s*[\-|–—:]|\s+for\s+batch|\s+batch|\s+202[0-9]|$)/i);
  if (subjMatch && subjMatch[1]) {
    const cleaned = subjMatch[1].trim();
    if (cleaned.length > 1 && cleaned.length < 50 && !/placement|campus|internship|training/i.test(cleaned)) {
      return cleaned;
    }
  }

  // Pattern 4: Colon or dash in subject, e.g. "Campus Drive: Capgemini" or "Placement - Cognizant"
  const colonDashParts = subject.split(/[:\-–—]/).map((p) => p.trim());
  if (colonDashParts.length >= 2) {
    for (const part of colonDashParts) {
      const candidate = part.split('|')[0].trim();
      if (
        candidate.length > 2 &&
        candidate.length < 50 &&
        !/placement|opportunity|drive|hiring|recruitment|batch|hackathon|crc|saitm|notice|reminder|update|invitation|internship/i.test(candidate)
      ) {
        return candidate;
      }
    }
  }

  return (pipeParts[0] && pipeParts[0].trim()) || (subject && subject.trim().slice(0, 50)) || 'Campus Opportunity';
}

/**
 * Classifies drive type based on subject and body text.
 */
export function classifyDriveType(subject: string, text: string): DriveType {
  const combined = `${subject} ${text}`.toLowerCase();

  if (
    combined.includes('hackathon') ||
    combined.includes('ideathon') ||
    combined.includes('coding contest') ||
    combined.includes('codeathon') ||
    combined.includes('challenge') ||
    combined.includes('competition')
  ) {
    return 'HACKATHON';
  }
  if (
    combined.includes('internship with ppo') ||
    combined.includes('internship + ppo') ||
    combined.includes('intern with ppo')
  ) {
    return 'INTERNSHIP_WITH_PPO';
  }
  if (
    combined.includes('final placement') ||
    combined.includes('full time') ||
    combined.includes('full-time')
  ) {
    return 'FINAL_PLACEMENT';
  }
  if (combined.includes('internship') || combined.includes('intern')) {
    return 'INTERNSHIP';
  }
  if (combined.includes('training') || combined.includes('workshop')) {
    return 'TRAINING';
  }
  return 'FINAL_PLACEMENT';
}

/**
 * Extracts eligible batches (e.g. 2025, 2026, 2027).
 */
export function extractBatches(subject: string, text: string): number[] {
  const combined = `${subject} ${text}`;
  const batchRegex = /\b(202[4-9]|203[0-2])\b/g;
  const matches = combined.match(batchRegex);
  if (!matches) return [];

  const batches = Array.from(new Set(matches.map((m) => parseInt(m, 10)))).sort();
  return batches;
}

/**
 * Extracts eligible courses/degrees, intelligently expanding college branches.
 */
export function extractCourses(subject: string, text: string): string[] {
  const combined = `${subject} ${text}`;
  const found: string[] = [];

  const hasBTech = /\bB\.?Tech\b/i.test(combined);

  if (hasBTech) {
    found.push('B.Tech');
    if (/\b(?:CSE|Computer Science)\b/i.test(combined)) found.push('B.Tech CSE');
    if (/\bCST\b/i.test(combined)) found.push('B.Tech CST');
    if (/\b(?:AIML|AI\s*(?:&|\/)?\s*ML)\b/i.test(combined)) found.push('B.Tech AIML');
    if (/\b(?:DS|Data Science)\b/i.test(combined)) found.push('B.Tech DS');
    if (/\b(?:ECE|Electronics)\b/i.test(combined)) found.push('B.Tech ECE');
    if (/\b(?:ME|Mechanical)\b/i.test(combined)) found.push('B.Tech ME');
    if (/\b(?:CE|Civil)\b/i.test(combined)) found.push('B.Tech CE');
  }

  const otherDegrees = ['MCA', 'BCA', 'MBA', 'BBA', 'Diploma', 'M.Tech'];
  for (const deg of otherDegrees) {
    const escaped = deg.replace(/\./g, '\\.');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(combined)) {
      found.push(deg);
    }
  }

  return Array.from(new Set(found));
}

/**
 * Extracts locations from subject and body.
 */
export function extractLocation(text: string): string | null {
  const commonLocations = [
    'Gurgaon',
    'Gurugram',
    'Noida',
    'Mohali',
    'Delhi NCR',
    'Delhi',
    'Bangalore',
    'Bengaluru',
    'Hyderabad',
    'Pune',
    'Mumbai',
    'Chandigarh',
    'Work From Home',
    'Remote',
    'Hybrid',
  ];

  // First check after explicit location label
  const match = text.match(/(?:job\s*)?location\s*[:\-]\s*([^\n\r,;.<>]+)/i);
  if (match && match[1]) {
    const snippet = match[1].trim();
    for (const loc of commonLocations) {
      if (new RegExp(`\\b${loc}\\b`, 'i').test(snippet)) {
        return loc;
      }
    }
    const cleaned = snippet.split(/\b(?:eligible|profiles?|batch|positions?|courses?|package|deadline)\b/i)[0].trim();
    if (cleaned.length > 0 && cleaned.length < 30) {
      return cleaned;
    }
  }

  // Fallback to checking entire text for known locations
  for (const loc of commonLocations) {
    const regex = new RegExp(`\\b${loc}\\b`, 'i');
    if (regex.test(text)) {
      return loc;
    }
  }

  return null;
}

/**
 * Extracts package / CTC / stipend.
 */
export function extractPackage(text: string): string | null {
  const match = text.match(/(?:ctc|package|salary|stipend)\s*[:\-]\s*([^\n\r;]+)/i);
  if (match && match[1]) {
    const val = match[1].trim().split(/\b(?:location|deadline|eligible|batch|courses?|profiles?)\b/i)[0].trim();
    if (!/not specified|tbd|to be discussed/i.test(val) && val.length > 0) {
      return val;
    }
  }

  const ctcMatch = text.match(/(?:₹|INR|Rs\.?)\s*[\d.]+\s*(?:LPA|Lacs|Lakhs|per annum|\/\s*month)?(?:\s*[-–—to]\s*(?:₹|INR|Rs\.?)?\s*[\d.]+\s*(?:LPA|Lacs|Lakhs|per annum|\/\s*month)?)?/i);
  if (ctcMatch && ctcMatch[0]) {
    return ctcMatch[0].trim();
  }

  return null;
}

/**
 * Extracts deadline date and precision.
 */
export function extractDeadline(text: string): { deadline: string | null; precision: DeadlinePrecision } {
  const deadlineMatch = text.match(/(?:deadline|last\s*date(?:\s*to\s*apply)?|apply\s*before)\s*[:\-]?\s*([0-9]{1,2}(?:st|nd|rd|th)?\s+[a-zA-Z]+[,\s]+[0-9]{4}|[0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4}|[0-9]{4}[\/\-][0-9]{1,2}[\/\-][0-9]{1,2})/i);

  if (deadlineMatch && deadlineMatch[1]) {
    const rawDate = deadlineMatch[1].replace(/(\d)(st|nd|rd|th)\b/i, '$1').trim();
    const parsed = parseDateOnlyToUtcEndOfDay(rawDate);
    if (parsed) {
      return {
        deadline: parsed,
        precision: 'DATE_ONLY',
      };
    }
  }

  return { deadline: null, precision: null };
}


const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  jan: 0, feb: 1, mar: 2, apr: 3, jun: 5,
  jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
};

/**
 * Parses a date-only string (no time) into a 23:59:59.999 UTC ISO string,
 * using Date.UTC so the calendar day never shifts with the server/browser
 * timezone. The old code used `new Date(Date.parse(...))` + setUTCHours,
 * which in IST turned "23 September 2026" into 2026-09-22T23:59:59Z.
 */
function parseDateOnlyToUtcEndOfDay(rawDate: string): string | null {
  // "23 September 2026" / "30 Sep, 2026"
  const longMatch = rawDate.match(/^(\d{1,2})\s+([a-zA-Z]+)[,\s]+(\d{4})$/);
  if (longMatch) {
    const day = parseInt(longMatch[1], 10);
    const month = MONTHS[longMatch[2].toLowerCase()];
    const year = parseInt(longMatch[3], 10);
    if (month !== undefined && day >= 1 && day <= 31) {
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      if (day <= daysInMonth) {
        return new Date(Date.UTC(year, month, day, 23, 59, 59, 999)).toISOString();
      }
    }
    return null;
  }

  // "23/09/2026" or "23-09-2026" (D/M/Y)
  const dmyMatch = rawDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      if (day <= daysInMonth) {
        return new Date(Date.UTC(year, month, day, 23, 59, 59, 999)).toISOString();
      }
    }
    return null;
  }

  // "2026/09/23" or "2026-09-23" (Y/M/D)
  const ymdMatch = rawDate.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      if (day <= daysInMonth) {
        return new Date(Date.UTC(year, month, day, 23, 59, 59, 999)).toISOString();
      }
    }
    return null;
  }

  return null;
}

/**
 * Extracts links (Application link, Job Description link, Company website).
 */
export function extractLinks($: cheerio.CheerioAPI, text: string): {
  applyUrl: string | null;
  jobDescriptionUrl: string | null;
  companyWebsite: string | null;
} {
  let applyUrl: string | null = null;
  let jobDescriptionUrl: string | null = null;
  let companyWebsite: string | null = null;

  $('a').each((_, el) => {
    const href = $(el).attr('href')?.trim();
    const anchorText = $(el).text().trim().toLowerCase();

    if (!href || href.startsWith('mailto:') || href.startsWith('#')) return;

    if (
      href.includes('forms.gle') ||
      href.includes('docs.google.com/forms') ||
      anchorText.includes('apply') ||
      anchorText.includes('registration link')
    ) {
      if (!applyUrl) applyUrl = href;
    } else if (
      href.includes('drive.google.com') ||
      href.includes('docs.google.com/document') ||
      anchorText.includes('jd') ||
      anchorText.includes('job description')
    ) {
      if (!jobDescriptionUrl) jobDescriptionUrl = href;
    } else if (
      !href.includes('google.com') &&
      (anchorText.includes('website') || anchorText.includes('company') || anchorText.includes('http') || anchorText.includes('.com'))
    ) {
      if (!companyWebsite) companyWebsite = href;
    }
  });

  if (!applyUrl) {
    const formMatch = text.match(/https?:\/\/(?:forms\.gle\/[^\s<>]+|docs\.google\.com\/forms\/[^\s<>]+)/i);
    if (formMatch) applyUrl = formMatch[0];
  }

  if (!jobDescriptionUrl) {
    const driveMatch = text.match(/https?:\/\/(?:drive\.google\.com\/[^\s]+|docs\.google\.com\/document\/[^\s]+)/i);
    if (driveMatch) jobDescriptionUrl = driveMatch[0];
  }

  if (!companyWebsite) {
    const webMatch = text.match(/https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);
    if (webMatch && !webMatch[0].includes('google.com') && !webMatch[0].includes('saitm.ac.in')) {
      companyWebsite = webMatch[0];
    }
  }

  return { applyUrl, jobDescriptionUrl, companyWebsite };
}

/**
 * Extracts multiple profiles/positions from email body and subject.
 */
export function extractProfiles(
  subject: string,
  $: cheerio.CheerioAPI,
  text: string,
  courses: string[],
  batches: number[],
  ctc: string | null,
  location: string | null
): Position[] {
  const profiles: Position[] = [];

  $('ul, ol').each((_, listEl) => {
    const prevText = $(listEl).prev().text().toLowerCase();
    const parentText = $(listEl).parent().text().toLowerCase();
    if (prevText.includes('profile') || prevText.includes('position') || parentText.includes('profiles:')) {
      $(listEl).find('li').each((_, li) => {
        const roleName = $(li).text().trim();
        if (roleName.length > 2 && roleName.length < 60) {
          profiles.push({
            role: roleName,
            ctc,
            location,
            eligible_courses: courses,
            eligible_batches: batches,
          });
        }
      });
    }
  });

  if (profiles.length === 0) {
    const profileSectionRegex = /(?:profiles?|positions?|roles?)\s*[:\-]\s*([\s\S]*?)(?:eligible|eligibility|selection|process|location|package|deadline|link|$)/i;
    const sectionMatch = text.match(profileSectionRegex);

    if (sectionMatch && sectionMatch[1]) {
      const lines = sectionMatch[1]
        .split(/\n|•|\*|-|\d+\./)
        .map((l) => l.trim())
        .filter((l) => l.length > 2 && l.length < 60 && !/http|eligible|drive/i.test(l));

      for (const line of lines) {
        profiles.push({
          role: line,
          ctc,
          location,
          eligible_courses: courses,
          eligible_batches: batches,
        });
      }
    }
  }

  if (profiles.length === 0) {
    const pipeParts = subject.split('|').map((p) => p.trim());
    if (pipeParts.length >= 3) {
      const candidateRole = pipeParts[2];
      if (candidateRole && candidateRole.length > 0 && !/batch|eligible|opportunity|placement/i.test(candidateRole)) {
        profiles.push({
          role: candidateRole,
          ctc,
          location,
          eligible_courses: courses,
          eligible_batches: batches,
        });
      }
    }
  }

  if (profiles.length === 0) {
    profiles.push({
      role: 'Graduate Trainee / Associate',
      ctc,
      location,
      eligible_courses: courses,
      eligible_batches: batches,
    });
  }

  return profiles;
}

/**
 * Main parser function: Transforms a raw Gmail message into a structured PlacementDrive.
 */
export function parsePlacementEmail(input: RawEmailInput): PlacementDrive | null {
  const rawHtml = input.bodyHtml || input.bodyText || '';
  const structuredHtml = rawHtml
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '</$1>\n')
    .replace(/<br\s*[\/]?>/gi, '\n');

  const $ = cheerio.load(structuredHtml);
  const plainText = $.text().trim();

  if (!isPlacementEmail(input.subject, plainText, input.sender)) {
    return null;
  }

  const id = generatePlacementId(input.id);
  const company = extractCompany(input.subject, $, plainText);
  const driveType = classifyDriveType(input.subject, plainText);
  const batches = extractBatches(input.subject, plainText);
  const courses = extractCourses(input.subject, plainText);
  const location = extractLocation(plainText);
  const ctc = extractPackage(plainText);
  const { deadline, precision: deadlinePrecision } = extractDeadline(plainText);
  const { applyUrl, jobDescriptionUrl, companyWebsite } = extractLinks($, plainText);

  const positions = extractProfiles(
    input.subject,
    $,
    plainText,
    courses,
    batches,
    ctc,
    location
  );

  const now = new Date().toISOString();

  return sanitizePlacementDrive({
    id,
    company,
    positions,
    drive_type: driveType,
    deadline,
    deadline_precision: deadlinePrecision,
    apply_url: applyUrl,
    job_description_url: jobDescriptionUrl,
    company_website: companyWebsite,
    status: 'NEW',
    user_notes: '',
    starred: false,
    received_at: input.date || now,
    source: {
      gmail_message_id: input.id,
      subject: input.subject,
      sender: input.sender,
      gmail_thread_id: input.threadId || null,
    },
    is_read: false,
    archived: false,
    created_at: now,
    updated_at: now,
  });
}
