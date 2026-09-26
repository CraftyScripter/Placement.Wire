import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-guard';
import { updatePlacementsJson } from '@/lib/drive/drive-service';
import { PlacementFileSchema } from '@/schemas/placement.schema';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { session, accessToken } = auth.context;

  try {
    const body = await req.json();
    const validated = PlacementFileSchema.parse(body);

    if (session.user.isMockUser) {
      return NextResponse.json({
        success: true,
        syncedAt: new Date().toISOString(),
        revision: (validated.revision || 1) + 1,
      });
    }

    const result = await updatePlacementsJson(accessToken, validated);

    return NextResponse.json({
      success: true,
      syncedAt: result.data.last_synced_at,
      revision: result.data.revision,
      fileInfo: result.fileInfo,
    });
  } catch (err: any) {
    console.error('Drive sync failed:', err);
    return NextResponse.json(
      { error: 'SyncFailed', message: 'Failed to synchronize with Google Drive.' },
      { status: 500 }
    );
  }
}
