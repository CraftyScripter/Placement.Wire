import { NextResponse } from 'next/server';
import { getSession, createSession, FullSessionPayload } from './session';
import { refreshAccessToken } from '@/lib/google/oauth';
import { env } from '@/config/env';

export interface AuthenticatedContext {
  session: FullSessionPayload;
  accessToken: string;
}

export async function requireAuth(): Promise<
  { error: NextResponse; context: null } | { error: null; context: AuthenticatedContext }
> {
  const session = await getSession();

  if (!session) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized', message: `Authentication required. Please sign in with your @${env.ALLOWED_EMAIL_DOMAIN} account.` },
        { status: 401 }
      ),
      context: null,
    };
  }

  // Check if mock user
  if (session.user.isMockUser) {
    return {
      error: null,
      context: {
        session,
        accessToken: session.tokens.access_token || 'mock_access_token',
      },
    };
  }

  // Check token expiration (if expiry_date is set and within 60s of expiring)
  let currentAccessToken = session.tokens.access_token;
  if (
    session.tokens.expiry_date &&
    Date.now() >= session.tokens.expiry_date - 60000 &&
    session.tokens.refresh_token
  ) {
    try {
      const refreshed = await refreshAccessToken(session.tokens.refresh_token);
      if (refreshed.access_token) {
        currentAccessToken = refreshed.access_token;
        session.tokens.access_token = refreshed.access_token;
        if (refreshed.expiry_date) {
          session.tokens.expiry_date = refreshed.expiry_date;
        }
        await createSession(session);
      }
    } catch (refreshErr) {
      console.error('Failed to refresh Google access token:', refreshErr);
      return {
        error: NextResponse.json(
          { error: 'SessionExpired', message: 'Your Google authorization expired or was revoked. Please reconnect.' },
          { status: 401 }
        ),
        context: null,
      };
    }
  }

  return {
    error: null,
    context: {
      session,
      accessToken: currentAccessToken,
    },
  };
}
