import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-guard';
import { isAdminEmail } from '@/lib/admin/is-admin';
import { readAnalytics } from '@/lib/analytics/store';
import { backupAnalyticsToAdminDrive } from '@/lib/analytics/drive-backup';

export const dynamic = 'force-dynamic';

/**
 * Copies the analytics log into the admin's own Google Drive
 * (PlacementWire_Data/admin_analytics.json). Uses the admin's
 * current OAuth access token — nothing leaves your Drive.
 */
export async function POST() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { session, accessToken } = auth.context;
  if (!isAdminEmail(session.user.email)) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Admin access only.' },
      { status: 403 }
    );
  }
  if (session.user.isMockUser) {
    return NextResponse.json(
      { error: 'MockMode', message: 'Drive backup needs a real Google login (admin account), not mock auth.' },
      { status: 400 }
    );
  }

  try {
    const data = await readAnalytics();
    const result = await backupAnalyticsToAdminDrive(accessToken, {
      ...data,
      backedUpAt: new Date().toISOString(),
      backedUpBy: session.user.email,
    });
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error('Admin Drive backup failed:', err);
    return NextResponse.json(
      { error: 'BackupFailed', message: 'Could not write to your Google Drive. Re-login if consent expired.' },
      { status: 500 }
    );
  }
}
