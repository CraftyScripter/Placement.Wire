import { describe, it, expect, beforeAll } from 'vitest';
import { validateCollegeEmail, getAllowedDomain } from '@/lib/security/domain-validator';

// Unit tests must not depend on a real .env file: the domain under test is
// injected explicitly, exactly as production injects it via ALLOWED_EMAIL_DOMAIN.
const TEST_DOMAIN = 'saitm.ac.in';

beforeAll(() => {
  process.env.ALLOWED_EMAIL_DOMAIN = TEST_DOMAIN;
});

describe('College Email Domain Validator (@saitm.ac.in)', () => {
  it('should accept valid @saitm.ac.in emails', () => {
    const validEmails = [
      'student@saitm.ac.in',
      'john.doe@saitm.ac.in',
      '2023cse042@saitm.ac.in',
      'placement.cell@saitm.ac.in',
    ];

    for (const email of validEmails) {
      const result = validateCollegeEmail(email);
      expect(result.isValid).toBe(true);
      expect(result.normalizedEmail).toBe(email);
      expect(result.domain).toBe(getAllowedDomain());
    }
  });

  it('should normalize uppercase and whitespace in emails', () => {
    const result = validateCollegeEmail('  STUDENT@SAITM.AC.IN  ');
    expect(result.isValid).toBe(true);
    expect(result.normalizedEmail).toBe('student@saitm.ac.in');
  });

  it('should reject personal Gmail accounts', () => {
    const result = validateCollegeEmail('student@gmail.com');
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('Access is restricted');
  });

  it('should reject spoofed subdomain and domain suffix bypasses', () => {
    const attackEmails = [
      'student@saitm.ac.in.example.com',
      'student@evil-saitm.ac.in',
      'student@saitm.ac.in.attacker.org',
      'student@sub.saitm.ac.in',
      'student@saitm.ac.in@other.com',
    ];

    for (const email of attackEmails) {
      const result = validateCollegeEmail(email);
      expect(result.isValid).toBe(false);
    }
  });

  it('should reject malformed or non-string inputs', () => {
    expect(validateCollegeEmail('').isValid).toBe(false);
    expect(validateCollegeEmail(null).isValid).toBe(false);
    expect(validateCollegeEmail(undefined).isValid).toBe(false);
    expect(validateCollegeEmail('invalid-email-string').isValid).toBe(false);
    expect(validateCollegeEmail('@saitm.ac.in').isValid).toBe(false);
  });
});
