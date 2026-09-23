import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'PlacementWire terms of service — eligibility, acceptable use, data ownership and disclaimers for SAITM students.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7 rounded-lg border border-line bg-white p-4 shadow-card">
      <h2 className="text-base font-semibold text-[#323243] sm:text-lg">{title}</h2>
      <div className="mt-2 space-y-2.5 text-xs font-normal leading-relaxed text-muted sm:text-sm">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-canvas text-[#323243]">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <p className="text-xs font-normal uppercase tracking-wider text-primary">Legal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#323243] sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-xs font-normal text-muted">Last updated: September 2026</p>

        <Section title="1. What PlacementWire is">
          <p>
            PlacementWire is independent student software built for students of St. Andrews Institute
            of Technology and Management (SAITM), Gurgaon. It is <strong className="font-semibold text-[#323243]">not</strong> an
            official product of the institute. It organizes placement announcements found in your own
            college Gmail mailbox and stores the resulting tracker in your own Google Drive.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            Only students with an active <strong className="font-semibold text-[#323243]">@saitm.ac.in</strong> Google
            account may sign in. Accounts from any other domain are rejected at login.
          </p>
        </Section>

        <Section title="3. Acceptable use">
          <p>You agree to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Use PlacementWire only for your own genuine placement tracking.</li>
            <li>Not attempt to access other users&apos; data, sessions or Google accounts.</li>
            <li>Not abuse, scrape or disrupt the service or its connected Google APIs.</li>
            <li>Provide accurate information when contacting the developer.</li>
          </ul>
        </Section>

        <Section title="4. Your data stays yours">
          <p>
            Placement records, notes and statuses are written to a file
            (<code className="rounded border border-line bg-canvas px-1 py-0.5 text-[#323243]">PlacementWire_Data/placements.json</code>)
            inside <strong className="font-semibold text-[#323243]">your own Google Drive</strong>. PlacementWire operates
            no central database. Revoking Google access or deleting the Drive file removes your data
            from the service&apos;s reach.
          </p>
        </Section>

        <Section title="5. Accuracy disclaimer">
          <p>
            Company details, CTC figures, roles and deadlines are extracted automatically from emails
            and may contain errors. Always verify critical details (deadlines, eligibility, application
            links) against the original email or the official CRC announcement before applying.
            PlacementWire is not responsible for missed applications or opportunities.
          </p>
        </Section>

        <Section title="6. Availability">
          <p>
            The service is provided &ldquo;as is&rdquo;, without warranties of any kind. It may be
            modified, suspended or discontinued at any time. Gmail and Drive functionality depends on
            Google&apos;s APIs and your granted permissions.
          </p>
        </Section>

        <Section title="7. Contact">
          <p>
            Questions about these terms? Reach out via the{' '}
            <a href="/contact" className="font-normal text-primary hover:text-accent">
              Contact Us
            </a>{' '}
            page.
          </p>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
