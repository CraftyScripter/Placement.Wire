import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-guard';
import { isAdminEmail } from '@/lib/admin/is-admin';
import { buildOverview, readAnalytics } from '@/lib/analytics/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  if (!isAdminEmail(auth.context.session.user.email)) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Admin access only.' },
      { status: 403 }
    );
  }

  const data = await readAnalytics();
  return NextResponse.json({
    success: true,
    ...(await buildOverview(data)),
  });
}
