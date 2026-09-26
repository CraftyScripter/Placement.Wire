import { drive_v3 } from 'googleapis';
import { getDriveClient, findOrCreateFolder } from '@/lib/drive/drive-service';

const BACKUP_FILE = 'admin_analytics.dev.json';
const MIME_JSON = 'application/json';

/**
 * Mirrors the LOCAL (dev) analytics JSON into the admin's own Google Drive.
 *
 * File separation is deliberate and must stay:
 *  - `admin_analytics.json`      = PRODUCTION live log (Vercel reads/writes).
 *  - `admin_analytics.dev.json`  = manual snapshots uploaded from localhost.
 * A dev backup must NEVER overwrite the prod live file — that cross-env
 * overwrite is what once mixed localhost hits into production data.
 */
export async function backupAnalyticsToAdminDrive(
  adminAccessToken: string,
  payload: unknown
): Promise<{ fileId: string; fileName: string }> {
  const drive = getDriveClient(adminAccessToken);
  const folderId = await findOrCreateFolder(drive);

  const q = `name = '${BACKUP_FILE}' and '${folderId}' in parents and trashed = false`;
  const listed = await drive.files.list({
    q,
    spaces: 'drive',
    // Newest first: Drive list order is otherwise undefined, which once
    // caused updates to land on stale duplicates. (Duplicates are trashed;
    // one canonical file remains.)
    orderBy: 'modifiedTime desc',
    fields: 'files(id, name)',
  });
  const existing = listed.data.files?.[0]?.id;
  // Compact (non-pretty) JSON: ~30% smaller backup payload.
  const body = JSON.stringify(payload);

  if (existing) {
    await drive.files.update({
      fileId: existing,
      media: { mimeType: MIME_JSON, body },
      fields: 'id',
    });
    return { fileId: existing, fileName: BACKUP_FILE };
  }

  const created = await drive.files.create({
    requestBody: { name: BACKUP_FILE, mimeType: MIME_JSON, parents: [folderId] },
    media: { mimeType: MIME_JSON, body },
    fields: 'id',
  });
  if (!created.data.id) throw new Error('Drive backup create failed');
  return { fileId: created.data.id, fileName: BACKUP_FILE };
}

export type { drive_v3 };
