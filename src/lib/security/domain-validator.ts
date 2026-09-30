/**
 * PlacementWire College Email Domain Validator.
 * The allowed domain is read from ALLOWED_EMAIL_DOMAIN at call time —
 * there is intentionally no hardcoded fallback in this file.
 */

export function getAllowedDomain(): string {
  const raw = process.env.ALLOWED_EMAIL_DOMAIN;
  const domain = raw?.trim().toLowerCase();
  if (!domain) {
    throw new Error(
      'Missing required environment variable: ALLOWED_EMAIL_DOMAIN. Copy .env.example to .env and set it.'
    );
  }
  return domain;
}

export interface DomainValidationResult {
  isValid: boolean;
  email: string;
  normalizedEmail: string;
  domain?: string;
  reason?: string;
}

export function validateCollegeEmail(email: unknown, allowedDomain?: string): DomainValidationResult {
  if (typeof email !== 'string' || !email) {
    return {
      isValid: false,
      email: String(email ?? ''),
      normalizedEmail: '',
      reason: 'Email is missing or invalid type',
    };
  }

  const normalized = email.trim().toLowerCase();

  // Basic RFC-5322 structure validation
  const atParts = normalized.split('@');
  if (atParts.length !== 2) {
    return {
      isValid: false,
      email,
      normalizedEmail: normalized,
      reason: 'Email must contain exactly one @ symbol',
    };
  }

  const [localPart, domainPart] = atParts;

  if (!localPart || localPart.length === 0) {
    return {
      isValid: false,
      email,
      normalizedEmail: normalized,
      reason: 'Email local part cannot be empty',
    };
  }

  // Exact domain check - strictly reject subdomains like foo.<domain> or fake domains like <domain>.attacker.com
  const allowed = (allowedDomain ?? getAllowedDomain()).trim().toLowerCase();
  if (domainPart !== allowed) {
    return {
      isValid: false,
      email,
      normalizedEmail: normalized,
      domain: domainPart,
      reason: `Access is restricted to verified college accounts (@${allowed}). Personal Gmail or other domain accounts are not allowed.`,
    };
  }

  return {
    isValid: true,
    email,
    normalizedEmail: normalized,
    domain: domainPart,
  };
}
