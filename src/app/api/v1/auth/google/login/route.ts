import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateAuthUrl } from '@/lib/google/oauth';
import { setOAuthStateCookie } from '@/lib/auth/session';
import { env } from '@/config/env';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Generate secure random state
    const state = crypto.randomBytes(32).toString('hex');
    await setOAuthStateCookie(state);

    // Determine redirect URI: use env redirect URI, or adapt host
    const authUrl = generateAuthUrl(state, env.GOOGLE_REDIRECT_URI);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error generating Google OAuth URL:', error);
    return NextResponse.json(
      { error: 'InternalServerError', message: 'Failed to initiate Google authentication.' },
      { status: 500 }
    );
  }
}
