import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-guard';
import { fetchPlacementsJson, updatePlacementsJson } from '@/lib/drive/drive-service';
import { PlacementFileSchema, createEmptyPlacementFile } from '@/schemas/placement.schema';
import { getSamplePlacementDrives } from '@/lib/parser/fixtures';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { session, accessToken } = auth.context;

  // For dev mock users, provide the sample fixture drives
  if (session.user.isMockUser) {
    const mockData = createEmptyPlacementFile();
    mockData.drives = getSamplePlacementDrives();
    return NextResponse.json({
      data: mockData,
      source: 'mock_storage',
      syncedAt: new Date().toISOString(),
    });
  }

  try {
    const { data, fileInfo } = await fetchPlacementsJson(accessToken);
    return NextResponse.json({
      data,
      fileInfo,
      source: 'google_drive',
      syncedAt: data.last_synced_at,
    });
  } catch (err: any) {
    console.warn('Notice fetching placements from Google Drive:', err?.message || err);
    const empty = createEmptyPlacementFile();

    const isApiDisabled =
      err?.message?.includes('Google Drive API has not been used') ||
      err?.message?.includes('disabled');

    return NextResponse.json({
      data: empty,
      source: 'local_fallback',
      syncedAt: null,
      warning: isApiDisabled
        ? 'Google Drive API is not yet enabled in your Google Cloud Console. Local storage will be used until enabled.'
        : 'Could not connect to Google Drive. Local cache in use.',
    });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { session, accessToken } = auth.context;

  try {
    const body = await req.json();
    const validated = PlacementFileSchema.parse(body);

    if (session.user.isMockUser) {
      return NextResponse.json({
        data: {
          ...validated,
          last_synced_at: new Date().toISOString(),
          revision: (validated.revision || 1) + 1,
        },
        source: 'mock_storage',
        success: true,
      });
    }

    try {
      const result = await updatePlacementsJson(accessToken, validated);
      return NextResponse.json({
        data: result.data,
        fileInfo: result.fileInfo,
        source: 'google_drive',
        success: true,
      });
    } catch (driveErr: any) {
      console.warn('Google Drive update fallback:', driveErr?.message || driveErr);
      return NextResponse.json({
        data: {
          ...validated,
          last_synced_at: new Date().toISOString(),
          revision: (validated.revision || 1) + 1,
        },
        source: 'local_storage',
        success: true,
        warning: 'Google Drive update unavailable. Data persisted in local browser storage.',
      });
    }
  } catch (err: any) {
    console.error('Error validating or updating placements:', err);
    return NextResponse.json(
      { error: 'InvalidPlacementData', message: 'Failed to save changes.' },
      { status: 400 }
    );
  }
}
