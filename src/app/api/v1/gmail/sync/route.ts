import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-guard';
import { syncRecentPlacementEmails } from '@/lib/gmail/gmail-service';
import { PARSER_VERSION } from '@/lib/parser/email-parser';
import { isTrustedPlacementSender } from '@/lib/security/sender-trust';
import { fetchPlacementsJson, updatePlacementsJson } from '@/lib/drive/drive-service';
import { mergePlacementDrives } from '@/lib/parser/merger';
import { getSamplePlacementDrives } from '@/lib/parser/fixtures';
import {
  PlacementDrive,
  createEmptyPlacementFile,
  sanitizePlacementDrive,
} from '@/schemas/placement.schema';

export const dynamic = 'force-dynamic';
// Gmail detail fetch + Drive read/write can exceed the default 10s Hobby
// limit when processing a full 25-mail batch. Allow up to 60s per sync
// invocation; the client chains invocations until hasMore=false.
export const maxDuration = 60;

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

    // Base drives to merge into: combine Drive storage and client drives for full awareness
    const combinedBase = mergePlacementDrives(currentFile.drives, clientDrives).mergedDrives;

    // Purge anything not sent by a placement desk (user forwards, department
    // circulars, admin notices). This also drops drives ingested while the
    // sender gate was temporarily domain-wide.
    const userEmail = session.user.email?.toLowerCase();
    const isDirectPlacementEmail = (d: PlacementDrive) => {
      const s = d.source?.sender || '';
      // If sent by user themselves, exclude
      if (userEmail && s.toLowerCase().includes(userEmail)) return false;
      return isTrustedPlacementSender(s);
    };

    const baseDrives = combinedBase.filter(isDirectPlacementEmail);

    // Collect known message IDs so we avoid re-fetching full payloads of emails already parsed.
    // Drives parsed by an older parser version are deliberately NOT marked known,
    // so their messages get re-fetched and re-parsed with the current logic
    // (the merger then refreshes the stored drive while keeping user state).
    const knownMessageIds = new Set<string>();
    for (const d of baseDrives) {
      if ((d.parser_version ?? 0) < PARSER_VERSION) continue;
      if (d.source?.gmail_message_id) {
        knownMessageIds.add(d.source.gmail_message_id);
      }
      if (d.id) {
        knownMessageIds.add(d.id);
      }
    }

    // 2. Query Gmail for placement emails
    let syncResult = { drives: [] as PlacementDrive[], hasMore: false, remainingCount: 0 };
    try {
      syncResult = await syncRecentPlacementEmails(accessToken, 250, knownMessageIds);
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
    const mergeResult = mergePlacementDrives(baseDrives, syncResult.drives);

    // 4. Repair pass: re-validate every drive against the schema so legacy or
    // hand-edited entries can never carry empty company/role names or
    // otherwise inconsistent shapes into Drive or the dashboard.
    const repairedDrives = mergeResult.mergedDrives.map((d) => sanitizePlacementDrive(d));

    // 5. Update the user's Google Drive placements.json file if Drive is accessible
    const updatedFile = {
      ...currentFile,
      drives: repairedDrives,
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
      hasMore: syncResult.hasMore,
      remainingCount: syncResult.remainingCount,
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
