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
    expect(overview.storage.mode).toBe('disk');
    expect(overview.storage.writable).toBe(true);
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

  it('merges the pre-login anonymous row into the email row on login (same IP+UA)', async () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0';
    await recordVisit({ event: 'pageview', path: '/', ip: '1.2.3.4', userAgent: ua });
    await recordVisit({ event: 'pageview', path: '/about', ip: '1.2.3.4', userAgent: ua });
    // Same browser logs in → ONE profile, not two
    await recordVisit({ event: 'login', email: 'c@saitm.ac.in', name: 'C', path: '/dashboard', ip: '1.2.3.4', userAgent: ua });

    const data = await readAnalytics();
    const keys = Object.keys(data.visitors);
    expect(keys).toHaveLength(1);
    expect(keys[0]).toBe('email:c@saitm.ac.in');

    const v = data.visitors[keys[0]];
    expect(v.totalVisits).toBe(3);
    expect(v.loginCount).toBe(1);
    expect(v.pages['/'].count).toBe(1);
    expect(v.pages['/about'].count).toBe(1);
    expect(v.pages['/dashboard'].count).toBe(1);
    // Cumulative counters are NOT double-counted by the merge
    expect(data.totals.visitors).toBe(1);
    expect(data.totals.visits).toBe(3);
    expect(data.totals.logins).toBe(1);
    // '/' was seen by both pre-merge rows → unique-visitor count fixed to 1
    expect(data.pagesGlobal['/'].views).toBe(1);
    expect(data.pagesGlobal['/'].visitors).toBe(1);
    // History + identity survived the merge
    expect(v.ipsSeen).toContain('1.2.3.4');
    expect(v.devicesSeen).toContain('Chrome · Windows');
    expect(v.firstSeen).toBeTruthy();
  });

  it('does NOT merge anonymous rows from a different browser', async () => {
    const ua1 = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0';
    const ua2 = 'Mozilla/5.0 (X11; Linux x86_64; rv:156.0) Gecko/20100101 Firefox/156.0';
    await recordVisit({ event: 'pageview', path: '/', ip: '1.2.3.4', userAgent: ua1 });
    await recordVisit({ event: 'login', email: 'd@saitm.ac.in', name: 'D', path: '/dashboard', ip: '1.2.3.4', userAgent: ua2 });

    const data = await readAnalytics();
    expect(Object.keys(data.visitors)).toHaveLength(2);
    expect(data.totals.visitors).toBe(2);
  });

  it('tracks IP and device history per visitor', async () => {
    const uaWin = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0';
    const uaAndroid = 'Mozilla/5.0 (Linux; Android 14) Chrome/120.0 Mobile Safari/537.36';
    await recordVisit({ event: 'pageview', email: 'e@saitm.ac.in', path: '/', ip: '1.1.1.1', userAgent: uaWin });
    await recordVisit({ event: 'pageview', email: 'e@saitm.ac.in', path: '/about', ip: '2.2.2.2', userAgent: uaAndroid });

    const data = await readAnalytics();
    const v = data.visitors['email:e@saitm.ac.in'];
    expect(v.ipsSeen).toEqual(['1.1.1.1', '2.2.2.2']);
    expect(v.lastIp).toBe('2.2.2.2');
    expect(v.devicesSeen).toContain('Chrome · Windows');
    expect(v.devicesSeen).toContain('Chrome · Android · Mobile');
    expect(v.device).toBe('Chrome · Android · Mobile');
  });

  it('NEVER deletes recorded data: old daily counters and stale anon rows stay', async () => {
    const ua = 'Mozilla/5.0 (X11; Linux x86_64; rv:156.0) Gecko/20100101 Firefox/156.0';
    await recordVisit({ event: 'pageview', path: '/', ip: '9.9.9.9', userAgent: ua });

    // Backdate everything: 1 hit, 400 days old — previously pruned, now kept
    const file = JSON.parse(await fs.readFile(analyticsFilePath(), 'utf-8'));
    const oldIso = new Date(Date.now() - 400 * 24 * 3600 * 1000).toISOString();
    const oldDay = oldIso.slice(0, 10);
    for (const v of Object.values(file.visitors) as any[]) {
      v.firstSeen = oldIso;
      v.lastActive = oldIso;
    }
    file.daily = { [oldDay]: { visits: 1, logins: 0, signups: 0, visitors: 1 } };
    await fs.writeFile(analyticsFilePath(), JSON.stringify(file), 'utf-8');

    // A fresh hit must not wipe the 400-day-old history
    await recordVisit({ event: 'pageview', path: '/about', ip: '9.9.9.9', userAgent: ua });
    const data = await readAnalytics();
    expect(data.daily[oldDay]).toBeDefined();
    expect(data.daily[oldDay].visits).toBe(1);
    expect(Object.keys(data.visitors)).toHaveLength(1);
    expect(data.visitors[Object.keys(data.visitors)[0]].totalVisits).toBe(2);
  });

  it('stores everything with NO caps: many pages, IPs and devices all kept', async () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0';
    for (let i = 0; i < 30; i++) {
      await recordVisit({ event: 'pageview', email: 'f@saitm.ac.in', path: `/p${i}`, ip: `10.0.0.${i}`, userAgent: ua });
    }
    const data = await readAnalytics();
    const v = data.visitors['email:f@saitm.ac.in'];
    expect(Object.keys(v.pages)).toHaveLength(30);
    expect(v.ipsSeen).toHaveLength(30);
    expect(v.totalVisits).toBe(30);
  });

  it('loses nothing under concurrent writes (disk lock serializes them)', async () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0';
    await Promise.all(
      Array.from({ length: 30 }, (_, i) =>
        recordVisit({ event: 'pageview', email: 'g@saitm.ac.in', path: `/c${i}`, ip: '7.7.7.7', userAgent: ua })
      )
    );
    const data = await readAnalytics();
    const v = data.visitors['email:g@saitm.ac.in'];
    expect(v.totalVisits).toBe(30);
    expect(Object.keys(v.pages)).toHaveLength(30);
    expect(data.totals.visits).toBe(30);
  });

  it('counts rejected sign-ins by reason without creating visitor rows', async () => {
    const { recordFailedLogin } = await import('@/lib/analytics/store');
    await recordFailedLogin({ reason: 'domain_unauthorized', email: 'intruder@gmail.com' });
    await recordFailedLogin({ reason: 'domain_unauthorized', email: 'other@gmail.com' });
    await recordFailedLogin({ reason: 'oauth_exchange_failed' });

    const data = await readAnalytics();
    expect(Object.keys(data.visitors)).toHaveLength(0);
    expect(data.failedLogins?.total).toBe(3);
    expect(data.failedLogins?.byReason['domain_unauthorized']).toBe(2);
    expect(data.failedLogins?.lastEmail).toBe('other@gmail.com');

    const overview = await buildOverview(data);
    expect(overview.failedLogins.total).toBe(3);
    expect(overview.failedLogins.byReason[0]).toEqual({ reason: 'domain_unauthorized', count: 2 });
  });

  it('survives files written before failed-login tracking existed', async () => {
    await fs.writeFile(
      analyticsFilePath(),
      JSON.stringify({
        version: 2,
        updatedAt: new Date().toISOString(),
        visitors: {},
        daily: {},
        hourly: Array.from({ length: 24 }, () => 0),
        pagesGlobal: {},
        devices: {},
        locations: {},
        referrers: {},
        totals: { visitors: 0, visits: 0, logins: 0, signups: 0, sessions: 0, sessionSecs: 0 },
      }),
      'utf-8'
    );
    const overview = await buildOverview(await readAnalytics());
    expect(overview.failedLogins.total).toBe(0);
    expect(overview.failedLogins.byReason).toEqual([]);
  });
});
