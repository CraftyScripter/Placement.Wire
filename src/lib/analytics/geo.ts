/**
 * Best-effort IP geolocation. Never throws — returns partial info.
 * Prefers platform headers (Vercel), falls back to ipapi.co lookup.
 */
export interface GeoInfo {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
}

export async function resolveGeo(ip: string | null, headers: Headers): Promise<GeoInfo> {
  const city = headers.get('x-vercel-ip-city');
  const region = headers.get('x-vercel-ip-country-region');
  const country = headers.get('x-vercel-ip-country');
  if (city || country) {
    return {
      ip: ip || undefined,
      city: city ? safeDecode(city) : undefined,
      region: region || undefined,
      country: country || undefined,
    };
  }

  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) {
    return { ip: ip || 'localhost', city: 'Local', country: 'Local' };
  }

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return { ip };
    const j = (await res.json()) as Record<string, unknown>;
    if (j.error) return { ip };
    return {
      ip,
      city: typeof j.city === 'string' ? j.city : undefined,
      region: typeof j.region === 'string' ? j.region : undefined,
      country: typeof j.country_name === 'string' ? j.country_name : undefined,
    };
  } catch {
    return ip ? { ip } : {};
  }
}

function safeDecode(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

/** Extract client IP from standard proxy headers. */
export function getClientIp(headers: Headers): string | null {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return (
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() ||
    null
  );
}
