import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, getGoogleUserProfile } from '@/lib/google/oauth';
import { validateCollegeEmail } from '@/lib/security/domain-validator';
import { createSession, verifyAndClearOAuthStateCookie } from '@/lib/auth/session';
import { isAdminEmail } from '@/lib/admin/is-admin';
import { recordVisit } from '@/lib/analytics/store';
import { getClientIp, resolveGeo } from '@/lib/analytics/geo';
import { env } from '@/config/env';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const oauthError = searchParams.get('error');

  const baseUrl = env.APP_URL;

  if (oauthError) {
    console.warn('Google OAuth returned error:', oauthError);
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(oauthError)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/login?error=missing_code_or_state`);
  }

  // Validate CSRF state
  const isStateValid = await verifyAndClearOAuthStateCookie(state);
  if (!isStateValid) {
    console.warn('Invalid OAuth CSRF state received');
    return NextResponse.redirect(`${baseUrl}/login?error=invalid_csrf_state`);
  }

  try {
    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.access_token) {
      throw new Error('No access token returned by Google');
    }

    // Fetch verified profile from Google Identity
    const profile = await getGoogleUserProfile(tokens.access_token);
    if (!profile || !profile.email) {
      throw new Error('Could not retrieve Google profile or email');
    }

    if (!profile.verified_email) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=unverified_email&email=${encodeURIComponent(profile.email)}`
      );
    }

    // Strict domain validation (domain comes from ALLOWED_EMAIL_DOMAIN — no fallback)
    const validation = validateCollegeEmail(profile.email);
    if (!validation.isValid) {
      console.warn(`Rejected unauthorized login attempt: ${profile.email}`);
      return NextResponse.redirect(
        `${baseUrl}/login?error=domain_unauthorized&email=${encodeURIComponent(profile.email)}`
      );
    }

    // Create secure HTTP-only encrypted session
    await createSession({
      user: {
        userId: profile.id || `user_${Date.now()}`,
        email: validation.normalizedEmail,
        name: profile.name || 'SAITM Student',
        picture: profile.picture || undefined,
      },
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || undefined,
        expiry_date: tokens.expiry_date || undefined,
        token_type: tokens.token_type || undefined,
        scope: tokens.scope || undefined,
      },
    });

    // Admin monitoring log: every successful Google signup/login is recorded
    // (grouped by email — one row per visitor, never a raw row per event).
    // Stored locally + mirrored to the admin's own Drive. Never throws.
    try {
      const ip = getClientIp(req.headers);
      const geo = await resolveGeo(ip, req.headers);
      const { readAnalytics, visitorKey } = await import('@/lib/analytics/store');
      const existing = await readAnalytics();
      const seenBefore = Boolean(
        existing.visitors[visitorKey(validation.normalizedEmail, null, null)]
      );
      await recordVisit({
        event: seenBefore ? 'login' : 'signup',
        email: validation.normalizedEmail,
        name: profile.name || null,
        path: '/auth/google/callback',
        ip: geo.ip || ip,
        city: geo.city,
        region: geo.region,
        country: geo.country,
        userAgent: req.headers.get('user-agent')?.slice(0, 300) || null,
        isAdmin: isAdminEmail(validation.normalizedEmail),
      });
    } catch {
      /* analytics must never block login */
    }

    return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch (err: any) {
    console.error('OAuth Callback processing error:', err);
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_exchange_failed`);
  }
}
