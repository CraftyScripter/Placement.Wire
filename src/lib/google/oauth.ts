import { google } from 'googleapis';
import { env } from '@/config/env';

export const OAUTH_SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/drive.file',
];

export function getOAuth2Client(redirectUri?: string) {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    redirectUri || env.GOOGLE_REDIRECT_URI
  );
}

export function generateAuthUrl(state: string, redirectUri?: string): string {
  const client = getOAuth2Client(redirectUri);
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: OAUTH_SCOPES,
    state,
    include_granted_scopes: true,
  });
}

export async function exchangeCodeForTokens(code: string, redirectUri?: string) {
  const client = getOAuth2Client(redirectUri);
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function getGoogleUserProfile(accessToken: string) {
  const oauth2 = google.oauth2({
    version: 'v2',
    auth: getOAuth2Client(),
  });
  
  // Set credentials for this call
  const client = getOAuth2Client();
  client.setCredentials({ access_token: accessToken });
  
  const response = await oauth2.userinfo.get({ auth: client });
  return response.data;
}

export async function refreshAccessToken(refreshToken: string) {
  const client = getOAuth2Client();
  client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await client.refreshAccessToken();
  return credentials;
}
