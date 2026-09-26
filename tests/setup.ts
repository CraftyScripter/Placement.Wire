/**
 * Test-only environment scaffolding. Unit tests must never depend on a real
 * .env file — every value below is fake and used only inside the test runner.
 * Production still fails fast via src/config/env.ts when a variable is missing.
 */
process.env.APP_URL ??= 'http://localhost:8000';
process.env.SESSION_SECRET ??= 'test-only-session-secret-min-32-chars';
process.env.GOOGLE_CLIENT_ID ??= 'test-client-id.apps.googleusercontent.com';
process.env.GOOGLE_CLIENT_SECRET ??= 'test-client-secret';
process.env.GOOGLE_REDIRECT_URI ??= 'http://localhost:8000/auth/google/callback';
process.env.ALLOWED_EMAIL_DOMAIN ??= 'saitm.ac.in';
process.env.CONTACT_FORM_API_URL ??= 'http://localhost:1/api/forms/test/submit';
process.env.CONTACT_FORM_API_KEY ??= 'test-contact-form-key';
process.env.ADMIN_EMAILS ??= 'admin@saitm.ac.in';
// Isolate analytics disk writes per test run (never touch real data/analytics.json)
process.env.ANALYTICS_FILE_PATH ??= `${process.cwd()}/data/.test-analytics.json`;
