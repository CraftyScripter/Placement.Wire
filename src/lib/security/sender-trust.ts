/**
 * Central allowlist for SAITM placement senders.
 *
 * Only mail from the Training & Placement apparatus is ever ingested:
 * the CRC/T&P desk (`placements@…`), the Director-TNP desk
 * (`directortnp@…`), plus future placement desks matched by local-part
 * heuristic (`tnp@`, `crc@`, `careers@`, `tpo@`, …).
 *
 * Deliberately NOT the whole `@saitm.ac.in` domain — department, faculty
 * and admin mail (workshops, notices, circulars) must never inflate the
 * placement dashboard. This module has zero dependencies so it can be
 * imported from client components, route handlers and the parser alike.
 */

export const TRUSTED_PLACEMENT_SENDERS = [
  'placements@saitm.org',
  'placements@saitm.ac.in',
  'directortnp@saitm.ac.in',
];

/** Local-part fragments identifying a placement/careers desk. */
const PLACEMENT_DESK_PATTERN = /placement|tnp|tpo|crc|career|corporate|recruit/i;

const TRUSTED_DOMAINS = new Set(['saitm.ac.in', 'saitm.org']);

/**
 * Returns true only for mail sent by a SAITM placement desk.
 * Extracts the addr-spec out of display names ("Director tnp <a@b>") and
 * compares exact addresses (no substring tricks) with exact trusted domains
 * (no subdomain spoofing like placements@saitm.ac.in.evil.com).
 */
export function isTrustedPlacementSender(sender: string = ''): boolean {
  const s = sender.toLowerCase();
  const addrMatch = s.match(/([a-z0-9._%+-]+@[a-z0-9.-]+)/);
  const addr = addrMatch ? addrMatch[1] : s.trim();
  if ((TRUSTED_PLACEMENT_SENDERS as string[]).includes(addr)) return true;

  const parts = addr.match(/^([a-z0-9._%+-]+)@([a-z0-9.-]+)$/);
  if (!parts) return false;
  const [, localPart, domain] = parts;
  if (!TRUSTED_DOMAINS.has(domain)) return false;
  return PLACEMENT_DESK_PATTERN.test(localPart);
}
