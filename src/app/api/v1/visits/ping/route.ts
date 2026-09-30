import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { handleTrackPing } from '@/lib/analytics/track-handler';
import { rateLimit, clientKey } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

/** Canonical visitor beacon (path avoids adblocker "analytics" filters). */
export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, 'visits-ping'), 60, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: 'Rate limited' }, { status: 429 });
  }
  return handleTrackPing(req);
}
