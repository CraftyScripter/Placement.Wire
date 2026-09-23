import { google, gmail_v1 } from 'googleapis';
import { getOAuth2Client } from '@/lib/google/oauth';
import { RawEmailInput, parsePlacementEmail } from '@/lib/parser/email-parser';
import { PlacementDrive } from '@/schemas/placement.schema';

export const GMAIL_PLACEMENT_QUERY =
  '(from:placements@saitm.org OR from:placements@saitm.ac.in) -from:me -in:sent -in:drafts -in:trash -in:spam';

export interface GmailSyncResult {
  drives: PlacementDrive[];
  hasMore: boolean;
  remainingCount: number;
}

export function getGmailClient(accessToken: string): gmail_v1.Gmail {
  const auth = getOAuth2Client();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth });
}

/**
 * Decodes URL-safe base64 strings used by Gmail API
 */
function decodeBase64(base64Str: string): string {
  try {
    const cleaned = base64Str.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(cleaned, 'base64').toString('utf-8');
  } catch (e) {
    return '';
  }
}

/**
 * Extracts HTML and plain text bodies from a Gmail MIME payload
 */
function extractBodyFromPayload(payload: gmail_v1.Schema$MessagePart | undefined): {
  html: string;
  text: string;
} {
  let html = '';
  let text = '';

  if (!payload) return { html, text };

  if (payload.body?.data) {
    const decoded = decodeBase64(payload.body.data);
    if (payload.mimeType === 'text/html') {
      html += decoded;
    } else {
      text += decoded;
    }
  }

  if (payload.parts && payload.parts.length > 0) {
    for (const part of payload.parts) {
      const nested = extractBodyFromPayload(part);
      if (nested.html) html += nested.html;
      if (nested.text) text += nested.text;
    }
  }

  return { html, text };
}

/**
 * Fetches and parses placement emails from the user's Gmail inbox with pagination
 * and concurrent batch processing.
 */
export async function syncRecentPlacementEmails(
  accessToken: string,
  maxResults: number = 250,
  knownMessageIds?: Set<string>
): Promise<GmailSyncResult> {
  const gmail = getGmailClient(accessToken);

  // 1. Search for placement-related messages with pagination loop
  const allMessages: gmail_v1.Schema$Message[] = [];
  let pageToken: string | undefined = undefined;

  do {
    const fetchCount = Math.min(100, maxResults - allMessages.length);
    if (fetchCount <= 0) break;

    const listRes: { data: gmail_v1.Schema$ListMessagesResponse } = await gmail.users.messages.list({
      userId: 'me',
      q: GMAIL_PLACEMENT_QUERY,
      maxResults: fetchCount,
      pageToken,
    });

    const pageMessages = listRes.data.messages || [];
    allMessages.push(...pageMessages);
    pageToken = listRes.data.nextPageToken || undefined;
  } while (pageToken && allMessages.length < maxResults);

  if (allMessages.length === 0) {
    return { drives: [], hasMore: false, remainingCount: 0 };
  }

  // Filter out any messages whose ID we already have parsed and stored locally or on Drive
  const messagesToFetch =
    knownMessageIds && knownMessageIds.size > 0
      ? allMessages.filter((m) => m.id && !knownMessageIds.has(m.id))
      : allMessages;

  if (messagesToFetch.length === 0) {
    return { drives: [], hasMore: false, remainingCount: 0 };
  }

  const parsedDrives: PlacementDrive[] = [];

  // 2. Fetch full message details in small, paced batches (4 at a time with 250ms gap)
  // Cap at 25 new messages per sync invocation (125 quota units) to stay safely below
  // Gmail's 250 units/min per-user limit.
  const MAX_PER_RUN = 25;
  const messagesToProcess = messagesToFetch.slice(0, MAX_PER_RUN);
  const BATCH_SIZE = 4;
  let rateLimitEncountered = false;

  for (let i = 0; i < messagesToProcess.length; i += BATCH_SIZE) {
    if (rateLimitEncountered) break;

    const batch = messagesToProcess.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (msgRef) => {
        if (!msgRef.id) return null;

        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const msgRes = await gmail.users.messages.get({
              userId: 'me',
              id: msgRef.id,
              format: 'full',
            });

            const message = msgRes.data;
            const labelIds = message.labelIds || [];
            // Skip any email that was sent or drafted by the user
            if (labelIds.includes('SENT') || labelIds.includes('DRAFT')) {
              return null;
            }

            const headers = message.payload?.headers || [];

            const getHeader = (name: string) =>
              headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

            const subject = getHeader('Subject');
            const sender = getHeader('From');
            const normSender = sender.toLowerCase();

            // STRICT CHECK: The email MUST be directly received from placements@saitm.org (or placements@saitm.ac.in)
            if (!normSender.includes('placements@saitm.org') && !normSender.includes('placements@saitm.ac.in')) {
              return null;
            }

            const date = getHeader('Date');

            const { html, text } = extractBodyFromPayload(message.payload);

            const rawInput: RawEmailInput = {
              id: msgRef.id,
              threadId: message.threadId,
              subject,
              sender,
              date: date ? new Date(date).toISOString() : new Date().toISOString(),
              bodyHtml: html,
              bodyText: text,
            };

            return parsePlacementEmail(rawInput);
          } catch (msgErr: any) {
            const isRateLimit =
              msgErr?.code === 429 ||
              (msgErr?.status === 403 &&
                (msgErr?.message?.includes('Quota exceeded') ||
                  msgErr?.message?.includes('rateLimitExceeded') ||
                  JSON.stringify(msgErr?.errors || []).includes('rateLimitExceeded')));

            if (isRateLimit) {
              if (attempt === 0) {
                // Back off briefly and retry once
                await new Promise((resolve) => setTimeout(resolve, 1500));
                continue;
              } else {
                rateLimitEncountered = true;
                console.warn(`Gmail rate limit hit for message ${msgRef.id}, gracefully saving progress.`);
                return null;
              }
            }

            console.warn(`Could not process message ${msgRef.id}:`, msgErr?.message || msgErr);
            return null;
          }
        }
        return null;
      })
    );

    for (const drive of results) {
      if (drive) {
        parsedDrives.push(drive);
      }
    }

    // Pacing delay between batches to stay within rate limits
    if (i + BATCH_SIZE < messagesToProcess.length && !rateLimitEncountered) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  const remainingCount = Math.max(0, messagesToFetch.length - messagesToProcess.length);
  return {
    drives: parsedDrives,
    hasMore: remainingCount > 0,
    remainingCount,
  };
}
