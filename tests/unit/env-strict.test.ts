import { describe, it, expect, vi } from 'vitest';

/**
 * Security regression test: required env vars must have NO hardcoded
 * fallbacks. If one is missing, the app must fail fast with a clear error
 * instead of booting with a baked-in secret.
 */
describe('env strictness (no secret fallbacks)', () => {
  it('throws a clear error when a required variable is missing', async () => {
    vi.resetModules();
    const saved = process.env.SESSION_SECRET;
    delete process.env.SESSION_SECRET;
    try {
      await expect(import('@/config/env')).rejects.toThrow(/SESSION_SECRET/);
    } finally {
      process.env.SESSION_SECRET = saved;
    }
  });

  it('loads fine when all required variables are present', async () => {
    vi.resetModules();
    const mod = await import('@/config/env');
    expect(mod.env.APP_URL.length).toBeGreaterThan(0);
    expect(mod.env.ADMIN_EMAILS.length).toBeGreaterThan(0);
  });
});
