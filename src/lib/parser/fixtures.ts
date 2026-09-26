import { RawEmailInput, parsePlacementEmail } from './email-parser';
import { PlacementDrive } from '@/schemas/placement.schema';

export const FIXTURE_RGF_INDIA: RawEmailInput = {
  id: 'msg_rgf_india_2026_001',
  threadId: 'thread_rgf_india_001',
  subject: 'Final Placement Opportunity | RGF India | Associate Consultant | Batch 2026 & 2027',
  sender: 'Corporate Resource Center <placements@saitm.ac.in>',
  date: '2026-09-18T10:30:00.000Z',
  bodyHtml: `
    <div style="font-family: Arial, sans-serif;">
      <p>Dear Students,</p>
      <p>Greetings from the Corporate Resource Center!</p>
      <p>We are pleased to announce a <strong>Final Placement Opportunity</strong> with <strong>RGF India</strong> for Batch 2026 & 2027.</p>
      <p><strong>Company:</strong> RGF India</p>
      <p><strong>Job Profile:</strong> Associate Consultant</p>
      <p><strong>Job Location:</strong> Gurgaon</p>
      <p><strong>Eligible Courses:</strong> B.Tech CSE, CST, AIML, DS, MBA</p>
      <p><strong>Eligible Batches:</strong> 2026, 2027</p>
      <p><strong>Deadline:</strong> 22 September 2026</p>
      <p><strong>Company Website:</strong> <a href="http://www.rgf-professional.com/">http://www.rgf-professional.com/</a></p>
      <p><strong>Job Description:</strong> <a href="https://drive.google.com/drive/folders/1Ul3mWFuy5R_JvRl_lpVtEf8MeGMWS7uj?usp=drive_link">View JD on Drive</a></p>
      <p><strong>Registration Link:</strong> <a href="https://forms.gle/f8MLjTmvvt9C8tPm7">Apply Now via Google Form</a></p>
    </div>
  `,
  bodyText: `
    Final Placement Opportunity | RGF India | Associate Consultant | Batch 2026 & 2027
    Company: RGF India
    Job Profile: Associate Consultant
    Location: Gurgaon
    Eligible Courses: B.Tech CSE, CST, AIML, DS, MBA
    Eligible Batches: 2026, 2027
    Deadline: 22 September 2026
    Company Website: http://www.rgf-professional.com/
    Job Description: https://drive.google.com/drive/folders/1Ul3mWFuy5R_JvRl_lpVtEf8MeGMWS7uj?usp=drive_link
    Registration Link: https://forms.gle/f8MLjTmvvt9C8tPm7
  `,
};

export const FIXTURE_75WAY: RawEmailInput = {
  id: 'msg_75way_tech_2026_002',
  threadId: 'thread_75way_002',
  subject: 'Placement Opportunity | 75WAY Technologies Pvt. Ltd. | Internship with PPO | B.Tech & MCA | 2026 & 2027 Batch',
  sender: 'Training and Placement Cell <placements@saitm.ac.in>',
  date: '2026-09-19T14:15:00.000Z',
  bodyHtml: `
    <div>
      <p>Dear Students,</p>
      <p>Please find the placement opportunity details below for <strong>75WAY Technologies Pvt. Ltd.</strong></p>
      <p><strong>Drive Type:</strong> Internship with PPO Offer</p>
      <p><strong>Package:</strong> ₹4.00 LPA – ₹5.40 LPA</p>
      <p><strong>Location:</strong> Mohali</p>
      <p><strong>Profiles:</strong></p>
      <ul>
        <li>Associate Software Developer</li>
        <li>Software Development Engineer (Level I)</li>
      </ul>
      <p><strong>Eligible Courses:</strong> B.Tech CSE, CST, AIML, DS, MCA</p>
      <p><strong>Eligible Batches:</strong> 2026, 2027</p>
      <p><strong>Deadline:</strong> 23 September 2026</p>
      <p><strong>Company Website:</strong> <a href="https://75way.com">https://75way.com</a></p>
      <p><strong>Job Description:</strong> <a href="https://drive.google.com/drive/folders/1RnVMCPABzOMX4EtOsMlfPNrdPlrLWxPD?usp=drive_link">Drive Folder</a></p>
      <p><strong>Apply Link:</strong> <a href="https://forms.gle/f8MLjTmvvt9C8tPm7">Application Form</a></p>
    </div>
  `,
  bodyText: `
    Placement Opportunity | 75WAY Technologies Pvt. Ltd. | Internship with PPO | B.Tech & MCA | 2026 & 2027 Batch
    Drive Type: Internship with PPO Offer
    Package: ₹4.00 LPA – ₹5.40 LPA
    Location: Mohali
    Profiles:
    • Associate Software Developer
    • Software Development Engineer (Level I)
    Eligible Courses: B.Tech CSE, CST, AIML, DS, MCA
    Eligible Batches: 2026, 2027
    Deadline: 23 September 2026
    Company Website: https://75way.com
    Job Description: https://drive.google.com/drive/folders/1RnVMCPABzOMX4EtOsMlfPNrdPlrLWxPD?usp=drive_link
    Registration Link: https://forms.gle/f8MLjTmvvt9C8tPm7
  `,
};

export const FIXTURE_BRIBOOKS: RawEmailInput = {
  id: 'msg_bribooks_2026_003',
  threadId: 'thread_bribooks_003',
  subject: 'Placement Opportunity | BriBooks | Internship with PPO | Batch 2026 & 2027',
  sender: 'CRC SAITM <placements@saitm.ac.in>',
  date: '2026-09-20T09:00:00.000Z',
  bodyHtml: `
    <div>
      <p>Dear All,</p>
      <p>BriBooks is hiring interns with PPO offer for SAITM students.</p>
      <p><strong>Company:</strong> BriBooks</p>
      <p><strong>Drive Type:</strong> Internship with PPO Offer</p>
      <p><strong>Location:</strong> Gurgaon</p>
      <p><strong>Profiles:</strong></p>
      <ul>
        <li>Graphic Designer Intern</li>
        <li>Python Developer Intern</li>
        <li>Relations & Outreach</li>
        <li>Business Development Executive</li>
      </ul>
      <p><strong>Eligible Courses:</strong> B.Tech CSE, CST, AIML, DS, BCA, BBA, MBA, MCA</p>
      <p><strong>Eligible Batches:</strong> 2026, 2027</p>
      <p><strong>Deadline:</strong> 22 September 2026</p>
      <p><strong>Company Website:</strong> <a href="http://www.bribooks.com/">http://www.bribooks.com/</a></p>
      <p><strong>Job Description:</strong> <a href="https://docs.google.com/document/d/1mBw8UtEx8of-Bk1cHikstHX7-MmGqIpY3gbMQ8ChkXo/edit?usp=drive_link">Google Doc JD</a></p>
      <p><strong>Apply Link:</strong> <a href="https://forms.gle/f8MLjTmvvt9C8tPm7">Google Form Link</a></p>
    </div>
  `,
  bodyText: `
    Placement Opportunity | BriBooks | Internship with PPO | Batch 2026 & 2027
    Company: BriBooks
    Drive Type: Internship with PPO Offer
    Location: Gurgaon
    Profiles:
    • Graphic Designer Intern
    • Python Developer Intern
    • Relations & Outreach
    • Business Development Executive
    Eligible Courses: B.Tech CSE, CST, AIML, DS, BCA, BBA, MBA, MCA
    Eligible Batches: 2026, 2027
    Deadline: 22 September 2026
    Company Website: http://www.bribooks.com/
    Job Description: https://docs.google.com/document/d/1mBw8UtEx8of-Bk1cHikstHX7-MmGqIpY3gbMQ8ChkXo/edit?usp=drive_link
    Registration Link: https://forms.gle/f8MLjTmvvt9C8tPm7
  `,
};

export function getSamplePlacementDrives(): PlacementDrive[] {
  const rgf = parsePlacementEmail(FIXTURE_RGF_INDIA)!;
  const seventyFive = parsePlacementEmail(FIXTURE_75WAY)!;
  const bri = parsePlacementEmail(FIXTURE_BRIBOOKS)!;

  // Add subtle demo state differences for rich initial dashboard
  rgf.status = 'NEW';
  rgf.starred = true;

  seventyFive.status = 'APPLIED';
  seventyFive.user_notes = 'Applied via Google Forms on 21st Sept. Submitted resume v2.';

  bri.status = 'INTERVIEW_SCHEDULED';
  bri.user_notes = 'Round 1 technical assessment cleared. Interview scheduled for Thursday.';

  return [rgf, seventyFive, bri];
}
