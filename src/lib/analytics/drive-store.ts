import { getDriveClient, findOrCreateFolder } from '@/lib/drive/drive-service';
import { getOAuth2Client } from '@/lib/google/oauth';
import type { AnalyticsFile } from './store';
import { emptyAnalyticsFile } from './store';

const ANALYTICS_FILE = 'admin_analytics.json';
const MIME_JSON = 'application/json';
const WRITE_RETRIES = 3;

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cached: CachedToken | null = null;

/** Exchange the stored admin refresh token for a short-lived access token. */
export async function getAdminDriveToken(refreshToken: string): Promise<string> {
  if (cached && Date.now() < cached.expiresAt - 60_000) return cached.token;
  const client = getOAuth2Client();
  client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await client.refreshAccessToken();
  if (!credentials.access_token) throw new Error('Drive token refresh failed');
  cached = {
    token: credentials.access_token,
    expiresAt: credentials.expiry_date || Date.now() + 50 * 60_000,
  };
  return cached.token;
}

async function findAnalyticsFileId(drive: ReturnType<typeof getDriveClient>): Promise<string | null> {
  const folderId = await findOrCreateFolder(drive);
  const q = `name = '${ANALYTICS_FILE}' and '${folderId}' in parents and trashed = false`;
  const listed = await drive.files.list({ q, spaces: 'drive', fields: 'files(id)' });
  return listed.data.files?.[0]?.id || null;
}

/** Read the cumulative analytics file from the admin's Drive. */
export async function readDriveAnalytics(refreshToken: string): Promise<AnalyticsFile | null> {
  const accessToken = await getAdminDriveToken(refreshToken);
  const drive = getDriveClient(accessToken);
  const fileId = await findAnalyticsFileId(drive);
  if (!fileId) return null;
  const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'text' });
  const raw = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  if ((parsed as { version?: number }).version !== 2) return null;
  return parsed as unknown as AnalyticsFile;
}

/**
 * Read-modify-write with retries. Concurrent beacons on serverless can race;
 * each retry re-reads, so the last writer merges onto the freshest state.
 */
export async function updateDriveAnalytics(
  refreshToken: string,
  mutate: (data: AnalyticsFile) => void
): Promise<AnalyticsFile> {
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < WRITE_RETRIES; attempt++) {
    try {
      const accessToken = await getAdminDriveToken(refreshToken);
      const drive = getDriveClient(accessToken);
      const data = (await readDriveAnalytics(refreshToken)) || emptyAnalyticsFile();
      mutate(data);
      data.updatedAt = new Date().toISOString();
      data.totals.visitors = Object.keys(data.visitors).length;
      const body = JSON.stringify(data);
      const fileId = await findAnalyticsFileId(drive);
      if (fileId) {
        await drive.files.update({
          fileId,
          media: { mimeType: MIME_JSON, body },
          fields: 'id',
        });
      } else {
        const folderId = await findOrCreateFolder(drive);
        await drive.files.create({
          requestBody: { name: ANALYTICS_FILE, mimeType: MIME_JSON, parents: [folderId] },
          media: { mimeType: MIME_JSON, body },
          fields: 'id',
        });
      }
      return data;
    } catch (err) {
      lastErr = err;
      cached = null; // force token refresh on retry
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Drive analytics write failed');
}

/** Force-overwrite the Drive copy (used by the manual Backup button). */
export async function overwriteDriveAnalytics(
  refreshToken: string,
  data: AnalyticsFile
): Promise<{ fileId: string }> {
  const accessToken = await getAdminDriveToken(refreshToken);
  const drive = getDriveClient(accessToken);
  const body = JSON.stringify(data);
  const fileId = await findAnalyticsFileId(drive);
  if (fileId) {
    await drive.files.update({ fileId, media: { mimeType: MIME_JSON, body }, fields: 'id' });
    return { fileId };
  }
  const folderId = await findOrCreateFolder(drive);
  const created = await drive.files.create({
    requestBody: { name: ANALYTICS_FILE, mimeType: MIME_JSON, parents: [folderId] },
    media: { mimeType: MIME_JSON, body },
    fields: 'id',
  });
  if (!created.data.id) throw new Error('Drive analytics create failed');
  return { fileId: created.data.id };
}
