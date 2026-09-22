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
 * pageview volume. Long-term retention is handled by:
 *  - per-visitor page cap (20, least-recently-used prune)
 *  - 30-day rolling daily counters
 *  - 90-day prune of single-visit anonymous rows
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
  city?: string;
  region?: string;
  country?: string;
  device: string;
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
}

export type StorageMode = 'disk' | 'drive' | 'none';

export interface StorageStatus {
  mode: StorageMode;
  writable: boolean;
  detail: string;
}

const MAX_PAGES_PER_VISITOR = 20;
const DAILY_RETENTION_DAYS = 30;
const ANON_PRUNE_DAYS = 90;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const HEARTBEAT_WRITE_MS = 2 * 60 * 1000;

export function analyticsFilePath(): string {
  if (process.env.ANALYTICS_FILE_PATH) return process.env.ANALYTICS_FILE_PATH;
  return path.join(process.cwd(), 'data', 'analytics.json');
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
  };
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
        device: parseDevice(v.userAgent || u?.lastUserAgent || null),
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

  pruneDaily(data);
  return data;
}

function pruneDaily(data: AnalyticsFile): void {
  const cutoff = dayKey(new Date(Date.now() - DAILY_RETENTION_DAYS * 24 * 60 * 60 * 1000));
  for (const d of Object.keys(data.daily)) {
    if (d < cutoff) delete data.daily[d];
  }
}

/** Delete stale single-visit anonymous rows (90 days, no login). */
function pruneVisitors(data: AnalyticsFile): void {
  const cutoff = Date.now() - ANON_PRUNE_DAYS * 24 * 60 * 60 * 1000;
  for (const [key, vis] of Object.entries(data.visitors)) {
    if (
      key.startsWith('anon:') &&
      vis.totalVisits <= 1 &&
      vis.loginCount === 0 &&
      new Date(vis.lastActive).getTime() < cutoff
    ) {
      delete data.visitors[key];
    }
  }
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

/** Prune least-recently-seen pages when a visitor exceeds the cap. */
function enforcePageCap(vis: Visitor): void {
  const keys = Object.keys(vis.pages);
  if (keys.length <= MAX_PAGES_PER_VISITOR) return;
  keys
    .sort((a, b) => (vis.pages[a].lastSeen < vis.pages[b].lastSeen ? -1 : 1))
    .slice(0, keys.length - MAX_PAGES_PER_VISITOR)
    .forEach((k) => delete vis.pages[k]);
}

/** Pure mutation: fold one hit into grouped counters. Shared by all backends. */
function applyVisit(data: AnalyticsFile, input: RecordVisitInput, now: Date): void {
  const nowIso = now.toISOString();
  const today = dayKey(now);
  const email = input.email?.trim().toLowerCase() || null;
  const key = visitorKey(email, input.ip || null, input.userAgent || null);

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
      device: parseDevice(input.userAgent),
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

  if (email && !vis.email) vis.email = email;
  if (input.name && !vis.name) vis.name = input.name;
  if (input.isAdmin) vis.isAdmin = true;
  if (input.ip) vis.lastIp = input.ip;
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
    enforcePageCap(vis);
    const g = data.pagesGlobal[p] || { views: 0, visitors: 0, lastVisited: nowIso };
    g.views++;
    if (isFirstView) g.visitors++;
    if (nowIso > g.lastVisited) g.lastVisited = nowIso;
    data.pagesGlobal[p] = g;
  }

  pruneDaily(data);
  if (Math.random() < 0.05) pruneVisitors(data); // amortized prune
}

/** One grouped upsert per hit. Never throws. */
export async function recordVisit(input: RecordVisitInput): Promise<void> {
  const now = new Date();
  try {
    if (await probeDisk()) {
      const data = await readDisk();
      applyVisit(data, input, now);
      await persistDisk(data);
      return;
    }
    if (hasDriveToken()) {
      const { updateDriveAnalytics } = await import('./drive-store');
      await updateDriveAnalytics(env.ADMIN_DRIVE_REFRESH_TOKEN!, (data) => applyVisit(data, input, now));
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
  const now = new Date();
  try {
    if (await probeDisk()) {
      const data = await readDisk();
      if (applyHeartbeat(data, input, now)) await persistDisk(data);
      return;
    }
    if (hasDriveToken()) {
      const { readDriveAnalytics, overwriteDriveAnalytics } = await import('./drive-store');
      const data = (await readDriveAnalytics(env.ADMIN_DRIVE_REFRESH_TOKEN!)) || emptyAnalyticsFile();
      if (applyHeartbeat(data, input, now)) {
        await overwriteDriveAnalytics(env.ADMIN_DRIVE_REFRESH_TOKEN!, data);
      }
      return;
    }
  } catch (err) {
    diskOk = null;
    console.warn('Analytics heartbeat failed:', err);
  }
}

// ---------- Read models for the Admin console ----------

export interface AdminOverview {
  updatedAt: string;
  fileBytes: number;
  storage: StorageStatus;
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

  const perDay = Object.entries(data.daily)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-30)
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
  };
}
