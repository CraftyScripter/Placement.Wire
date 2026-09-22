import { drive_v3 } from 'googleapis';
import { getDriveClient, findOrCreateFolder } from '@/lib/drive/drive-service';

const BACKUP_FILE = 'admin_analytics.json';
const MIME_JSON = 'application/json';

/**
 * Mirrors the local analytics JSON into the ADMIN's own Google Drive
 * (PlacementWire_Data/admin_analytics.json) using the admin's access token.
 * No MongoDB needed — Drive is the cloud copy, local data/ file is primary.
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
