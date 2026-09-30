import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-guard';
import { isAdminEmail } from '@/lib/admin/is-admin';
import { getStorageStatus, readAnalytics } from '@/lib/analytics/store';
import { backupAnalyticsToAdminDrive } from '@/lib/analytics/drive-backup';
import { overwriteDriveAnalytics } from '@/lib/analytics/drive-store';
import { env } from '@/config/env';

export const dynamic = 'force-dynamic';

/**
 * Copies the LOCAL analytics log into the admin's own Google Drive as a
 * separate snapshot (admin_analytics.dev.json). It NEVER touches the
 * production live log (admin_analytics.json) — dev and prod stay split.
 * - Disk mode: uploads the local log using the admin's current OAuth token.
 * - Drive mode (serverless): the Drive file already IS the live log —
 *   uses the stored refresh token, so it works headlessly.
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
    const storage = await getStorageStatus();
    const data = await readAnalytics();
    if (storage.mode === 'drive' && env.ADMIN_DRIVE_REFRESH_TOKEN) {
      await overwriteDriveAnalytics(env.ADMIN_DRIVE_REFRESH_TOKEN, data);
      return NextResponse.json({ success: true, fileName: 'admin_analytics.json', backend: 'drive' });
    }
    const result = await backupAnalyticsToAdminDrive(accessToken, {
      ...data,
      backedUpAt: new Date().toISOString(),
      backedUpBy: session.user.email,
    });
    return NextResponse.json({ success: true, ...result, backend: 'disk' });
  } catch (err) {
    console.error('Admin Drive backup failed:', err);
    return NextResponse.json(
      { error: 'BackupFailed', message: 'Could not write to your Google Drive. Re-login if consent expired.' },
      { status: 500 }
    );
  }
}
