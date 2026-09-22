import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth/session';
import { env } from '@/config/env';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Only permit mock login when DEV_MOCK_AUTH is enabled in environment
  if (!env.DEV_MOCK_AUTH && env.NODE_ENV === 'production') {
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
      picture: 'https://placehold.co/128x128/4f46e5/ffffff?text=AS',
      isMockUser: true,
    },
    tokens: {
      access_token: 'mock_access_token_dev',
      refresh_token: 'mock_refresh_token_dev',
      expiry_date: Date.now() + 3600 * 1000 * 24,
    },
  });

  return NextResponse.json({
    success: true,
    user: {
      email,
      name,
    },
  });
}
