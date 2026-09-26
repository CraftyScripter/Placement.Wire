import crypto from 'crypto';

/**
 * Generates a stable, deterministic placement identifier from a Gmail Message ID.
 * Example format: gmail_msg_<16-char hex sha256>
 */
export function generatePlacementId(gmailMessageId: string): string {
  if (!gmailMessageId) {
    throw new Error('gmailMessageId is required to generate placement ID');
  }
  const hash = crypto.createHash('sha256').update(gmailMessageId.trim()).digest('hex');
  return `gmail_msg_${hash.slice(0, 16)}`;
}
