import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Kept as a literal (instead of importing @/lib/auth/session) to keep the
// middleware bundle light. Must match SESSION_COOKIE_NAME in session.ts.
const SESSION_COOKIE_NAME = 'pw_session';

/**
 * Blocks unauthenticated visits to private pages (/dashboard, /onboarding,
 * /settings). Without this, the dashboard rendered from the localStorage
 * cache even with no session, while API calls failed with 401
 * ("Authentication required...") — confusing split state.
 *
 * This checks cookie presence only (fast, no decryption); real verification
 * still happens in API routes via requireAuth() and in the page-level
 * useAuth() guard (covers expired/tampered cookies).
 */
export function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/settings/:path*'],
};
