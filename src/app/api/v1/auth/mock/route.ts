import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth/session';
import { isAdminEmail } from '@/lib/admin/is-admin';
import { recordVisit, readAnalytics, visitorKey } from '@/lib/analytics/store';
import { getClientIp, resolveGeo } from '@/lib/analytics/geo';
import { env } from '@/config/env';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Mock login is strictly gated by DEV_MOCK_AUTH in every environment.
  // (env.ts additionally force-disables the flag in production.)
  if (!env.DEV_MOCK_AUTH) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Mock authentication is disabled.' },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const email = body.email || 'student.demo@saitm.ac.in';
  const name = body.name || 'Aditya Sharma (SAITM 2026)';

  await createSession({
    user: {
      userId: 'mock_student_saitm_123',
      email,
      name,
      picture: '/icon_light.png',
      isMockUser: true,
    },
    tokens: {
      access_token: 'mock_access_token_dev',
      refresh_token: 'mock_refresh_token_dev',
      expiry_date: Date.now() + 3600 * 1000 * 24,
    },
  });

  try {
    const ip = getClientIp(req.headers);
    const geo = await resolveGeo(ip, req.headers);
    const existing = await readAnalytics();
    const seenBefore = Boolean(existing.visitors[visitorKey(String(email), null, null)]);
    await recordVisit({
      event: seenBefore ? 'login' : 'signup',
      email: String(email),
      name: String(name),
      path: '/api/v1/auth/mock',
      ip: geo.ip || ip,
      city: geo.city,
      region: geo.region,
      country: geo.country,
      userAgent: req.headers.get('user-agent')?.slice(0, 300) || null,
      isAdmin: isAdminEmail(String(email)),
    });
  } catch {
    /* never block mock login */
  }

  return NextResponse.json({
    success: true,
    user: {
      email,
      name,
    },
  });
}
