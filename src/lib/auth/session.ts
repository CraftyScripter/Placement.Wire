import { SignJWT, jwtVerify, EncryptJWT, jwtDecrypt } from 'jose';
import { cookies } from 'next/headers';
import { env } from '@/config/env';

export const SESSION_COOKIE_NAME = 'pw_session';
export const OAUTH_STATE_COOKIE_NAME = 'pw_oauth_state';

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
  picture?: string;
  isMockUser?: boolean;
}

export interface SessionTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  token_type?: string;
  scope?: string;
}

export interface FullSessionPayload {
  user: SessionUser;
  tokens: SessionTokens;
}

// Derive a consistent 32-byte key from SESSION_SECRET
function getEncryptionKey(): Uint8Array {
  const secret = env.SESSION_SECRET;
  const encoder = new TextEncoder();
  const hash = encoder.encode(secret.padEnd(32, '0').slice(0, 32));
  return hash;
}

/**
 * Encrypts and sets the session cookie (HTTP-only, Secure in prod, SameSite Lax)
 */
export async function createSession(payload: FullSessionPayload): Promise<string> {
  const key = getEncryptionKey();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const token = await new EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .encrypt(key);

  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  return token;
}

/**
 * Reads and decrypts the session cookie
 */
export async function getSession(): Promise<FullSessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const key = getEncryptionKey();
    const { payload } = await jwtDecrypt(token, key);

    return payload as unknown as FullSessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Clears the session cookie
 */
export async function destroySession(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Generates and saves CSRF state for OAuth
 */
export async function setOAuthStateCookie(state: string): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15, // 15 minutes
  });
}

/**
 * Retrieves and consumes CSRF state cookie
 */
export async function verifyAndClearOAuthStateCookie(stateToCheck: string): Promise<boolean> {
  const cookieStore = cookies();
  const state = cookieStore.get(OAUTH_STATE_COOKIE_NAME)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE_NAME);
  return Boolean(state && state === stateToCheck);
}
