import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { isAdminEmail } from '@/lib/admin/is-admin';
import { recordHeartbeat, recordVisit } from '@/lib/analytics/store';
import { getClientIp, resolveGeo } from '@/lib/analytics/geo';

export const dynamic = 'force-dynamic';

/** Keep only the pathname: query strings may carry tokens and would
 *  explode key cardinality (one key per unique URL). Max 120 chars. */
function cleanPath(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw) return null;
  const noQuery = raw.split('?')[0].split('#')[0];
  const p = (noQuery.startsWith('/') ? noQuery : `/${noQuery}`).slice(0, 120);
  return p || null;
}

function cleanStr(raw: unknown, max = 200): string | null {
  if (typeof raw !== 'string' || !raw) return null;
  return raw.slice(0, max);
}

/**
 * Pageview beacon + presence heartbeat. Works for logged-in students
 * (grouped by email) and anonymous visitors (grouped by IP+UA hash).
 * Location comes from server-side headers only — no browser permission.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const path = cleanPath(body.path);

  const email = session?.user.email || null;
  const ip = getClientIp(req.headers);
  const ua = req.headers.get('user-agent')?.slice(0, 300) || null;

  // Lightweight presence ping: no counters, throttled disk writes.
  if (body.heartbeat === true) {
    const secs =
      typeof body.sessionSecs === 'number' && body.sessionSecs > 0
        ? Math.min(Math.floor(body.sessionSecs), 12 * 3600)
        : undefined;
    await recordHeartbeat({ email, path, ip, userAgent: ua, sessionSecs: secs });
    return NextResponse.json({ ok: true });
  }

  const geo = await resolveGeo(ip, req.headers);

  await recordVisit({
    event: 'pageview',
    email,
    name: session?.user.name || null,
    path,
    ip: geo.ip || ip,
    city: geo.city,
    region: geo.region,
    country: geo.country,
    userAgent: ua,
    referrer: cleanStr(body.referrer, 300),
    isAdmin: isAdminEmail(email),
  });

  return NextResponse.json({ ok: true });
}
