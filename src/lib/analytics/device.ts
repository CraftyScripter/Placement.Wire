/**
 * Tiny user-agent parser. We deliberately store only a short
 * "Browser · OS" label per visitor — never the full UA string —
 * because the UA is the single biggest space waster in analytics logs.
 */
export function parseDevice(userAgent: string | null | undefined): string {
  if (!userAgent) return 'Unknown';
  const ua = userAgent.toLowerCase();

  let browser = 'Other';
  if (ua.includes('edg/') || ua.includes('edge/')) browser = 'Edge';
  else if (ua.includes('opr/') || ua.includes('opera')) browser = 'Opera';
  else if (ua.includes('chrome/') && !ua.includes('chromium')) browser = 'Chrome';
  else if (ua.includes('chromium')) browser = 'Chromium';
  else if (ua.includes('firefox/') || ua.includes('fxios/')) browser = 'Firefox';
  else if (ua.includes('safari/') && ua.includes('version/')) browser = 'Safari';
  else if (ua.includes('msie') || ua.includes('trident/')) browser = 'IE';

  let os = 'Other';
  if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) os = 'iOS';
  else if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os') || ua.includes('macintosh')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('cros')) os = 'ChromeOS';

  const mobile = /mobi|android|iphone|ipad/.test(ua);
  return `${browser} · ${os}${mobile ? ' · Mobile' : ''}`;
}
