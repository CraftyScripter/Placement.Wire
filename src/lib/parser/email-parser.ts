import * as cheerio from 'cheerio';
import { generatePlacementId } from './id-generator';
import { isTrustedPlacementSender } from '@/lib/security/sender-trust';
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
 * Parser version, stamped onto every parsed drive. The Gmail sync uses it to
 * detect drives parsed by an older (buggier) parser and transparently
 * re-parse those messages instead of skipping them as "already known".
 * Bump this whenever extraction logic changes materially.
 */
export const PARSER_VERSION = 3;

/**
 * Normalizes Gmail/HTML whitespace: non-breaking spaces (`&nbsp;` → U+00A0,
 * which Gmail's composer emits for every repeated space) and other unicode
 * spaces become regular spaces, runs collapse, newlines preserved.
 */
export function normalizePlainText(text: string): string {
  return text
    .replace(/[^\S\n]+/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Sender allowlist lives in lib/security (zero-dep, shared with the sync
// route, Gmail service and client filters). Re-exported here so existing
// imports keep working.
export { TRUSTED_PLACEMENT_SENDERS } from '@/lib/security/sender-trust';
export { isTrustedPlacementSender };

/**
 * Checks whether an email is relevant to college placements, internships, or hackathons.
 */
export function isPlacementEmail(subject: string, bodyText: string, sender: string = ''): boolean {
  if (sender && !isTrustedPlacementSender(sender)) {
    return false;
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
    'pass out batch',
    'job profile',
    't&p cell',
    'tnp',
    'tp cell',
    'training & placement',
    'training and placement',
    'campus drive',
    'on-campus drive',
    'on campus drive',
    'pre-placement talk',
    'reporting time',
    'apply link',
    'registration link',
    'on the spot offer',
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
  const stripLocationSuffix = (candidate: string): string => {
    // "Prodesk IT, Noida" -> "Prodesk IT"; "Capgemini, Gurgaon / Bangalore" -> "Capgemini"
    const first = candidate.split(',')[0].trim();
    return (first.length >= 3 ? first : candidate.trim()).slice(0, 50);
  };

  // Pattern 1: Pipes in subject, e.g. "Final Placement Opportunity | RGF India | Associate Consultant | Batch 2026"
  const pipeParts = subject.split('|').map((p) => p.trim());
  if (pipeParts.length >= 2) {
    const candidate = pipeParts[1];
    if (
      candidate.length > 0 &&
      !/opportunity|placement|drive|hiring|recruitment|batch|hackathon/i.test(candidate) &&
      candidate.length < 50
    ) {
      return stripLocationSuffix(candidate);
    }
  }

  // Pattern 2: Regex look for "Company Name:" or "Company:" or "Organized by:"
  const bodyMatch = text.match(/(?:company\s*name|organization|company|hosted\s*by|organized\s*by)\s*[:\-]\s*([^\n\r,;]+)/i);
  if (bodyMatch && bodyMatch[1]) {
    const cleaned = bodyMatch[1].split(/\b(?:drive|type|job|location|profiles?|mode)\b/i)[0].trim();
    if (cleaned.length > 0 && cleaned.length < 50) {
      return stripLocationSuffix(cleaned);
    }
  }

  // Pattern 2b: "<Company> – on Campus Drive" style used by Director-TNP desk,
  // e.g. "Prodesk IT – on Campus Drive – Single day process …"
  const campusDriveMatch = text.match(/([A-Za-z0-9&.'\- ]{2,50}?)\s*[–—-]\s*on\s+campus\s+drive/i);
  if (campusDriveMatch && campusDriveMatch[1]) {
    const cleaned = campusDriveMatch[1].trim();
    if (cleaned.length >= 3 && !/placement|t&p|tnp|training|students|dear/i.test(cleaned)) {
      return stripLocationSuffix(cleaned);
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
  // Also handles "SAITM, T&P Cell: Prodesk IT, Noida - Campus drive on 30 September- Apply link"
  const colonDashParts = subject.split(/[:\-–—]/).map((p) => p.trim());
  if (colonDashParts.length >= 2) {
    for (const part of colonDashParts) {
      const candidate = part.split('|')[0].trim();
      if (
        candidate.length > 2 &&
        candidate.length < 50 &&
        !/placement|opportunity|drive|hiring|recruitment|batch|hackathon|crc|saitm|notice|reminder|update|invitation|internship|t&p cell|t & p|apply link|campus/i.test(candidate)
      ) {
        return stripLocationSuffix(candidate);
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
  // "Training & Placement" / "T&P" / "TNP" refer to the placement cell itself,
  // not a training program — only classify as TRAINING when there is no such reference.
  const isPlacementCellRef =
    /training\s*[&+]\s*placement|training\s+and\s+placement|t\s*&\s*p\b|\btnp\b|\btp\s*cell\b/.test(combined);
  if ((combined.includes('training') || combined.includes('workshop')) && !isPlacementCellRef) {
    return 'TRAINING';
  }
  return 'FINAL_PLACEMENT';
}

/**
 * Extracts eligible batches (e.g. 2025, 2026, 2027).
 * Drive/event dates ("Date of Campus Drive - 30th September, 2026") are
 * stripped first so the event year is not mistaken for an eligible batch.
 */
export function extractBatches(subject: string, text: string): number[] {
  const combined = `${subject}\n${text}`;
  const withoutDates = combined
    .replace(/\b\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)[,\s]+\d{4}\b/gi, ' ')
    .replace(/^[^\n\r]*date\s+of\s+(?:campus\s+)?drive[^\n\r]*$/gim, ' ');
  const batchRegex = /\b(202[4-9]|203[0-2])\b/g;
  const matches = withoutDates.match(batchRegex);
  if (!matches) return [];

  const batches = Array.from(new Set(matches.map((m) => parseInt(m, 10)))).sort();
  return batches;
}

/**
 * Extracts eligible courses/degrees, intelligently expanding college branches.
 * Handles spaced variants used by the Director-TNP desk ("M Tech/B Tech").
 */
export function extractCourses(subject: string, text: string): string[] {
  const normalized = `${subject} ${text}`
    .replace(/\bM\s*\.?\s*Tech\b/gi, 'M.Tech')
    .replace(/\bB\s*\.?\s*Tech\b/gi, 'B.Tech');
  const combined = normalized;
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
  const commonLocations: Array<{ names: string[]; canonical: string }> = [
    { names: ['Gurgaon', 'Gurugram'], canonical: 'Gurgaon' },
    { names: ['Noida'], canonical: 'Noida' },
    { names: ['Mohali'], canonical: 'Mohali' },
    { names: ['Delhi NCR'], canonical: 'Delhi NCR' },
    { names: ['Delhi'], canonical: 'Delhi' },
    { names: ['Bangalore', 'Bengaluru'], canonical: 'Bengaluru' },
    { names: ['Hyderabad'], canonical: 'Hyderabad' },
    { names: ['Pune'], canonical: 'Pune' },
    { names: ['Mumbai'], canonical: 'Mumbai' },
    { names: ['Chandigarh'], canonical: 'Chandigarh' },
    { names: ['Work From Home', 'WFH'], canonical: 'Work From Home' },
    { names: ['Remote'], canonical: 'Remote' },
    { names: ['Hybrid'], canonical: 'Hybrid' },
  ];

  const findKnownIn = (snippet: string): string[] => {
    const hits: string[] = [];
    for (const loc of commonLocations) {
      for (const name of loc.names) {
        if (new RegExp(`\\b${name}\\b`, 'i').test(snippet)) {
          if (!hits.includes(loc.canonical)) hits.push(loc.canonical);
          break;
        }
      }
    }
    return hits;
  };

  // First check after explicit location label. Read to end-of-line (not just
  // to the first comma) so "Sector – 02, NOIDA/ WFH" still finds Noida.
  const match = text.match(/(?:job\s*)?location\s*[:\-]\s*([^\n\r]+)/i);
  if (match && match[1]) {
    const snippet = match[1].trim().slice(0, 120);
    const hits = findKnownIn(snippet);
    if (hits.length > 0) {
      // Prefer a physical city over a work-mode tag ("Noida / WFH" -> "Noida").
      const city = hits.find((h) => h !== 'Work From Home' && h !== 'Remote' && h !== 'Hybrid');
      if (city) return city;
      return hits[0];
    }
    const cleaned = snippet
      .split(/\b(?:eligible|profiles?|batch|positions?|courses?|package|deadline)\b/i)[0]
      .split(/[|]/)[0]
      .trim();
    if (cleaned.length > 0 && cleaned.length < 40) {
      return cleaned;
    }
  }

  // Fallback to checking entire text for known locations
  const fallbackHits = findKnownIn(text);
  if (fallbackHits.length > 0) {
    const city = fallbackHits.find((h) => h !== 'Work From Home' && h !== 'Remote' && h !== 'Hybrid');
    return city || fallbackHits[0];
  }

  return null;
}

/**
 * Extracts package / CTC / stipend.
 */
export function extractPackage(text: string): string | null {
  const match = text.match(/(?:ctc|package|salary|stipend)\s*[:\-]?\s*(?:is\s*)?(?:Rs\.?|₹|INR)?\s*[\d.]+\s*(?:LPA|Lacs|Lakhs|per annum|\/\s*month)?(?:\s*(?:[-–—]|to)\s*(?:Rs\.?|₹|INR)?\s*[\d.]+\s*(?:LPA|Lacs|Lakhs|per annum|\/\s*month)?)?/i);
  if (match && match[0]) {
    const val = match[0]
      .replace(/^(?:ctc|package|salary|stipend)\s*[:\-]?\s*/i, '')
      .trim()
      .split(/\b(?:location|deadline|eligible|batch|courses?|profiles?)\b/i)[0]
      .trim();
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
 * Supports explicit dates ("Deadline: 22 September 2026"), apply-link
 * closures ("Apply link closes at 3.00 PM today" resolved against the
 * email's received date), and falls back to the campus-drive event date
 * ("Date of Campus Drive - 30th September, 2026") when no apply deadline
 * is stated.
 */
export function extractDeadline(
  text: string,
  referenceDateIso?: string | null
): { deadline: string | null; precision: DeadlinePrecision } {
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

  // "Apply link closes at 3.00 PM today" / "Registration closes tomorrow"
  const closesMatch = text.match(/(?:apply|application|registration|registrations?|forms?|links?)[^\n\r]*?clos(?:e|es|ing)(?:\s+at\s+(\d{1,2})(?:[.:](\d{2}))?\s*(AM|PM))?[^\n\r.]*?\b(today|tomorrow)\b/i);
  if (closesMatch) {
    const dayWord = (closesMatch[4] || 'today').toLowerCase();
    const base = referenceDateIso ? new Date(referenceDateIso) : new Date();
    if (!isNaN(base.getTime())) {
      const day = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), 23, 59, 59, 999));
      if (dayWord === 'tomorrow') {
        day.setUTCDate(day.getUTCDate() + 1);
      }
      const hourRaw = closesMatch[1] ? parseInt(closesMatch[1], 10) : null;
      if (hourRaw !== null) {
        let hour = hourRaw % 12;
        const meridiem = (closesMatch[3] || '').toUpperCase();
        if (meridiem === 'PM') hour += 12;
        const minute = closesMatch[2] ? parseInt(closesMatch[2], 10) : 0;
        day.setUTCHours(hour, minute, 0, 0);
        return { deadline: day.toISOString(), precision: 'EXACT_TIME' };
      }
      return { deadline: day.toISOString(), precision: 'DATE_ONLY' };
    }
  }

  // Fallback: the drive event date doubles as the actionable deadline.
  const driveDateMatch = text.match(/(?:date\s+of\s+(?:campus\s+)?drive|drive\s+(?:date|on)|campus\s+drive\s+on)\s*[-–—:]*\s*([0-9]{1,2}(?:st|nd|rd|th)?\s+[a-zA-Z]+[,\s]+[0-9]{4})/i);
  if (driveDateMatch && driveDateMatch[1]) {
    const rawDate = driveDateMatch[1].replace(/(\d)(st|nd|rd|th)\b/i, '$1').trim();
    const parsed = parseDateOnlyToUtcEndOfDay(rawDate);
    if (parsed) {
      return { deadline: parsed, precision: 'DATE_ONLY' };
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

const APPLY_LABEL_RE = /apply|regist(?:er|ration)|application\s*(?:form|link)|fill\s+(?:this|the)?\s*form|enrol?l/i;
const JD_LABEL_RE = /\bjd\b|job\s*description/i;
/** Hosts that are virtually always application forms / ATS portals. */
const APPLY_HOST_RE =
  /forms\.gle|docs\.google\.com\/forms|forms\.office\.com|tally\.so|typeform\.com|jotform|unstop\.com|dare2compete|supers?t\.com|internshala\.com|wellfound\.com|naukri\.com|linkedin\.com\/jobs|foundit\.in|apna\.co|cocubes|amcat|hirepro|talentnext|myanatomy|pitchnhire/i;
/** Generic shorteners: apply-link only with an apply label, never alone. */
const SHORTENER_HOST_RE = /bit\.ly|tinyurl\.com|t\.ly|goo\.gl|cutt\.ly/i;
/** Hosts that are virtually always the job description. */
const JD_HOST_RE = /drive\.google\.com|docs\.google\.com\/document/i;
const CHAT_HOST_RE = /whatsapp\.com|t\.me|telegram\.me|chat\.whatsapp/i;

function cleanUrl(url: string): string {
  return url.replace(/[.,;!)'"\]]+$/g, '').trim();
}

/**
 * Extracts links (Application link, Job Description link, Company website).
 * Handles Google Forms, ATS portals (Superset/Unstop/…), shorteners, "Click
 * here" anchors (via surrounding label context) and label-on-one-line +
 * URL-on-next-line layouts.
 */
export function extractLinks($: cheerio.CheerioAPI, text: string): {
  applyUrl: string | null;
  jobDescriptionUrl: string | null;
  companyWebsite: string | null;
} {
  let applyUrl: string | null = null;
  let jobDescriptionUrl: string | null = null;
  let companyWebsite: string | null = null;

  const linkContext = (el: any): string => {
    const anchorText = $(el).text().trim();
    const parentText = $(el).parent().text().trim().slice(0, 200);
    const prevText = $(el).prev().text().trim().slice(-120);
    return `${anchorText} ${prevText} ${parentText}`;
  };

  $('a').each((_, el) => {
    const rawHref = $(el).attr('href')?.trim();
    if (!rawHref || rawHref.startsWith('mailto:') || rawHref.startsWith('#')) return;
    const href = cleanUrl(rawHref);
    const context = linkContext(el);

    const isJdHost = JD_HOST_RE.test(href);
    const isApplyHost = APPLY_HOST_RE.test(href);
    const isShortener = SHORTENER_HOST_RE.test(href);
    const hasApplyLabel = APPLY_LABEL_RE.test(context);
    const hasJdLabel = JD_LABEL_RE.test(context);

    // ATS/form hosts are always apply-links; shorteners only beside an apply label.
    if (isApplyHost || (isShortener && hasApplyLabel)) {
      if (!applyUrl) applyUrl = href;
      return;
    }
    if (hasApplyLabel && !isJdHost && !CHAT_HOST_RE.test(href)) {
      if (!applyUrl) applyUrl = href;
      return;
    }
    if (isJdHost || (hasJdLabel && !hasApplyLabel)) {
      if (!jobDescriptionUrl) jobDescriptionUrl = href;
      return;
    }
    if (
      !href.includes('google.com') &&
      !APPLY_HOST_RE.test(href) &&
      !SHORTENER_HOST_RE.test(href) &&
      !CHAT_HOST_RE.test(href) &&
      href !== applyUrl &&
      href !== jobDescriptionUrl
    ) {
      const anchorText = $(el).text().trim().toLowerCase();
      if (
        anchorText.includes('website') ||
        anchorText.includes('company') ||
        anchorText.includes('http') ||
        anchorText.includes('.com')
      ) {
        if (!companyWebsite) companyWebsite = href;
      }
    }
  });

  const lines = text.split('\n');
  const findUrlOnLine = (line: string): string | null => {
    const m = line.match(/https?:\/\/[^\s<>)]+/i);
    return m ? cleanUrl(m[0]) : null;
  };

  if (!applyUrl) {
    // Label + URL on the same line: "Application Link: https://…", "Register here – …"
    for (const line of lines) {
      if (APPLY_LABEL_RE.test(line)) {
        const url = findUrlOnLine(line);
        if (url && !JD_HOST_RE.test(url) && !CHAT_HOST_RE.test(url)) {
          applyUrl = url;
          break;
        }
      }
    }
  }

  if (!applyUrl) {
    // Label on one line, bare URL on the next line.
    for (let i = 0; i < lines.length - 1; i++) {
      if (APPLY_LABEL_RE.test(lines[i]) && !findUrlOnLine(lines[i]) && !JD_LABEL_RE.test(lines[i])) {
        const url = findUrlOnLine(lines[i + 1]);
        if (url && !JD_HOST_RE.test(url) && !CHAT_HOST_RE.test(url)) {
          applyUrl = url;
          break;
        }
      }
    }
  }

  if (!applyUrl) {
    const formMatch = text.match(/https?:\/\/(?:forms\.gle\/[^\s<>)]+|docs\.google\.com\/forms\/[^\s<>)]+)/i);
    if (formMatch) applyUrl = cleanUrl(formMatch[0]);
  }

  if (!jobDescriptionUrl) {
    const driveMatch = text.match(/https?:\/\/(?:drive\.google\.com\/[^\s<>)]+|docs\.google\.com\/document\/[^\s<>)]+)/i);
    if (driveMatch) jobDescriptionUrl = cleanUrl(driveMatch[0]);
  }

  if (!companyWebsite) {
    // Match the whole URL token, then validate the host ends in a real TLD
    // (avoids truncating multi-dot hosts like app.superset.io to "app.superset").
    const candidates = text.match(/https?:\/\/[^\s<>)]+/gi) || [];
    for (const raw of candidates) {
      const url = cleanUrl(raw);
      if (url === applyUrl || url === jobDescriptionUrl) continue;
      const hostMatch = url.match(/^https?:\/\/([^/:]+)/i);
      const host = hostMatch ? hostMatch[1].toLowerCase() : '';
      if (!/\.[a-z]{2,}$/.test(host)) continue;
      if (
        /google\.com|saitm\.ac\.in|forms\.gle|whatsapp\.com|t\.me|telegram\.me|chat\.whatsapp/i.test(url) ||
        APPLY_HOST_RE.test(url) ||
        SHORTENER_HOST_RE.test(url)
      )
        continue;
      companyWebsite = url;
      break;
    }
  }

  return { applyUrl, jobDescriptionUrl, companyWebsite };
}

const NUMBERED_ROLE_SECTION_START =
  /(?:number of positions|below roles?|following roles?|open roles?|available roles?|list of roles?)/i;
const NUMBERED_ROLE_SECTION_END =
  /(?:job location|selection process|venue|reporting time|date of (?:campus\s+)?drive|join the whatsapp|thanks & regards|carry two copies)/i;
const NON_ROLE_LINE =
  /^(?:pre-placement|round\b|selection|online test|presentation|screening|machine test|\bgd\b|hr\b|interview|seminar|shortlist)/i;

/**
 * Parses one role line into a Position:
 *   "Python Developer (CTC Rs. 3.2 to 4.6 LPA) – M Tech/B Tech/MCA/BCA"
 * Handles optional leading bullets/numbers (Gmail <li> items lose numbering),
 * per-role CTC in parens, and a trailing course-eligibility suffix.
 * Returns null for selection-process steps and other non-role lines.
 */
function parseSingleRoleLine(
  rawLine: string,
  courses: string[],
  batches: number[],
  fallbackCtc: string | null,
  location: string | null
): Position | null {
  let roleText = rawLine
    .trim()
    // List items come straight from the DOM and skip the global plain-text
    // normalization — collapse nbsp/unicode-space runs here too.
    .replace(/[^\S]+/g, ' ')
    .replace(/^(\d+[.)]\s*|[•\-*]\s*)+/, '')
    .trim();
  if (roleText.length < 3 || roleText.length > 140) return null;
  if (NON_ROLE_LINE.test(roleText)) return null;

  let role = roleText;
  let roleCtc: string | null = fallbackCtc;
  let roleCourses = courses;

  const ctcMatch = roleText.match(/^(.*?)\s*\(\s*CTC\s*([^)]+)\)\s*[–—-]\s*(.*)?$/i);
  if (ctcMatch) {
    role = (ctcMatch[1] || '').trim();
    const ctcRaw = (ctcMatch[2] || '').trim();
    if (ctcRaw) {
      roleCtc = /^(?:Rs\.?|₹|INR)/i.test(ctcRaw) ? ctcRaw : `Rs. ${ctcRaw}`;
    }
    const suffix = (ctcMatch[3] || '').trim();
    if (suffix) {
      const suffixCourses = extractCourses('', suffix);
      if (suffixCourses.length > 0) roleCourses = suffixCourses;
    }
  } else {
    // Role without an inline CTC, e.g. "Associate Consultant – B.Tech, MBA"
    const dashParts = roleText.split(/\s+[–—-]\s+/);
    if (dashParts.length >= 2) {
      const maybeCourses = extractCourses('', dashParts[dashParts.length - 1]);
      if (maybeCourses.length > 0) {
        roleCourses = maybeCourses;
        role = dashParts.slice(0, -1).join(' - ').trim();
      }
    }
  }

  role = role.replace(/\s*[–—-]\s*$/, '').trim();
  if (role.length < 3 || role.length > 80 || NON_ROLE_LINE.test(role)) return null;
  if (!/[A-Za-z]/.test(role)) return null;

  return {
    role,
    ctc: roleCtc,
    location,
    eligible_courses: roleCourses,
    eligible_batches: batches,
  };
}

/**
 * Parses Gmail <ul>/<ol> list items as roles. Gmail's composer converts typed
 * numbered lists into <ol><li> (dropping the "1." prefixes), so the numbered
 * line parser below never sees them. Accepts a list when it carries role
 * signals — inline "(CTC …)" or a role-context introducer ("Profiles:",
 * "Number of Positions…", …) — and rejects selection-process style lists.
 */
function extractListItemRoles(
  $: cheerio.CheerioAPI,
  courses: string[],
  batches: number[],
  fallbackCtc: string | null,
  location: string | null
): Position[] {
  const lists = $('ul, ol').toArray();
  if (lists.length === 0) return [];

  const ROLE_LIST_CONTEXT = /(profil|position|\brole|opening|\bjob\b)/i;
  const STEP_LIST_CONTEXT = /(selection|process|round|steps?|instructions?|documents?|note:)/i;

  for (const listEl of lists) {
    const items = $(listEl).find('li').toArray();
    if (items.length === 0) continue;
    const rawItems = items.map((li) => $(li).text().trim()).filter((t) => t.length > 0);
    if (rawItems.length === 0) continue;

    const prevText = $(listEl).prev().text();
    const hasCtc = rawItems.some((t) => /\(\s*CTC/i.test(t));
    const contextLooksLikeRoles =
      ROLE_LIST_CONTEXT.test(prevText) && !STEP_LIST_CONTEXT.test(prevText);

    // Trust the list when items carry CTCs, or when 2+ items follow a role introducer.
    if (!hasCtc && !(contextLooksLikeRoles && rawItems.length >= 2)) continue;
    // A selection-process list never carries CTCs; skip step-like lists defensively.
    if (!hasCtc && STEP_LIST_CONTEXT.test(prevText)) continue;

    const parsed = rawItems
      .map((t) => parseSingleRoleLine(t, courses, batches, fallbackCtc, location))
      .filter((p): p is Position => p !== null);
    if (parsed.length === 0) continue;
    if (!hasCtc && parsed.length < 2) continue;
    // Guard: a stray single item that parses but isn't role-like shouldn't win.
    if (parsed.length === 1 && !hasCtc) {
      const only = parsed[0].role;
      if (!/developer|executive|marketing|designer|engineer|consultant|analyst|intern|associate|manager|trainee|officer|specialist/i.test(only)) continue;
    }
    return parsed;
  }

  return [];
}

/**
 * Parses numbered role lists ("1. Python Developer (CTC …) – …").
 * Each role keeps its own CTC and per-role course eligibility.
 */
function extractNumberedRoles(
  text: string,
  courses: string[],
  batches: number[],
  fallbackCtc: string | null,
  location: string | null
): Position[] {
  let scope = text;
  const startMatch = text.match(NUMBERED_ROLE_SECTION_START);
  if (startMatch && startMatch.index !== undefined) {
    scope = text.slice(startMatch.index + startMatch[0].length);
    const endMatch = scope.match(NUMBERED_ROLE_SECTION_END);
    if (endMatch && endMatch.index !== undefined) {
      scope = scope.slice(0, endMatch.index);
    }
  }

  const profiles: Position[] = [];
  for (const rawLine of scope.split('\n')) {
    const line = rawLine.trim();
    // Numbered lines only here ("1. …"); plain/bullet lines are handled by
    // the <li> parser above and the generic fallbacks below.
    if (!/^\d+[.)]\s*.+/.test(line)) continue;
    const parsed = parseSingleRoleLine(line, courses, batches, fallbackCtc, location);
    if (parsed) profiles.push(parsed);
  }

  // Only trust the numbered parse when it found real roles; otherwise let the
  // generic parsers below have a go (avoids selection-process steps leaking in).
  if (profiles.length === 0) return [];
  if (startMatch === null) {
    const looksLikeRoles = profiles.some((p) => /developer|executive|marketing|designer|engineer|consultant|analyst|intern|associate|manager/i.test(p.role));
    if (!looksLikeRoles) return [];
  }
  return profiles;
}

/**
 * Extracts multiple profiles/positions from email body and subject.
 * Supports the Director-TNP numbered style with per-role CTC:
 *   1. Python Developer (CTC Rs. 3.2 to 4.6 LPA) – M Tech/B Tech/MCA/BCA
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

  // Gmail <ol>/<ul> items first (typed numbered lists lose their "1." prefixes).
  const listed = extractListItemRoles($, courses, batches, ctc, location);
  if (listed.length > 0) return listed;

  const numbered = extractNumberedRoles(text, courses, batches, ctc, location);
  if (numbered.length > 0) return numbered;

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
  // Normalize early: Gmail emits &nbsp; for repeated spaces and <ol>/<li>
  // for typed numbered lists — every extractor below expects clean text.
  const plainText = normalizePlainText($.text());

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
  const { deadline, precision: deadlinePrecision } = extractDeadline(plainText, input.date);
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
    parser_version: PARSER_VERSION,
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
