import { NextResponse } from 'next/server';
import { getSession, destroySession } from '@/lib/auth/session';
import { getOAuth2Client } from '@/lib/google/oauth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getSession();

  if (session && session.tokens.access_token && !session.user.isMockUser) {
    try {
      const client = getOAuth2Client();
      await client.revokeToken(session.tokens.access_token);
    } catch (err) {
      console.warn('Token revocation attempt failed or already revoked:', err);
    }
  }

  await destroySession();

  return NextResponse.json({
    success: true,
    message: 'Google account disconnected and session destroyed',
  });
}
