import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { env } from '@/config/env';
import { parseDevice } from './device';

/**
 * Grouped analytics store (v2) — industry-style aggregation.
 *
 * There are NO raw per-visit rows. One visitor = one row, everything else is
 * a counter. File size grows only with NEW visitors/paths, never with
 * pageview volume.
 *
 * NO-DELETION, NO-CAP POLICY (admin requirement): this store NEVER deletes
 * recorded data and applies NO caps — no daily-counter expiry, no
 * stale-visitor pruning, no page-history trimming, no IP/device history
 * trimming. Backup/upload flows are read-only on the live file. What gets
 * monitored stays visible on the site forever.
 *
 * STORAGE BACKENDS (chosen automatically):
 *  - disk  — writable local disk (localhost / VPS). Primary.
 *  - drive — read-only hosts (Vercel/serverless). Persists into the admin's
 *            own Google Drive via ADMIN_DRIVE_REFRESH_TOKEN. Same cumulative
 *            file the Backup button writes, with read-modify-write retries.
 *  - none  — nothing writable and no Drive token: hits are counted nowhere.
 *            The admin console surfaces this state instead of silent zeros.
 */

export interface PageStat {
  count: number;
  lastSeen: string;
}

export interface Visitor {
  /** "email:<addr>" for logged-in users, "anon:<hash>" otherwise */
  key: string;
  email: string | null;
  name: string | null;
  firstSeen: string;
  /** Max(last pageview, last heartbeat) — powers "Live Now" */
  lastActive: string;
  lastPath: string | null;
  totalVisits: number;
  sessions: number;
  sessionSecs: number;
  loginCount: number;
  lastLogin: string | null;
  lastIp: string | null;
  /** All IPs observed for this identity, most-recent last. Uncapped. */
  ipsSeen: string[];
  city?: string;
  region?: string;
  country?: string;
  device: string;
  /** All "Browser · OS" labels observed, most-recent last. Uncapped. */
  devicesSeen: string[];
  referrer: string | null;
  isAdmin: boolean;
  pages: Record<string, PageStat>;
}

export interface DayStat {
  visits: number;
  logins: number;
  signups: number;
  /** Unique visitors active that day */
  visitors: number;
}

/** Failed sign-in attempts (wrong domain, OAuth errors). Counters only —
 *  nobody is identified here beyond an optional email the user typed. */
export interface FailedLoginStats {
  total: number;
  byReason: Record<string, number>;
  lastAt: string | null;
  lastEmail: string | null;
}

export interface AnalyticsFile {
  version: 2;
  updatedAt: string;
  visitors: Record<string, Visitor>;
  /** YYYY-MM-DD -> stats, rolling 30 days */
  daily: Record<string, DayStat>;
  /** 0-23 (server local hour) visit distribution */
  hourly: number[];
  pagesGlobal: Record<string, { views: number; visitors: number; lastVisited: string }>;
  devices: Record<string, number>;
  locations: Record<string, number>;
  referrers: Record<string, number>;
  totals: {
    visitors: number;
    visits: number;
    logins: number;
    signups: number;
    sessions: number;
    sessionSecs: number;
  };
  /** Absent in files written before this feature — always defaulted on read. */
  failedLogins?: FailedLoginStats;
}

export type StorageMode = 'disk' | 'drive' | 'none';

export interface StorageStatus {
  mode: StorageMode;
  writable: boolean;
  detail: string;
}

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const HEARTBEAT_WRITE_MS = 2 * 60 * 1000;

export function analyticsFilePath(): string {
  if (process.env.ANALYTICS_FILE_PATH) return process.env.ANALYTICS_FILE_PATH;
  // Environment-split files: localhost dev and production NEVER share a log.
  // (Sharing one file/Drive doc is what used to mix dev hits into prod data.)
  const tag = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  return path.join(process.cwd(), 'data', `analytics.${tag}.json`);
}

/**
 * One-time carry-over: the historic single `data/analytics.json` (written
 * before env-split files existed) becomes `analytics.dev.json` on first read.
 * Production never touches it — prod history lives in its own file/Drive doc.
 */
async function migrateLegacyDevFile(fp: string): Promise<void> {
  if (process.env.NODE_ENV === 'production') return;
  if (!fp.endsWith('analytics.dev.json')) return;
  try {
    await fs.access(fp);
    return; // already split — nothing to do
  } catch {
    /* dev file missing — try the legacy carry-over below */
  }
  const legacy = path.join(process.cwd(), 'data', 'analytics.json');
  try {
    await fs.copyFile(legacy, fp);
    console.log(`[analytics] carried legacy log over: ${legacy} -> ${fp}`);
  } catch {
    /* no legacy file — start fresh */
  }
}

export function emptyAnalyticsFile(): AnalyticsFile {
  return {
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
    failedLogins: { total: 0, byReason: {}, lastAt: null, lastEmail: null },
  };
}

function emptyFailedStats(): FailedLoginStats {
  return { total: 0, byReason: {}, lastAt: null, lastEmail: null };
}

/** Normalize files written before a feature existed. Never deletes. */
function ensureFailedStats(data: AnalyticsFile): FailedLoginStats {
  if (!data.failedLogins) data.failedLogins = emptyFailedStats();
  if (!data.failedLogins.byReason) data.failedLogins.byReason = {};
  return data.failedLogins;
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

function emptyDay(): DayStat {
  return { visits: 0, logins: 0, signups: 0, visitors: 0 };
}

function dayOf(data: AnalyticsFile, date: string): DayStat {
  if (!data.daily[date]) data.daily[date] = emptyDay();
  return data.daily[date];
}

/** Anonymous identity: short hash, never raw IP+UA concat. */
export function fingerprint(ip: string | null, userAgent: string | null): string {
  return createHash('sha256')
    .update(`${ip || '?'}|${userAgent || '?'}`)
    .digest('hex')
    .slice(0, 16);
}

export function visitorKey(email: string | null, ip: string | null, ua: string | null): string {
  if (email) return `email:${email.trim().toLowerCase()}`;
  return `anon:${fingerprint(ip, ua)}`;
}

/** Append unique value, most-recent-last. NO CAP — every observed value stays. */
function pushUnique(arr: string[], value: string | null | undefined): void {
  if (!value) return;
  const i = arr.indexOf(value);
  if (i !== -1) arr.splice(i, 1);
  arr.push(value);
}

/** Decrement a first-seen attribution counter, dropping empty keys. */
function decrementMap(map: Record<string, number>, key: string | null | undefined): void {
  if (!key || !(key in map)) return;
  map[key]--;
  if (map[key] <= 0) delete map[key];
}

function locLabel(city?: string, region?: string, country?: string): string | null {
  const parts = [city, country || region].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

function hostOf(ref: string | null | undefined): string | null {
  if (!ref) return null;
  try {
    const u = new URL(ref);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.hostname.slice(0, 60);
  } catch {
    return null;
  }
}

// ---------- Storage backend selection ----------

// Tri-state cache: null = unprobed. Reset to null on any disk failure so a
// transient error doesn't permanently flip the backend.
let diskOk: boolean | null = null;

function hasDriveToken(): boolean {
  return Boolean(env.ADMIN_DRIVE_REFRESH_TOKEN);
}

async function probeDisk(): Promise<boolean> {
  if (diskOk !== null) return diskOk;
  try {
    const fp = analyticsFilePath();
    await fs.mkdir(path.dirname(fp), { recursive: true });
    const probe = `${fp}.probe`;
    await fs.writeFile(probe, '1', 'utf-8');
    await fs.rm(probe, { force: true });
    diskOk = true;
  } catch {
    diskOk = false;
  }
  return diskOk;
}

export async function getStorageStatus(): Promise<StorageStatus> {
  if (await probeDisk()) {
    return { mode: 'disk', writable: true, detail: `Local log file (${analyticsFilePath()})` };
  }
  if (hasDriveToken()) {
    return {
      mode: 'drive',
      writable: true,
      detail: "Admin's Google Drive (PlacementWire_Data/admin_analytics.json)",
    };
  }
  return {
    mode: 'none',
    writable: false,
    detail:
      'Server disk is read-only (serverless host) and ADMIN_DRIVE_REFRESH_TOKEN is not set. ' +
      'Set it from Admin → Backup → Drive logging.',
  };
}

/**
 * Cross-process mutex around disk writes (lockfile + stale-lock breaking).
 * Two `next dev` servers / build + dev racing on data/analytics.json used to
 * silently lose rows via read-modify-write interleaving. With this lock the
 * read inside mutateDisk always sees the freshest file.
 */
async function withDiskLock<T>(fn: () => Promise<T>): Promise<T> {
  const lock = `${analyticsFilePath()}.lock`;
  for (let i = 0; i < 100; i++) {
    try {
      const fd = await fs.open(lock, 'wx');
      await fd.writeFile(`${process.pid}`, 'utf-8');
      await fd.close();
      try {
        return await fn();
      } finally {
        await fs.rm(lock, { force: true });
      }
    } catch (err: any) {
      if (err?.code !== 'EEXIST') throw err;
      try {
        const st = await fs.stat(lock);
        if (Date.now() - st.mtimeMs > 10_000) {
          await fs.rm(lock, { force: true });
          continue;
        }
      } catch {
        /* lock vanished mid-race — retry */
      }
      await new Promise((r) => setTimeout(r, 50));
    }
  }
  throw new Error('Analytics disk lock timeout');
}

/** Read → mutate → write atomically under the disk lock. */
async function mutateDisk(mutator: (data: AnalyticsFile, now: Date) => boolean | void): Promise<void> {
  await withDiskLock(async () => {
    const data = await readDisk();
    const now = new Date();
    const shouldWrite = mutator(data, now);
    if (shouldWrite === false) return;
    data.updatedAt = now.toISOString();
    data.totals.visitors = Object.keys(data.visitors).length;
    const fp = analyticsFilePath();
    await fs.mkdir(path.dirname(fp), { recursive: true });
    const tmp = `${fp}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data), 'utf-8');
    await fs.rename(tmp, fp);
  });
}

async function persistDisk(data: AnalyticsFile): Promise<void> {
  data.updatedAt = new Date().toISOString();
  data.totals.visitors = Object.keys(data.visitors).length;
  const fp = analyticsFilePath();
  await fs.mkdir(path.dirname(fp), { recursive: true });
  const tmp = `${fp}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data), 'utf-8');
  await fs.rename(tmp, fp);
}

/** Fold a legacy v1 file (users + raw visits) into the grouped v2 shape. */
function migrateV1(raw: Record<string, any>): AnalyticsFile {
  const data = emptyAnalyticsFile();
  const visits: any[] = Array.isArray(raw.visits) ? raw.visits : [];
  const users: Record<string, any> = raw.users || {};

  for (const v of visits) {
    const ts = typeof v.ts === 'string' ? v.ts : new Date().toISOString();
    const d = new Date(ts);
    const date = ts.slice(0, 10);
    const email: string | null = v.email || null;
    const key = visitorKey(email, v.ip || null, v.userAgent || null);
    let vis = data.visitors[key];
    if (!vis) {
      const u = email ? users[email.trim().toLowerCase()] : null;
      const deviceLabel = parseDevice(v.userAgent || u?.lastUserAgent || null);
      vis = data.visitors[key] = {
        key,
        email,
        name: v.name || u?.name || null,
        firstSeen: ts,
        lastActive: ts,
        lastPath: null,
        totalVisits: 0,
        sessions: 0,
        sessionSecs: 0,
        loginCount: 0,
        lastLogin: null,
        lastIp: null,
        ipsSeen: v.ip ? [v.ip] : [],
        device: deviceLabel,
        devicesSeen: [deviceLabel],
        referrer: null,
        isAdmin: Boolean(v.isAdmin || u?.isAdmin),
        pages: {},
      };
      data.totals.visitors++;
    }
    if (ts < vis.firstSeen) vis.firstSeen = ts;
    if (ts > vis.lastActive) {
      vis.lastActive = ts;
    }
    vis.totalVisits++;
    data.totals.visits++;
    dayOf(data, date).visits++;
    const h = d.getHours();
    if (data.hourly[h] !== undefined) data.hourly[h]++;

    const isLogin = v.event === 'login' || v.event === 'signup';
    if (isLogin) {
      vis.loginCount++;
      data.totals.logins++;
      dayOf(data, date).logins++;
      if (!vis.lastLogin || ts > vis.lastLogin) vis.lastLogin = ts;
      if (v.event === 'signup') {
        data.totals.signups++;
        dayOf(data, date).signups++;
      }
    }
    if (v.ip && !vis.lastIp) vis.lastIp = v.ip;
    if (v.city && !vis.city) {
      vis.city = v.city;
      vis.region = v.region;
      vis.country = v.country;
    }
    const p = typeof v.path === 'string' ? v.path.slice(0, 120) : null;
    if (p) {
      vis.lastPath = p;
      const ps = vis.pages[p] || { count: 0, lastSeen: ts };
      ps.count++;
      if (ts > ps.lastSeen) ps.lastSeen = ts;
      vis.pages[p] = ps;
      const g = data.pagesGlobal[p] || { views: 0, visitors: 0, lastVisited: ts };
      g.views++;
      if (ts > g.lastVisited) g.lastVisited = ts;
      data.pagesGlobal[p] = g;
    }
  }

  // Unique-visitor + device/location/referrer counters from folded rows
  for (const vis of Object.values(data.visitors)) {
    // Migration can't reconstruct past session boundaries — floor of 1.
    vis.sessions = 1;
    data.totals.sessions++;
    for (const p of Object.keys(vis.pages)) {
      data.pagesGlobal[p].visitors++;
    }
    data.devices[vis.device] = (data.devices[vis.device] || 0) + 1;
    const loc = locLabel(vis.city, vis.region, vis.country);
    if (loc) data.locations[loc] = (data.locations[loc] || 0) + 1;
  }

  return data;
}

function ensureV2Shape(parsed: Record<string, any>): AnalyticsFile | null {
  if (parsed.version === 2 && parsed.visitors && parsed.totals) {
    const data = parsed as unknown as AnalyticsFile;
    if (!Array.isArray(data.hourly) || data.hourly.length !== 24) {
      data.hourly = Array.from({ length: 24 }, () => 0);
    }
    return data;
  }
  return null;
}

async function readDisk(): Promise<AnalyticsFile> {
  try {
    await migrateLegacyDevFile(analyticsFilePath());
    const raw = await fs.readFile(analyticsFilePath(), 'utf-8');
    const parsed = JSON.parse(raw) as Record<string, any>;
    const v2 = ensureV2Shape(parsed);
    if (v2) return v2;
    if (parsed.visits || parsed.users) {
      const migrated = migrateV1(parsed);
      await persistDisk(migrated);
      return migrated;
    }
  } catch (err) {
    diskOk = null; // read failure may mean disk trouble — re-probe next time
    // NEVER silently start empty over an unreadable non-empty file: quarantine
    // a copy first so no recorded data can vanish through a parse failure.
    try {
      const fp = analyticsFilePath();
      const st = await fs.stat(fp);
      if (st.size > 0) {
        await fs.copyFile(fp, `${fp}.corrupt-${Date.now()}`);
      }
    } catch {
      /* best-effort quarantine */
    }
  }
  return emptyAnalyticsFile();
}

export async function readAnalytics(): Promise<AnalyticsFile> {
  if (await probeDisk()) return readDisk();
  if (hasDriveToken()) {
    try {
      const { readDriveAnalytics } = await import('./drive-store');
      return (await readDriveAnalytics(env.ADMIN_DRIVE_REFRESH_TOKEN!)) || emptyAnalyticsFile();
    } catch (err) {
      console.warn('Analytics Drive read failed:', err);
    }
  }
  return emptyAnalyticsFile();
}

export interface RecordVisitInput {
  event: 'login' | 'signup' | 'pageview';
  email?: string | null;
  name?: string | null;
  path?: string | null;
  ip?: string | null;
  city?: string;
  region?: string;
  country?: string;
  userAgent?: string | null;
  referrer?: string | null;
  isAdmin?: boolean;
}

/**
 * Fold a pre-login anonymous row into its owner's email row.
 *
 * Why this exists: a student browses logged-out (row `anon:<ip|ua hash>`)
 * and later logs in on the SAME browser (row `email:<addr>`). Without a
 * merge, one human shows as two profiles forever. On any authenticated hit
 * we fold the matching anon row in and delete it.
 *
 * Cumulative counters (totals.visits/logins/...) already include BOTH rows'
 * history, so they are deliberately left untouched. Only identity-level
 * state moves: totals.visitors -1, first-seen attributions retracted for
 * the disappearing identity, and pagesGlobal unique-visitor counts fixed
 * where both rows saw the same page.
 */
function mergeAnonRow(data: AnalyticsFile, target: Visitor, anonKey: string): boolean {
  const anon = data.visitors[anonKey];
  if (!anon || anonKey === target.key) return false;

  target.totalVisits += anon.totalVisits;
  target.sessions += anon.sessions;
  target.sessionSecs += anon.sessionSecs;
  target.loginCount += anon.loginCount;
  if (!target.name && anon.name) target.name = anon.name;
  if (!target.lastIp && anon.lastIp) target.lastIp = anon.lastIp;
  if (!target.city && anon.city) {
    target.city = anon.city;
    target.region = anon.region;
    target.country = anon.country;
  }
  if (anon.firstSeen < target.firstSeen) target.firstSeen = anon.firstSeen;
  if (anon.lastActive > target.lastActive) target.lastActive = anon.lastActive;
  if (anon.lastLogin && (!target.lastLogin || anon.lastLogin > target.lastLogin)) {
    target.lastLogin = anon.lastLogin;
  }
  if (anon.isAdmin) target.isAdmin = true;
  for (const ip of anon.ipsSeen || []) pushUnique(target.ipsSeen, ip);
  for (const d of anon.devicesSeen || []) pushUnique(target.devicesSeen, d);

  for (const [p, st] of Object.entries(anon.pages)) {
    const t = target.pages[p];
    if (t) {
      t.count += st.count;
      if (st.lastSeen > t.lastSeen) t.lastSeen = st.lastSeen;
      const g = data.pagesGlobal[p];
      if (g && g.visitors > 0) g.visitors--;
    } else {
      target.pages[p] = { count: st.count, lastSeen: st.lastSeen };
    }
  }

  decrementMap(data.devices, anon.device);
  const loc = locLabel(anon.city, anon.region, anon.country);
  if (loc) decrementMap(data.locations, loc);
  if (anon.referrer) decrementMap(data.referrers, anon.referrer);

  delete data.visitors[anonKey];
  data.totals.visitors = Object.keys(data.visitors).length;
  return true;
}

/** Pure mutation: fold one hit into grouped counters. Shared by all backends. */
function applyVisit(data: AnalyticsFile, input: RecordVisitInput, now: Date): void {
  const nowIso = now.toISOString();
  const today = dayKey(now);
  const email = input.email?.trim().toLowerCase() || null;
  const key = visitorKey(email, input.ip || null, input.userAgent || null);
  const deviceLabel = parseDevice(input.userAgent);

  let vis = data.visitors[key];
  const isNew = !vis;
  if (!vis) {
    vis = data.visitors[key] = {
      key,
      email,
      name: input.name || null,
      firstSeen: nowIso,
      lastActive: new Date(0).toISOString(),
      lastPath: null,
      totalVisits: 0,
      sessions: 0,
      sessionSecs: 0,
      loginCount: 0,
      lastLogin: null,
      lastIp: null,
      ipsSeen: [],
      device: deviceLabel,
      devicesSeen: [],
      referrer: hostOf(input.referrer),
      isAdmin: Boolean(input.isAdmin),
      pages: {},
    };
    data.totals.visitors++;
    // First-seen attribution counters (counted once per visitor)
    data.devices[vis.device] = (data.devices[vis.device] || 0) + 1;
    const loc = locLabel(input.city, input.region, input.country);
    if (loc) data.locations[loc] = (data.locations[loc] || 0) + 1;
    if (vis.referrer) data.referrers[vis.referrer] = (data.referrers[vis.referrer] || 0) + 1;
  }
  // Backfill for rows written before ipsSeen/devicesSeen existed
  if (!Array.isArray(vis.ipsSeen)) vis.ipsSeen = vis.lastIp ? [vis.lastIp] : [];
  if (!Array.isArray(vis.devicesSeen)) vis.devicesSeen = vis.device ? [vis.device] : [];

  // Same browser, now identified: fold the pre-login anonymous row in.
  // Runs BEFORE the session check so merged recency counts correctly.
  if (email) {
    const anonKey = `anon:${fingerprint(input.ip || null, input.userAgent || null)}`;
    if (anonKey !== key) mergeAnonRow(data, vis, anonKey);
  }

  if (email && !vis.email) vis.email = email;
  if (input.name && !vis.name) vis.name = input.name;
  if (input.isAdmin) vis.isAdmin = true;
  if (input.ip) {
    vis.lastIp = input.ip;
    pushUnique(vis.ipsSeen, input.ip);
  }
  if (input.userAgent) {
    vis.device = deviceLabel;
    pushUnique(vis.devicesSeen, deviceLabel);
  }
  if (input.city && vis.city !== input.city) {
    vis.city = input.city;
    vis.region = input.region;
    vis.country = input.country;
  }

  // New session after 30 min of inactivity
  const lastActiveMs = new Date(vis.lastActive).getTime() || 0;
  if (!lastActiveMs || now.getTime() - lastActiveMs > SESSION_TIMEOUT_MS) {
    vis.sessions++;
    data.totals.sessions++;
  }
  // Daily unique-visitor counting
  const lastActiveDay = vis.lastActive.slice(0, 10);
  vis.lastActive = nowIso;
  const dd = dayOf(data, today);
  if (lastActiveDay !== today) dd.visitors++;

  vis.totalVisits++;
  data.totals.visits++;
  dd.visits++;
  const h = now.getHours();
  if (data.hourly[h] !== undefined) data.hourly[h]++;

  if (input.event === 'login' || input.event === 'signup') {
    vis.loginCount++;
    vis.lastLogin = nowIso;
    data.totals.logins++;
    dd.logins++;
    // Signup = first-ever login (or explicit signup event)
    if (input.event === 'signup' || (input.event === 'login' && isNew)) {
      data.totals.signups++;
      dd.signups++;
    }
  }

  if (input.path) {
    const p = input.path;
    vis.lastPath = p;
    const isFirstView = !vis.pages[p];
    const ps = vis.pages[p] || { count: 0, lastSeen: nowIso };
    ps.count++;
    ps.lastSeen = nowIso;
    vis.pages[p] = ps;
    const g = data.pagesGlobal[p] || { views: 0, visitors: 0, lastVisited: nowIso };
    g.views++;
    if (isFirstView) g.visitors++;
    if (nowIso > g.lastVisited) g.lastVisited = nowIso;
    data.pagesGlobal[p] = g;
  }

  // NO-DELETION: every recorded hit stays visible forever. No daily expiry,
  // no stale-row pruning — see policy note at the top of this file.
}

/** One grouped upsert per hit. Never throws. Disk path is lock-guarded so
 *  concurrent servers can never interleave a read-modify-write cycle. */
export async function recordVisit(input: RecordVisitInput): Promise<void> {
  try {
    if (await probeDisk()) {
      await mutateDisk((data, now) => applyVisit(data, input, now));
      return;
    }
    if (hasDriveToken()) {
      const { updateDriveAnalytics } = await import('./drive-store');
      await updateDriveAnalytics(env.ADMIN_DRIVE_REFRESH_TOKEN!, (data) => applyVisit(data, input, new Date()));
      return;
    }
    console.warn('Analytics dropped (no writable storage — see Admin → Backup):', input.event, input.path);
  } catch (err) {
    diskOk = null;
    console.warn('Analytics recordVisit failed:', err);
  }
}

export interface HeartbeatInput {
  email?: string | null;
  path?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  /** Seconds accumulated in this tab session; sent on tab close */
  sessionSecs?: number;
}

/** Returns true when the heartbeat carries a change worth persisting. */
function applyHeartbeat(data: AnalyticsFile, input: HeartbeatInput, now: Date): boolean {
  const email = input.email?.trim().toLowerCase() || null;
  const key = visitorKey(email, input.ip || null, input.userAgent || null);
  const vis = data.visitors[key];
  if (!vis) return false; // unknown tab — next pageview will register it
  const nowIso = now.toISOString();
  const today = dayKey(now);

  if (input.sessionSecs && input.sessionSecs > 0) {
    const capped = Math.min(input.sessionSecs, 12 * 3600);
    vis.sessionSecs += capped;
    data.totals.sessionSecs += capped;
  } else if (now.getTime() - new Date(vis.lastActive).getTime() <= HEARTBEAT_WRITE_MS) {
    return false; // throttled — nothing new to persist
  }

  const lastActiveDay = vis.lastActive.slice(0, 10);
  vis.lastActive = nowIso;
  if (input.path) vis.lastPath = input.path;
  if (lastActiveDay !== today) dayOf(data, today).visitors++;
  return true;
}

/**
 * Lightweight presence ping. Does NOT inflate visit counters.
 * On disk it writes only when the last write is >2 min old (or session
 * seconds arrive); on Drive every persisted heartbeat is one read+write.
 */
export async function recordHeartbeat(input: HeartbeatInput): Promise<void> {
  try {
    if (await probeDisk()) {
      await mutateDisk((data, now) => applyHeartbeat(data, input, now));
      return;
    }
    if (hasDriveToken()) {
      const { readDriveAnalytics, overwriteDriveAnalytics } = await import('./drive-store');
      const data = (await readDriveAnalytics(env.ADMIN_DRIVE_REFRESH_TOKEN!)) || emptyAnalyticsFile();
      if (applyHeartbeat(data, input, new Date())) {
        await overwriteDriveAnalytics(env.ADMIN_DRIVE_REFRESH_TOKEN!, data);
      }
      return;
    }
  } catch (err) {
    diskOk = null;
    console.warn('Analytics heartbeat failed:', err);
  }
}

export interface FailedLoginInput {
  /** Machine-readable reason: domain_unauthorized, unverified_email, oauth_error:<code>, ... */
  reason: string;
  email?: string | null;
}

function applyFailedLogin(data: AnalyticsFile, input: FailedLoginInput, now: Date): void {
  const stats = ensureFailedStats(data);
  stats.total++;
  stats.byReason[input.reason] = (stats.byReason[input.reason] || 0) + 1;
  stats.lastAt = now.toISOString();
  if (input.email) stats.lastEmail = input.email.slice(0, 160);
}

/** Count a rejected sign-in attempt. Never throws. Same backends as visits. */
export async function recordFailedLogin(input: FailedLoginInput): Promise<void> {
  try {
    if (await probeDisk()) {
      await mutateDisk((data, now) => applyFailedLogin(data, input, now));
      return;
    }
    if (hasDriveToken()) {
      const { updateDriveAnalytics } = await import('./drive-store');
      await updateDriveAnalytics(env.ADMIN_DRIVE_REFRESH_TOKEN!, (data) => applyFailedLogin(data, input, new Date()));
      return;
    }
  } catch (err) {
    diskOk = null;
    console.warn('Analytics recordFailedLogin failed:', err);
  }
}

// ---------- Read models for the Admin console ----------

export interface AdminOverview {
  updatedAt: string;
  fileBytes: number;
  storage: StorageStatus;
  /** 'production' on Vercel, 'development' on localhost — tells the admin
   *  EXACTLY which silo this panel is showing. */
  environment: string;
  totals: AnalyticsFile['totals'] & {
    onlineNow: number;
    dau: number;
    wau: number;
    mau: number;
    bounced: number;
    avgSessionSecs: number;
  };
  perDay: { date: string; visits: number; logins: number; signups: number; visitors: number }[];
  hourly: number[];
  topPages: { path: string; views: number; visitors: number; lastVisited: string }[];
  topDevices: { label: string; visitors: number }[];
  topLocations: { label: string; visitors: number }[];
  topReferrers: { label: string; visitors: number }[];
  liveNow: Visitor[];
  visitors: Visitor[];
  signups: Visitor[];
  failedLogins: {
    total: number;
    byReason: { reason: string; count: number }[];
    lastAt: string | null;
    lastEmail: string | null;
  };
}

const LIVE_WINDOW_MS = 5 * 60 * 1000;

function topEntries(map: Record<string, number>, limit: number): { label: string; visitors: number }[] {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, visitors]) => ({ label, visitors }));
}

export async function buildOverview(data: AnalyticsFile): Promise<AdminOverview> {
  const now = Date.now();
  const all = Object.values(data.visitors).sort((a, b) => (a.lastActive < b.lastActive ? 1 : -1));
  const today = dayKey(new Date());

  const liveNow = all.filter((v) => now - new Date(v.lastActive).getTime() <= LIVE_WINDOW_MS);
  const dau = (data.daily[today] || emptyDay()).visitors;
  const wau = all.filter((v) => now - new Date(v.lastActive).getTime() <= 7 * 24 * 3600 * 1000).length;
  const mau = all.filter((v) => now - new Date(v.lastActive).getTime() <= 30 * 24 * 3600 * 1000).length;
  const bounced = all.filter((v) => v.totalVisits <= 1).length;

  // Full history — nothing is ever pruned, so every recorded day shows.
  const perDay = Object.entries(data.daily)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, s]) => ({ date, ...s }));

  const topPages = Object.entries(data.pagesGlobal)
    .map(([p, s]) => ({ path: p, ...s }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 25);

  let fileBytes = 0;
  try {
    if (await probeDisk()) fileBytes = (await fs.stat(analyticsFilePath())).size;
  } catch {
    /* unreadable size */
  }

  return {
    updatedAt: data.updatedAt,
    fileBytes,
    storage: await getStorageStatus(),
    environment: process.env.NODE_ENV || 'development',
    totals: {
      ...data.totals,
      onlineNow: liveNow.length,
      dau,
      wau,
      mau,
      bounced,
      avgSessionSecs:
        data.totals.sessions > 0 ? Math.round(data.totals.sessionSecs / data.totals.sessions) : 0,
    },
    perDay,
    hourly: data.hourly,
    topPages,
    topDevices: topEntries(data.devices, 10),
    topLocations: topEntries(data.locations, 10),
    topReferrers: topEntries(data.referrers, 10),
    liveNow: liveNow.slice(0, 50),
    visitors: all,
    signups: [...all].sort((a, b) => (a.firstSeen < b.firstSeen ? 1 : -1)),
    failedLogins: {
      total: data.failedLogins?.total ?? 0,
      byReason: Object.entries(data.failedLogins?.byReason || {})
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count),
      lastAt: data.failedLogins?.lastAt ?? null,
      lastEmail: data.failedLogins?.lastEmail ?? null,
    },
  };
}
