import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-guard';
import { getDriveClient, findPlacementsFile } from '@/lib/drive/drive-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { session, accessToken } = auth.context;

  if (session.user.isMockUser) {
    return NextResponse.json({
      connected: true,
      fileExists: true,
      fileName: 'placements.json',
      folderName: 'PlacementWire_Data',
      storageType: 'mock_local',
      lastModified: new Date().toISOString(),
    });
  }

  try {
    const drive = getDriveClient(accessToken);
    const fileInfo = await findPlacementsFile(drive);

    return NextResponse.json({
      connected: true,
      fileExists: Boolean(fileInfo),
      fileId: fileInfo?.fileId || null,
      folderId: fileInfo?.folderId || null,
      fileName: 'placements.json',
      folderName: 'PlacementWire_Data',
      storageType: 'google_drive',
      lastModified: fileInfo?.modifiedTime || null,
    });
  } catch (err: any) {
    console.error('Error checking Drive status:', err);
    return NextResponse.json(
      { error: 'DriveStatusError', message: 'Could not communicate with Google Drive.' },
      { status: 500 }
    );
  }
}
