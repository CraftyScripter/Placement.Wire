import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-guard';
import { syncRecentPlacementEmails } from '@/lib/gmail/gmail-service';
import { fetchPlacementsJson, updatePlacementsJson } from '@/lib/drive/drive-service';
import { mergePlacementDrives } from '@/lib/parser/merger';
import { getSamplePlacementDrives } from '@/lib/parser/fixtures';
import { PlacementDrive, createEmptyPlacementFile } from '@/schemas/placement.schema';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { session, accessToken } = auth.context;

  // Read optionally provided current client-side drives for optimistic fast sync
  const body = await req.json().catch(() => ({}));
  const clientDrives: PlacementDrive[] = Array.isArray(body.currentDrives) ? body.currentDrives : [];

  if (session.user.isMockUser) {
    // Development mock sync: generate sample placement drives
    const sampleDrives = getSamplePlacementDrives();
    const mergeResult = mergePlacementDrives(clientDrives, sampleDrives);

    return NextResponse.json({
      success: true,
      addedCount: mergeResult.addedCount,
      updatedCount: mergeResult.updatedCount,
      totalDrives: mergeResult.mergedDrives.length,
      drives: mergeResult.mergedDrives,
      syncedAt: new Date().toISOString(),
      source: 'mock_ingestion',
    });
  }

  try {
    // 1. Fetch current placements from Google Drive (with graceful fallback if Drive API is disabled)
    let currentFile = createEmptyPlacementFile();
    let driveAvailable = true;
    let driveWarning: string | null = null;

    try {
      const driveRes = await fetchPlacementsJson(accessToken);
      currentFile = driveRes.data;
    } catch (driveErr: any) {
      console.warn('Could not read from Google Drive, falling back to local client state:', driveErr?.message);
      driveAvailable = false;
      if (driveErr?.message?.includes('Google Drive API has not been used') || driveErr?.message?.includes('disabled')) {
        driveWarning = 'Google Drive API is disabled in your Google Cloud Project (790503158830). Data will be saved locally.';
      }
    }

    // Base drives to merge into
    const baseDrives = clientDrives.length > 0 ? clientDrives : currentFile.drives;

    // 2. Query Gmail for placement emails
    let newlyFetchedDrives: PlacementDrive[] = [];
    try {
      newlyFetchedDrives = await syncRecentPlacementEmails(accessToken, 30);
    } catch (gmailErr: any) {
      console.error('Gmail API error during sync:', gmailErr);

      const errMsg = gmailErr?.message || '';
      if (errMsg.includes('Gmail API has not been used') || errMsg.includes('disabled')) {
        return NextResponse.json(
          {
            error: 'GmailApiDisabled',
            message:
              'Gmail API is not enabled in your Google Cloud project. Please visit https://console.developers.google.com/apis/api/gmail.googleapis.com/overview?project=790503158830 to enable it.',
          },
          { status: 400 }
        );
      }

      if (errMsg.includes('insufficient authentication scopes') || gmailErr?.code === 403) {
        return NextResponse.json(
          {
            error: 'InsufficientScopes',
            message:
              'Your Google account lacks Gmail read permissions. Please log out and sign in again, ensuring you grant the required permissions.',
          },
          { status: 403 }
        );
      }

      throw gmailErr;
    }

    // 3. Non-destructively merge without overwriting user notes or statuses
    const mergeResult = mergePlacementDrives(baseDrives, newlyFetchedDrives);

    // 4. Update the user's Google Drive placements.json file if Drive is accessible
    const updatedFile = {
      ...currentFile,
      drives: mergeResult.mergedDrives,
      last_synced_at: new Date().toISOString(),
    };

    if (driveAvailable) {
      try {
        await updatePlacementsJson(accessToken, updatedFile);
      } catch (driveUpdateErr: any) {
        console.warn('Could not update placements in Google Drive:', driveUpdateErr?.message);
        driveWarning = 'Changes saved locally. Google Drive could not be updated.';
      }
    }

    return NextResponse.json({
      success: true,
      addedCount: mergeResult.addedCount,
      updatedCount: mergeResult.updatedCount,
      totalDrives: mergeResult.mergedDrives.length,
      drives: updatedFile.drives,
      syncedAt: updatedFile.last_synced_at,
      driveAvailable,
      warning: driveWarning,
      source: 'gmail_api',
    });
  } catch (err: any) {
    console.error('Gmail sync endpoint unexpected error:', err);
    return NextResponse.json(
      {
        error: 'GmailSyncError',
        message: err?.message || 'Failed to synchronize emails from Gmail.',
      },
      { status: 500 }
    );
  }
}
