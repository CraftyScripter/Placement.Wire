import { describe, it, expect } from 'vitest';
import { parsePlacementEmail, isTrustedPlacementSender } from '@/lib/parser/email-parser';
import {
  FIXTURE_RGF_INDIA,
  FIXTURE_75WAY,
  FIXTURE_BRIBOOKS,
  FIXTURE_PRODESK_IT,
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

  it('Should reject emails sent or forwarded from personal/user email accounts', () => {
    const forwardedEmail = {
      id: 'fwd_123',
      subject: 'Fwd: Final Placement Opportunity | RGF India',
      sender: 'myemail@gmail.com', // user's personal email
      bodyText: 'Hey check this placement drive with RGF India!',
    };

    const parsed = parsePlacementEmail(forwardedEmail);
    expect(parsed).toBeNull();
  });

  it('Should strictly accept emails directly from placements@saitm.org', () => {
    const directPlacementEmail = {
      id: 'valid_saitm_001',
      subject: 'Campus Placement Drive: Capgemini | Batch 2026',
      sender: 'placements@saitm.org',
      bodyText: 'Dear Students, Greetings from T&P cell! Capgemini drive is scheduled.',
    };

    const parsed = parsePlacementEmail(directPlacementEmail);
    expect(parsed).not.toBeNull();
    expect(parsed?.company).toBe('Capgemini');
  });

  it('Should accept on-campus drive emails from the Director-TNP desk (directortnp@saitm.ac.in)', () => {
    expect(isTrustedPlacementSender('Director tnp <directortnp@saitm.ac.in>')).toBe(true);
    expect(isTrustedPlacementSender('placements@saitm.ac.in')).toBe(true);
    expect(isTrustedPlacementSender('placements@saitm.org')).toBe(true);
    expect(isTrustedPlacementSender('tnp@saitm.ac.in')).toBe(true);
    expect(isTrustedPlacementSender('crc@saitm.ac.in')).toBe(true);
    expect(isTrustedPlacementSender('careers@saitm.ac.in')).toBe(true);
    // Department / faculty / admin mail must NOT inflate the dashboard
    expect(isTrustedPlacementSender('hod.cse@saitm.ac.in')).toBe(false);
    expect(isTrustedPlacementSender('dean.academics@saitm.ac.in')).toBe(false);
    expect(isTrustedPlacementSender('noreply@saitm.ac.in')).toBe(false);
    expect(isTrustedPlacementSender('student@saitm.ac.in')).toBe(false);
    // Spoofed subdomains and personal mail rejected
    expect(isTrustedPlacementSender('placements@saitm.ac.in.evil.com')).toBe(false);
    expect(isTrustedPlacementSender('myemail@gmail.com')).toBe(false);
    expect(isTrustedPlacementSender('deals@shop.com')).toBe(false);
  });

  it('Fixture D: Should correctly parse Prodesk IT multi-role campus drive email', () => {
    const drive = parsePlacementEmail(FIXTURE_PRODESK_IT);
    expect(drive).not.toBeNull();
    if (!drive) return;

    expect(drive.company).toBe('Prodesk IT');
    expect(drive.drive_type).toBe('FINAL_PLACEMENT');

    // Six distinct roles, each with its own CTC — selection-process steps must not leak in
    expect(drive.positions.length).toBe(6);
    const byRole = Object.fromEntries(drive.positions.map((p) => [p.role, p]));
    expect(byRole['Python Developer'].ctc).toContain('3.2');
    expect(byRole['Python Developer'].ctc).toContain('4.6 LPA');
    expect(byRole['Java Developer'].ctc).toContain('5.6 LPA');
    expect(byRole['Full Stack Developer'].ctc).toContain('11.00');
    expect(byRole['Full Stack Developer'].ctc).toContain('26.00 LPA');
    expect(byRole['Front End Developer'].ctc).toContain('3.6');
    expect(byRole['Operations Executive'].ctc).toContain('3.0');
    expect(byRole['Business Development and Digital Marketing'].ctc).toContain('4.9 LPA');

    const roles = drive.positions.map((p) => p.role);
    expect(roles).not.toContain('Pre-Placement Talk (Seminar Hall)');
    expect(roles.some((r) => /round 1|machine test|^gd$/i.test(r))).toBe(false);

    // Per-role course eligibility ("M Tech/B Tech" spaced variants + BBA/MBA-only role)
    expect(byRole['Python Developer'].eligible_courses).toEqual(
      expect.arrayContaining(['B.Tech', 'M.Tech', 'MCA', 'BCA'])
    );
    expect(byRole['Business Development and Digital Marketing'].eligible_courses).toEqual(
      expect.arrayContaining(['BBA', 'MBA'])
    );
    expect(byRole['Business Development and Digital Marketing'].eligible_courses).not.toContain('B.Tech');

    // Only the pass-out batch — the 2026 drive-event year must not leak in
    for (const p of drive.positions) {
      expect(p.eligible_batches).toEqual([2027]);
      expect(p.location).toBe('Noida');
    }

    // "Apply link closes at 3.00 PM today" resolves against the received date
    expect(drive.deadline).toBe('2026-09-28T15:00:00.000Z');
    expect(drive.deadline_precision).toBe('EXACT_TIME');
    expect(drive.apply_url).toBe('https://forms.gle/tuqHeNstpuCC4CSw7');
    // No company website in this email — must not echo the apply/whatsapp links
    expect(drive.company_website).toBeNull();
    expect(drive.job_description_url).toBeNull();
    // Fresh parses carry the current parser version for stale-drive refresh
    expect(drive.parser_version).toBe(3);
  });

  it('Should never mistake selection-process steps for roles', () => {    const stepsOnly = {
      id: 'steps_only_001',
      subject: 'SAITM, T&P Cell: Prodesk IT - Selection process update',
      sender: 'Director tnp <directortnp@saitm.ac.in>',
      date: '2026-09-29T10:00:00.000Z',
      bodyHtml: `<div dir="ltr">Dear Students,<br><br>Prodesk IT – on Campus Drive.<br><br>Selection process:<ol><li>Pre-Placement Talk (Seminar Hall)</li><li>Round 1 (Part A): Online Test.</li><li>Final Round: HR Interviews.</li></ol><br>Job Location: Noida<br>Apply Link: https://forms.gle/xyz123</div>`,
    };
    const drive = parsePlacementEmail(stepsOnly);
    expect(drive).not.toBeNull();
    if (!drive) return;
    const roles = drive.positions.map((p) => p.role);
    expect(roles.some((r) => /pre-placement|round 1|hr interviews/i.test(r))).toBe(false);
  });

  it('Should capture non-Google-Form application links (ATS portals, shorteners)', () => {
    const supersetMail = {
      id: 'apply_superset_001',
      subject: 'Placement Opportunity | Acme Corp | Software Engineer | Batch 2027',
      sender: 'placements@saitm.ac.in',
      date: '2026-09-27T09:00:00.000Z',
      bodyText: `Dear Students,
Company: Acme Corp
Eligible Batches: 2027
Eligible Courses: B.Tech CSE, MCA
Location: Gurgaon
Deadline: 30 September 2026
Application Link: https://app.superset.io/company/acme-corp/apply/xyz
Company Website: https://acme-corp.example.com`,
    };
    const drive = parsePlacementEmail(supersetMail);
    expect(drive).not.toBeNull();
    if (!drive) return;
    expect(drive.apply_url).toBe('https://app.superset.io/company/acme-corp/apply/xyz');
    expect(drive.company_website).toBe('https://acme-corp.example.com');
  });

  it('Should capture "Register Here" anchors and label-next-line URLs', () => {
    const unstopMail = {
      id: 'apply_unstop_002',
      subject: 'Hackathon Opportunity | HackNight 2026 | Batch 2027',
      sender: 'placements@saitm.ac.in',
      date: '2026-09-27T09:00:00.000Z',
      bodyHtml: `<div dir="ltr">Dear Students,<br><br>HackNight 2026 Coding Challenge.<br><br>Eligible Batches: 2027<br><br><a href="https://unstop.com/hackathon/xyz">Register Here</a><br><br>Deadline: 30 September 2026</div>`,
    };
    const unstop = parsePlacementEmail(unstopMail);
    expect(unstop?.apply_url).toBe('https://unstop.com/hackathon/xyz');

    const nextLineMail = {
      id: 'apply_nextline_003',
      subject: 'Placement Opportunity | Beta Ltd | Analyst | Batch 2027',
      sender: 'placements@saitm.ac.in',
      date: '2026-09-27T09:00:00.000Z',
      bodyText: `Dear Students,
Company: Beta Ltd
Eligible Batches: 2027
Location: Noida
Deadline: 30 September 2026
Fill this form to apply:
https://bit.ly/beta-apply-2026`,
    };
    const nextLine = parsePlacementEmail(nextLineMail);
    expect(nextLine?.apply_url).toBe('https://bit.ly/beta-apply-2026');
  });

  it('Should still route Drive/Doc links to the JD slot, not the apply slot', () => {
    const drive = parsePlacementEmail(FIXTURE_75WAY);
    expect(drive?.job_description_url).toContain('drive.google.com');
    expect(drive?.apply_url).toContain('forms.gle');
  });
});

