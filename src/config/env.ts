import { z } from 'zod';

/**
 * Central environment validation. SECURITY RULE: no secrets, emails, URLs or
 * identifiers may have hardcoded fallbacks here — if a required variable is
 * missing the app must fail fast with a clear error, never boot with a
 * baked-in default. Copy .env.example to .env and fill every value.
 */
const required = (name: string) =>
  z
    .string({
      required_error: `Missing required environment variable: ${name}`,
      invalid_type_error: `Missing required environment variable: ${name}`,
    })
    .trim()
    .min(1, `Missing required environment variable: ${name}`);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('8000'),
  APP_URL: required('APP_URL'),
  SESSION_SECRET: z
    .string({
      required_error: 'Missing required environment variable: SESSION_SECRET',
      invalid_type_error: 'Missing required environment variable: SESSION_SECRET',
    })
    .min(32, 'SESSION_SECRET must be at least 32 characters long'),
  GOOGLE_CLIENT_ID: required('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: required('GOOGLE_CLIENT_SECRET'),
  GOOGLE_REDIRECT_URI: required('GOOGLE_REDIRECT_URI'),
  ALLOWED_EMAIL_DOMAIN: required('ALLOWED_EMAIL_DOMAIN').transform((s) =>
    s.trim().toLowerCase()
  ),
  // Deny-by-default flag (not a secret): unset means mock auth stays OFF.
  DEV_MOCK_AUTH: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  CONTACT_FORM_API_URL: required('CONTACT_FORM_API_URL'),
  CONTACT_FORM_API_KEY: required('CONTACT_FORM_API_KEY'),
  ADMIN_EMAILS: required('ADMIN_EMAILS'),
  // Optional: enables server-side analytics persistence on read-only hosts
  // (Vercel/serverless). Paste the admin's Google refresh token here —
  // get it from the Backup page ("Drive logging" section) after logging in
  // as admin. Absent = disk-only mode (localhost / VPS with writable disk).
  ADMIN_DRIVE_REFRESH_TOKEN: z.string().trim().min(1).optional(),
});

function loadEnv() {
  try {
    const parsed = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      APP_URL: process.env.APP_URL,
      SESSION_SECRET: process.env.SESSION_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
      ALLOWED_EMAIL_DOMAIN: process.env.ALLOWED_EMAIL_DOMAIN,
      DEV_MOCK_AUTH: process.env.DEV_MOCK_AUTH,
      CONTACT_FORM_API_URL: process.env.CONTACT_FORM_API_URL,
      CONTACT_FORM_API_KEY: process.env.CONTACT_FORM_API_KEY,
      ADMIN_EMAILS: process.env.ADMIN_EMAILS,
      ADMIN_DRIVE_REFRESH_TOKEN: process.env.ADMIN_DRIVE_REFRESH_TOKEN || undefined,
    });
    // Mock auth must never be reachable in production, even if the env flag
    // is accidentally left on during deploy. Coerce to false (with a loud
    // warning) rather than throwing, so `next build` — which runs with
    // NODE_ENV=production — doesn't fail on dev machines.
    if (parsed.NODE_ENV === 'production' && parsed.DEV_MOCK_AUTH) {
      console.warn(
        '[env] DEV_MOCK_AUTH=true is ignored in production (forced to false).'
      );
      return { ...parsed, DEV_MOCK_AUTH: false };
    }
    return parsed;
  } catch (err) {
    if (err instanceof z.ZodError) {
      const details = err.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n');
      throw new Error(
        `Invalid environment configuration:\n${details}\nCopy .env.example to .env and fill all required values. Never hardcode secrets in code.`
      );
    }
    throw err;
  }
}

export const env = loadEnv();
export type AppEnv = typeof env;
