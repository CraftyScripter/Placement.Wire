import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'PlacementWire privacy policy — what data is accessed (Gmail, Drive), what is stored, and what is never collected.',
  alternates: { canonical: '/privacy' },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7 rounded-lg border border-line bg-white p-4 shadow-card">
      <h2 className="text-base font-semibold text-[#323243] sm:text-lg">{title}</h2>
      <div className="mt-2 space-y-2.5 text-xs font-normal leading-relaxed text-muted sm:text-sm">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-canvas text-[#323243]">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <p className="text-xs font-normal uppercase tracking-wider text-primary">Legal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#323243] sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-xs font-normal text-muted">Last updated: September 2026</p>

        <Section title="1. The short version">
          <p>
            PlacementWire reads <strong className="font-semibold text-[#323243]">only placement announcement emails</strong> from
            your college Gmail, stores the organized tracker in{' '}
            <strong className="font-semibold text-[#323243]">your own Google Drive</strong>, and keeps{' '}
            <strong className="font-semibold text-[#323243]">no central database</strong>. Your personal emails are
            never opened, indexed or stored.
          </p>
        </Section>

        <Section title="2. Data we access">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="font-semibold text-[#323243]">Gmail (read-only):</strong> only messages matching
              placement-announcement queries from CRC senders. Personal mail is excluded by the
              search query itself.
            </li>
            <li>
              <strong className="font-semibold text-[#323243]">Google Drive (app file):</strong> one JSON file
              (<code className="rounded border border-line bg-canvas px-1 py-0.5 text-[#323243]">PlacementWire_Data/placements.json</code>)
              holding your drives, statuses, stars and private notes.
            </li>
            <li>
              <strong className="font-semibold text-[#323243]">Basic profile:</strong> name, email and avatar from
              Google sign-in, used only to run your session.
            </li>
          </ul>
        </Section>

        <Section title="3. Data we never collect">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Contents of personal (non-placement) emails.</li>
            <li>Passwords or full mailbox copies.</li>
            <li>Location, contacts or device data.</li>
            <li>Anything sold to advertisers — there are no ads and no trackers.</li>
          </ul>
        </Section>

        <Section title="4. Where your data lives">
          <p>
            On Google&apos;s servers (your Gmail and Drive) and in your own browser&apos;s local
            storage (cache for offline speed). PlacementWire&apos;s servers hold no placement database —
            session cookies only, used to keep you signed in.
          </p>
        </Section>

        <Section title="5. Contact form">
          <p>
            Messages sent via the Contact Us page (name, email, phone, message) are forwarded to the
            developer&apos;s form inbox so your query can be answered. They are not used for marketing.
          </p>
        </Section>

        <Section title="6. Your control">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Revoke Gmail/Drive access anytime from your Google Account permissions page.</li>
            <li>Delete the <code className="rounded border border-line bg-canvas px-1 py-0.5 text-[#323243]">PlacementWire_Data</code> folder to erase your tracker.</li>
            <li>Clear browser site data to remove the local cache.</li>
          </ul>
        </Section>

        <Section title="7. Contact">
          <p>
            Privacy questions? Use the{' '}
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
