import { google, gmail_v1 } from 'googleapis';
import { getOAuth2Client } from '@/lib/google/oauth';
import { RawEmailInput, parsePlacementEmail } from '@/lib/parser/email-parser';
import { PlacementDrive } from '@/schemas/placement.schema';

export const GMAIL_PLACEMENT_QUERY =
  '{from:saitm.org from:saitm.ac.in subject:placement subject:drive subject:hiring subject:recruitment subject:campus subject:opportunity subject:internship subject:hackathon} label:INBOX';

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
 * Fetches and parses recent placement emails from the user's Gmail inbox
 */
export async function syncRecentPlacementEmails(
  accessToken: string,
  maxResults: number = 50
): Promise<PlacementDrive[]> {
  const gmail = getGmailClient(accessToken);

  // 1. Search for placement-related messages
  const listRes = await gmail.users.messages.list({
    userId: 'me',
    q: GMAIL_PLACEMENT_QUERY,
    maxResults,
  });

  const messages = listRes.data.messages || [];
  if (messages.length === 0) {
    return [];
  }

  const parsedDrives: PlacementDrive[] = [];

  // 2. Fetch full message details
  for (const msgRef of messages) {
    if (!msgRef.id) continue;

    try {
      const msgRes = await gmail.users.messages.get({
        userId: 'me',
        id: msgRef.id,
        format: 'full',
      });

      const message = msgRes.data;
      const headers = message.payload?.headers || [];

      const getHeader = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

      const subject = getHeader('Subject');
      const sender = getHeader('From');
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

      const drive = parsePlacementEmail(rawInput);
      if (drive) {
        parsedDrives.push(drive);
      }
    } catch (msgErr) {
      console.warn(`Could not process message ${msgRef.id}:`, msgErr);
    }
  }

  return parsedDrives;
}
