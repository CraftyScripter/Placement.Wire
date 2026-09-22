/**
 * PlacementWire College Email Domain Validator
 * Exclusively permits authenticated, verified accounts from St. Andrews Institute of Technology and Management (@saitm.ac.in).
 */

export const ALLOWED_DOMAIN = 'saitm.ac.in';

export interface DomainValidationResult {
  isValid: boolean;
  email: string;
  normalizedEmail: string;
  domain?: string;
  reason?: string;
}

export function validateCollegeEmail(email: unknown): DomainValidationResult {
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

  // Exact domain check - strictly reject subdomains like foo.saitm.ac.in or fake domains like saitm.ac.in.attacker.com
  if (domainPart !== ALLOWED_DOMAIN) {
    return {
      isValid: false,
      email,
      normalizedEmail: normalized,
      domain: domainPart,
      reason: `Access is restricted to verified SAITM accounts (@${ALLOWED_DOMAIN}). Personal Gmail or other domain accounts are not allowed.`,
    };
  }

  return {
    isValid: true,
    email,
    normalizedEmail: normalized,
    domain: domainPart,
  };
}
