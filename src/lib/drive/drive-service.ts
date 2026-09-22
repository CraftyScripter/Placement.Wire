import { google, drive_v3 } from 'googleapis';
import { getOAuth2Client } from '@/lib/google/oauth';
import {
  PlacementFile,
  PlacementFileSchema,
  createEmptyPlacementFile,
} from '@/schemas/placement.schema';

const FOLDER_NAME = 'PlacementWire_Data';
const FILE_NAME = 'placements.json';
const MIME_FOLDER = 'application/vnd.google-apps.folder';
const MIME_JSON = 'application/json';

export interface DriveFileInfo {
  fileId: string;
  folderId?: string;
  modifiedTime?: string;
  version?: string;
}

/**
 * Creates an authorized Drive v3 client from an OAuth access token
 */
export function getDriveClient(accessToken: string): drive_v3.Drive {
  const auth = getOAuth2Client();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth });
}

/**
 * Finds or creates the PlacementWire_Data folder in Google Drive
 */
export async function findOrCreateFolder(drive: drive_v3.Drive): Promise<string> {
  const query = `name = '${FOLDER_NAME}' and mimeType = '${MIME_FOLDER}' and trashed = false`;
  const res = await drive.files.list({
    q: query,
    spaces: 'drive',
    fields: 'files(id, name)',
  });

  if (res.data.files && res.data.files.length > 0 && res.data.files[0].id) {
    return res.data.files[0].id;
  }

  // Create folder if not found
  const createRes = await drive.files.create({
    requestBody: {
      name: FOLDER_NAME,
      mimeType: MIME_FOLDER,
      description: 'PlacementWire user-owned placement storage folder',
    },
    fields: 'id',
  });

  if (!createRes.data.id) {
    throw new Error('Failed to create PlacementWire_Data folder in Google Drive');
  }

  return createRes.data.id;
}

/**
 * Finds the placements.json file inside the PlacementWire_Data folder
 */
export async function findPlacementsFile(drive: drive_v3.Drive): Promise<DriveFileInfo | null> {
  const folderId = await findOrCreateFolder(drive);
  const query = `name = '${FILE_NAME}' and '${folderId}' in parents and trashed = false`;

  const res = await drive.files.list({
    q: query,
    spaces: 'drive',
    fields: 'files(id, name, modifiedTime, version)',
  });

  if (res.data.files && res.data.files.length > 0 && res.data.files[0].id) {
    const file = res.data.files[0];
    return {
      fileId: file.id!,
      folderId,
      modifiedTime: file.modifiedTime || undefined,
      version: file.version || undefined,
    };
  }

  return null;
}

/**
 * Initializes a new placements.json file in the user's Google Drive
 */
export async function createPlacementsFile(
  drive: drive_v3.Drive,
  initialData?: PlacementFile
): Promise<{ fileInfo: DriveFileInfo; data: PlacementFile }> {
  const folderId = await findOrCreateFolder(drive);
  const content = initialData || createEmptyPlacementFile();
  const fileContentString = JSON.stringify(content, null, 2);

  const res = await drive.files.create({
    requestBody: {
      name: FILE_NAME,
      mimeType: MIME_JSON,
      parents: [folderId],
      description: 'PlacementWire structured user placement data',
    },
    media: {
      mimeType: MIME_JSON,
      body: fileContentString,
    },
    fields: 'id, modifiedTime, version',
  });

  if (!res.data.id) {
    throw new Error('Failed to create placements.json in Google Drive');
  }

  return {
    fileInfo: {
      fileId: res.data.id,
      folderId,
      modifiedTime: res.data.modifiedTime || undefined,
      version: res.data.version || undefined,
    },
    data: content,
  };
}

/**
 * Fetches and validates placements.json from Google Drive.
 * Automatically initializes if the file does not exist yet.
 */
export async function fetchPlacementsJson(
  accessToken: string
): Promise<{ data: PlacementFile; fileInfo: DriveFileInfo }> {
  const drive = getDriveClient(accessToken);
  let fileInfo = await findPlacementsFile(drive);

  if (!fileInfo) {
    // First time setup - initialize new file
    const created = await createPlacementsFile(drive);
    return {
      data: created.data,
      fileInfo: created.fileInfo,
    };
  }

  // Fetch file content
  const res = await drive.files.get(
    {
      fileId: fileInfo.fileId,
      alt: 'media',
    },
    { responseType: 'text' }
  );

  let rawJson: any;
  try {
    rawJson = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
  } catch (parseError) {
    console.warn('Malformed JSON in Drive, recovering with empty schema structure');
    rawJson = createEmptyPlacementFile();
  }

  // Validate with Zod
  const parsed = PlacementFileSchema.safeParse(rawJson);
  const validData = parsed.success ? parsed.data : createEmptyPlacementFile();

  return {
    data: validData,
    fileInfo,
  };
}

/**
 * Updates placements.json in Google Drive with optimistic revision increment
 */
export async function updatePlacementsJson(
  accessToken: string,
  updatedData: PlacementFile
): Promise<{ data: PlacementFile; fileInfo: DriveFileInfo }> {
  const drive = getDriveClient(accessToken);
  let fileInfo = await findPlacementsFile(drive);

  // Validate incoming data
  const validated = PlacementFileSchema.parse({
    ...updatedData,
    last_synced_at: new Date().toISOString(),
    revision: (updatedData.revision || 1) + 1,
  });

  if (!fileInfo) {
    return await createPlacementsFile(drive, validated);
  }

  const fileContentString = JSON.stringify(validated, null, 2);

  const res = await drive.files.update({
    fileId: fileInfo.fileId,
    media: {
      mimeType: MIME_JSON,
      body: fileContentString,
    },
    fields: 'id, modifiedTime, version',
  });

  return {
    data: validated,
    fileInfo: {
      fileId: fileInfo.fileId,
      folderId: fileInfo.folderId,
      modifiedTime: res.data.modifiedTime || undefined,
      version: res.data.version || undefined,
    },
  };
}
