import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { session } = auth.context;

  return NextResponse.json({
    connected: true,
    email: session.user.email,
    isMock: Boolean(session.user.isMockUser),
    scopesConfigured: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });
}
