import { NextRequest } from 'next/server';
import { handleTrackPing } from '@/lib/analytics/track-handler';

export const dynamic = 'force-dynamic';

/** Canonical visitor beacon (path avoids adblocker "analytics" filters). */
export async function POST(req: NextRequest) {
  return handleTrackPing(req);
}
