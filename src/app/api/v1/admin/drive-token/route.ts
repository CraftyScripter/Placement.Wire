import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-guard';
import { isAdminEmail } from '@/lib/admin/is-admin';
import { getStorageStatus } from '@/lib/analytics/store';
import { env } from '@/config/env';

export const dynamic = 'force-dynamic';

/**
 * One-time setup helper for Drive-backed logging on read-only hosts.
 * Returns the CURRENT session's Google refresh token so the admin can paste
 * it into ADMIN_DRIVE_REFRESH_TOKEN (Vercel env). Admin-only: the token
 * belongs to the admin's own Google account.
 */
export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { session } = auth.context;
  if (!isAdminEmail(session.user.email)) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Admin access only.' },
      { status: 403 }
    );
  }

  const storage = await getStorageStatus();
  return NextResponse.json({
    success: true,
    storage,
    tokenConfigured: Boolean(env.ADMIN_DRIVE_REFRESH_TOKEN),
    hasRefreshToken: Boolean(session.tokens.refresh_token),
    // Only present when Google issued one for this login (offline consent).
    refreshToken: session.tokens.refresh_token || null,
    hint: session.tokens.refresh_token
      ? 'Copy refreshToken into ADMIN_DRIVE_REFRESH_TOKEN and redeploy.'
      : 'No refresh token in this session (mock login or already-consented session). Log out and sign in with Google again (full consent screen) to get one.',
  });
}
