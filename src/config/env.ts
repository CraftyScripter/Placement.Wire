import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('8000'),
  APP_URL: z.string().default('http://localhost:8000'),
  SESSION_SECRET: z.string().min(32).default('a8f4c2194e9f50f28e67a0774a26e8db30f368bb6e12e752945d81c0cb1fef7d'),
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
  GOOGLE_REDIRECT_URI: z.string().default('http://localhost:8000/auth/google/callback'),
  ALLOWED_EMAIL_DOMAIN: z.string().default('saitm.ac.in'),
  DEV_MOCK_AUTH: z.string().transform((val) => val === 'true').default('false'),
  CONTACT_FORM_API_URL: z.string().default('https://my-manager-eight.vercel.app/api/forms/placement-wire/submit'),
  CONTACT_FORM_API_KEY: z.string().default(''),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  APP_URL: process.env.APP_URL || 'http://localhost:8000',
  SESSION_SECRET: process.env.SESSION_SECRET || 'a8f4c2194e9f50f28e67a0774a26e8db30f368bb6e12e752945d81c0cb1fef7d',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8000/auth/google/callback',
  ALLOWED_EMAIL_DOMAIN: process.env.ALLOWED_EMAIL_DOMAIN || 'saitm.ac.in',
  DEV_MOCK_AUTH: process.env.DEV_MOCK_AUTH || 'false',
  CONTACT_FORM_API_URL: process.env.CONTACT_FORM_API_URL || 'https://my-manager-eight.vercel.app/api/forms/placement-wire/submit',
  CONTACT_FORM_API_KEY: process.env.CONTACT_FORM_API_KEY || '',
});
