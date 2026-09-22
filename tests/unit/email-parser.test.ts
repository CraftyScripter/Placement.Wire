import { describe, it, expect } from 'vitest';
import { parsePlacementEmail } from '@/lib/parser/email-parser';
import {
  FIXTURE_RGF_INDIA,
  FIXTURE_75WAY,
  FIXTURE_BRIBOOKS,
} from '@/lib/parser/fixtures';

describe('Email Parser Pipeline Fixture Tests', () => {
  it('Fixture A: Should correctly parse RGF India placement email', () => {
    const drive = parsePlacementEmail(FIXTURE_RGF_INDIA);
    expect(drive).not.toBeNull();
    if (!drive) return;

    expect(drive.company).toBe('RGF India');
    expect(drive.drive_type).toBe('FINAL_PLACEMENT');
    expect(drive.positions[0].location).toBe('Gurgaon');
    expect(drive.positions[0].role).toBe('Associate Consultant');
    expect(drive.positions[0].ctc).toBeNull(); // Not specified, must be null
    expect(drive.positions[0].eligible_batches).toEqual([2026, 2027]);

    const courses = drive.positions[0].eligible_courses;
    expect(courses).toContain('B.Tech CSE');
    expect(courses).toContain('B.Tech CST');
    expect(courses).toContain('B.Tech AIML');
    expect(courses).toContain('B.Tech DS');
    expect(courses).toContain('MBA');

    expect(drive.deadline).not.toBeNull();
    expect(drive.deadline_precision).toBe('DATE_ONLY');
    expect(drive.company_website).toBe('http://www.rgf-professional.com/');
    expect(drive.job_description_url).toContain('drive.google.com');
    expect(drive.apply_url).toContain('forms.gle');
  });

  it('Fixture B: Should correctly parse 75WAY Technologies email with multiple profiles and package', () => {
    const drive = parsePlacementEmail(FIXTURE_75WAY);
    expect(drive).not.toBeNull();
    if (!drive) return;

    expect(drive.company).toBe('75WAY Technologies Pvt. Ltd.');
    expect(drive.drive_type).toBe('INTERNSHIP_WITH_PPO');
    expect(drive.positions[0].location).toBe('Mohali');
    expect(drive.positions[0].ctc).toContain('4.00 LPA');

    // Should extract both profiles
    const roles = drive.positions.map((p) => p.role);
    expect(roles).toContain('Associate Software Developer');
    expect(roles).toContain('Software Development Engineer (Level I)');

    expect(drive.positions[0].eligible_batches).toEqual([2026, 2027]);
    const courses = drive.positions[0].eligible_courses;
    expect(courses).toContain('B.Tech');
    expect(courses).toContain('MCA');

    expect(drive.company_website).toBe('https://75way.com');
    expect(drive.job_description_url).toContain('drive.google.com');
    expect(drive.apply_url).toContain('forms.gle');
  });

  it('Fixture C: Should correctly parse BriBooks email with 4 distinct profiles', () => {
    const drive = parsePlacementEmail(FIXTURE_BRIBOOKS);
    expect(drive).not.toBeNull();
    if (!drive) return;

    expect(drive.company).toBe('BriBooks');
    expect(drive.drive_type).toBe('INTERNSHIP_WITH_PPO');
    expect(drive.positions[0].location).toBe('Gurgaon');

    // Should have 4 profiles
    expect(drive.positions.length).toBe(4);
    const roles = drive.positions.map((p) => p.role);
    expect(roles).toContain('Graphic Designer Intern');
    expect(roles).toContain('Python Developer Intern');
    expect(roles).toContain('Relations & Outreach');
    expect(roles).toContain('Business Development Executive');

    expect(drive.positions[0].eligible_batches).toEqual([2026, 2027]);
    const courses = drive.positions[0].eligible_courses;
    expect(courses).toContain('BCA');
    expect(courses).toContain('BBA');
    expect(courses).toContain('MBA');
    expect(courses).toContain('MCA');

    expect(drive.company_website).toBe('http://www.bribooks.com/');
    expect(drive.job_description_url).toContain('docs.google.com/document');
    expect(drive.apply_url).toContain('forms.gle');
  });

  it('Should correctly parse Hackathon and Competition emails', () => {
    const hackathonEmail = {
      id: 'hackathon_999',
      subject: 'Hackathon Opportunity | Smart India Hackathon & AI Challenge | Batch 2026 & 2027',
      sender: 'placements@saitm.org',
      bodyText: `
        Dear Students,
        Greetings from T&P Cell, SAITM!
        We are glad to announce a national level Hackathon & Coding Challenge.
        Company: Smart India Hackathon
        Eligible Batches: 2026, 2027
        Eligible Courses: B.Tech CSE, CST, AIML
        Deadline: 30th September 2026
        Application Link: https://forms.gle/hackathon2026
      `,
    };

    const parsed = parsePlacementEmail(hackathonEmail);
    expect(parsed).not.toBeNull();
    if (!parsed) return;

    expect(parsed.drive_type).toBe('HACKATHON');
    expect(parsed.company).toBe('Smart India Hackathon');
    expect(parsed.positions[0].eligible_batches).toEqual([2026, 2027]);
    expect(parsed.apply_url).toBe('https://forms.gle/hackathon2026');
  });

  it('Should reject non-placement spam emails', () => {
    const spamEmail = {
      id: 'spam_123',
      subject: 'Flash Sale: 50% discount on shoes today!',
      sender: 'deals@shop.com',
      bodyText: 'Hurry up and buy your favorite running shoes with free shipping!',
    };

    const parsed = parsePlacementEmail(spamEmail);
    expect(parsed).toBeNull();
  });
});
