import { PlacementDrive } from '@/schemas/placement.schema';

/**
 * Builds a Gmail web URL that opens the original email a drive was parsed from.
 *
 * Real Gmail-synced drives carry the Gmail API message ID in
 * `source.gmail_message_id`, which Gmail resolves directly via #all/{id}.
 * Demo/fixture drives (ids like "msg_...") have no real mailbox behind them,
 * so those fall back to a Gmail subject search instead.
 */
export function getOriginalEmailUrl(drive: PlacementDrive): string | null {
  const msgId = drive.source?.gmail_message_id?.trim();

  if (msgId && !msgId.startsWith('msg_')) {
    return `https://mail.google.com/mail/u/0/#all/${msgId}`;
  }

  const subject = drive.source?.subject?.trim();
  if (subject) {
    return `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(subject)}`;
  }

  return null;
}
