import { promises as fs } from 'fs';
import { describe, it, expect, beforeEach } from 'vitest';
import { isAdminEmail } from '@/lib/admin/is-admin';
import {
  analyticsFilePath,
  buildOverview,
  fingerprint,
  recordHeartbeat,
  recordVisit,
  readAnalytics,
} from '@/lib/analytics/store';
import { parseDevice } from '@/lib/analytics/device';

describe('admin identity', () => {
  it('recognises the admin email case-insensitively', () => {
    const configured = (process.env.ADMIN_EMAILS || '').split(',')[0].trim();
    expect(configured.length).toBeGreaterThan(0);
    expect(isAdminEmail(configured)).toBe(true);
    expect(isAdminEmail(configured.toUpperCase())).toBe(true);
    expect(isAdminEmail(`someone-else@${configured.split('@')[1] || 'example.com'}`)).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
  });
});

describe('grouped analytics store (v2)', () => {
  beforeEach(async () => {
    await fs.rm(analyticsFilePath(), { force: true });
  });

  it('groups repeat visits from the same anonymous visitor into ONE row', async () => {
    const ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:156.0) Gecko/20100101 Firefox/156.0';
    await recordVisit({ event: 'pageview', path: '/', ip: '9.9.9.9', userAgent: ua });
    await recordVisit({ event: 'pageview', path: '/about', ip: '9.9.9.9', userAgent: ua });
    await recordVisit({ event: 'pageview', path: '/', ip: '9.9.9.9', userAgent: ua });

    const data = await readAnalytics();
    const keys = Object.keys(data.visitors);
    expect(keys).toHaveLength(1);
    expect(keys[0].startsWith('anon:')).toBe(true);

    const v = data.visitors[keys[0]];
    expect(v.totalVisits).toBe(3);
    expect(v.pages['/'].count).toBe(2);
    expect(v.pages['/about'].count).toBe(1);
    expect(v.device).toBe('Firefox · Linux');
    expect(data.totals.visits).toBe(3);
    expect(data.pagesGlobal['/'].views).toBe(2);
    expect(data.pagesGlobal['/'].visitors).toBe(1);
  });

  it('counts first login as signup and later logins as logins only', async () => {
    await recordVisit({ event: 'login', email: 'a@saitm.ac.in', name: 'A', path: '/dashboard' });
    await recordVisit({ event: 'login', email: 'a@saitm.ac.in', name: 'A', path: '/dashboard' });

    const data = await readAnalytics();
    expect(Object.keys(data.visitors)).toHaveLength(1);
    expect(data.totals.signups).toBe(1);
    expect(data.totals.logins).toBe(2);
  });

  it('heartbeat updates presence without inflating visit counters', async () => {
    await recordVisit({ event: 'pageview', email: 'b@saitm.ac.in', path: '/' });
    await recordHeartbeat({ email: 'b@saitm.ac.in', path: '/about' });
    await recordHeartbeat({ email: 'b@saitm.ac.in', path: '/about', sessionSecs: 120 });

    const data = await readAnalytics();
    const v = data.visitors['email:b@saitm.ac.in'];
    expect(v.totalVisits).toBe(1);
    expect(v.lastPath).toBe('/about');
    expect(v.sessionSecs).toBe(120);

    const overview = await buildOverview(data);
    expect(overview.totals.onlineNow).toBe(1);
    expect(overview.totals.avgSessionSecs).toBeGreaterThan(0);
  });

  it('strips nothing here but fingerprint is stable for same IP+UA', () => {
    expect(fingerprint('1.2.3.4', 'UA')).toBe(fingerprint('1.2.3.4', 'UA'));
    expect(fingerprint('1.2.3.4', 'UA')).not.toBe(fingerprint('5.6.7.8', 'UA'));
  });

  it('parses device labels instead of storing full UA strings', () => {
    expect(parseDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0')).toBe('Chrome · Windows');
    expect(parseDevice(null)).toBe('Unknown');
  });

  it('migrates a legacy v1 file (users + raw visits) into grouped v2 rows', async () => {
    const ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:156.0) Gecko/20100101 Firefox/156.0';
    const v1 = {
      version: 1,
      updatedAt: new Date().toISOString(),
      users: {
        'a@saitm.ac.in': { email: 'a@saitm.ac.in', name: 'A' },
      },
      visits: [
        { id: '1', ts: '2026-09-22T10:00:00.000Z', event: 'pageview', email: null, name: null, path: '/', ip: '9.9.9.9', userAgent: ua, isAdmin: false },
        { id: '2', ts: '2026-09-22T10:01:00.000Z', event: 'pageview', email: null, name: null, path: '/about', ip: '9.9.9.9', userAgent: ua, isAdmin: false },
        { id: '3', ts: '2026-09-22T10:02:00.000Z', event: 'pageview', email: null, name: null, path: '/privacy', ip: '9.9.9.9', userAgent: ua, isAdmin: false },
        { id: '4', ts: '2026-09-22T11:00:00.000Z', event: 'login', email: 'a@saitm.ac.in', name: 'A', path: '/dashboard', ip: '9.9.9.9', userAgent: ua, isAdmin: false },
      ],
    };
    await fs.writeFile(analyticsFilePath(), JSON.stringify(v1), 'utf-8');

    const data = await readAnalytics();
    expect(data.version).toBe(2);
    // 3 anonymous pageviews from same IP+UA fold into ONE visitor row
    const anon = Object.values(data.visitors).filter((v) => v.key.startsWith('anon:'));
    expect(anon).toHaveLength(1);
    expect(anon[0].totalVisits).toBe(3);
    expect(Object.keys(anon[0].pages)).toHaveLength(3);
    // logged-in user is a separate grouped row
    expect(data.visitors['email:a@saitm.ac.in'].loginCount).toBe(1);
    expect(data.totals.visits).toBe(4);
  });
});
