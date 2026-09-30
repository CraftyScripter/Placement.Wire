import { NextRequest } from 'next/server';
import { handleTrackPing } from '@/lib/analytics/track-handler';

export const dynamic = 'force-dynamic';

/** Legacy alias — kept so older cached clients keep reporting. */
export async function POST(req: NextRequest) {
  return handleTrackPing(req);
}
