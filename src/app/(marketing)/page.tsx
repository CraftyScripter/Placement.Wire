import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  HardDrive,
  ArrowRight,
  ArrowUpRight,
  Clock,
  BellRing,
  Search,
  Mail,
  FileCheck2,
  Lock,
  EyeOff,
  DatabaseZap,
  Inbox,
  ChevronDown,
} from 'lucide-react';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroActions } from '@/components/landing/HeroActions';

/**
 * Landing page — server-rendered static shell (zero JS) + two tiny client
 * islands (header, hero CTAs). Hero is Direction A: an honest email→tracker
 * transformation demo with real CRC data. No mesh gradients, no marquee,
 * no stats band, no browser mockup — none of the AI-template markers.
 * Glows are painted radial-gradients; zero blur() filters in scroll path.
 */

const STEPS = [
  {
    no: '01',
    icon: Mail,
    title: 'Connect your @saitm.ac.in Gmail',
    text: 'Sign in once with your college account. PlacementWire gets read-only access — it can never send, delete or touch anything else.',
  },
  {
    no: '02',
    icon: Search,
    title: 'Only CRC placement mail is read',
    text: 'Every search is hard-scoped to placement announcements from SAITM senders. Personal mail, OTPs and bank statements are never opened.',
  },
  {
    no: '03',
    icon: FileCheck2,
    title: 'Get a tracker that stays fresh',
    text: 'Company, CTC, roles, eligibility and deadlines land in your private dashboard — saved to placements.json inside your own Google Drive.',
  },
];

const FAQS = [
  {
    q: 'Can anyone else see my applications or notes?',
    a: 'No. There is no central database. Your statuses, stars and private notes live in PlacementWire_Data/placements.json inside your own Google Drive — no other student and no admin can open it.',
  },
  {
    q: 'Does it read my personal emails?',
    a: 'Never. Gmail queries are restricted to inbox mails sent by SAITM addresses about placements, drives, internships and hackathons. Everything else in your mailbox is untouched, and the app only asks for the gmail.readonly scope.',
  },
  {
    q: 'What happens if I revoke access?',
    a: 'Revoke Gmail/Drive access from your Google Account permissions page and delete the PlacementWire_Data folder — the service instantly loses all reach to your data.',
  },
  {
    q: 'Is this an official SAITM product?',
    a: 'No. PlacementWire is independent student software built for SAITM students. For official queries, always contact the CRC office — and verify deadlines against the original email before applying.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-base text-[#323243] dark:bg-[#0B0E14] dark:text-[#E2E4ED]">
      {/* Announcement bar */}
      <div className="border-b border-line bg-white px-4 py-2.5 text-center text-xs font-medium text-muted sm:text-sm dark:border-white/10 dark:bg-[#141824]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5">
          <span className="flex h-2 w-2 shrink-0 rounded-full bg-success" />
          <span>Campus Drives 2026 &amp; 2027 —</span>
          <span className="font-semibold text-[#323243] dark:text-[#E2E4ED]">
            exclusively for SAITM students (@saitm.ac.in)
          </span>
        </div>
      </div>

      <LandingHeader />

      {/* ============ HERO — email in, tracker out ============ */}
      <section className="relative border-b border-line dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
            {/* Left — the words */}
            <div className="max-w-xl">
              <p className="font-mono text-[13px] font-medium uppercase tracking-[0.18em] text-muted dark:text-[#94A3B8]">
                <span className="text-primary">SAITM CRC</span> → your tracker
              </p>
              <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Stop digging through Gmail for{' '}
                <span className="font-display font-medium italic text-primary">drive details.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg font-normal leading-relaxed text-muted sm:text-xl dark:text-[#94A3B8]">
                PlacementWire reads only CRC placement announcements from your college inbox and
                lays out company, CTC, eligibility and deadlines — saved to your own Google Drive.
              </p>

              <HeroActions />

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-muted dark:text-[#94A3B8]">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-4 w-4" /> @saitm.ac.in sign-in only
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <HardDrive className="h-4 w-4" /> File lives in your Drive
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <EyeOff className="h-4 w-4" /> No server database
                </span>
              </div>
            </div>

            {/* Right — the transformation demo */}
            <div className="relative" aria-label="How a CRC email becomes a tracker row">
              {/* Email panel */}
              <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card dark:border-white/10 dark:bg-[#141824]">
                <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.14em] text-muted dark:border-white/10 dark:text-[#94A3B8]">
                  <Inbox className="h-4 w-4 text-primary" />
                  Inbox — 1 unread
                </div>
                <div className="space-y-1.5 p-4 font-mono text-[13px] leading-relaxed sm:text-sm">
                  <p className="truncate">
                    <span className="text-muted dark:text-[#94A3B8]">From: </span>
                    crc@saitm.ac.in
                  </p>
                  <p className="truncate">
                    <span className="text-muted dark:text-[#94A3B8]">Subject: </span>
                    Campus Drive — RGF India (Associate Consultant)
                  </p>
                  <p className="pt-1.5 font-sans text-sm font-normal leading-relaxed text-muted sm:text-[15px] dark:text-[#94A3B8]">
                    Greetings students,{' '}
                    <mark className="rounded-[3px] bg-accent/45 px-1 text-inherit">RGF India</mark>{' '}
                    is hiring{' '}
                    <mark className="rounded-[3px] bg-accent/45 px-1 text-inherit">
                      Associate Consultants
                    </mark>{' '}
                    at Gurgaon. Apply before{' '}
                    <mark className="rounded-[3px] bg-accent/45 px-1 text-inherit">28 Sept</mark> via
                    the form link…
                  </p>
                </div>
              </div>

              {/* Connector — quiet hairline, not another colored element */}
              <div className="flex items-center gap-3 py-3" aria-hidden="true">
                <span className="h-px flex-1 bg-line dark:bg-white/10" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted dark:text-[#94A3B8]">
                  parsed in seconds
                </span>
                <span className="h-px flex-1 bg-line dark:bg-white/10" />
              </div>

              {/* Tracker row */}
              <div className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5 dark:border-white/10 dark:bg-[#141824]">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-lg font-semibold text-primary dark:bg-primary/20">
                    R
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold">RGF India</p>
                      <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary dark:bg-primary/20">
                        NEW
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm font-normal text-muted dark:text-[#94A3B8]">
                      Associate Consultant • Gurgaon • B.Tech
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-error-soft px-3 py-1.5 text-[13px] font-semibold text-error">
                    <Clock className="h-3.5 w-3.5" /> 2 days left
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Honest ticker — static hairline strip, no animation */}
          <div className="mt-12 flex flex-col gap-2 border-t border-line pt-5 font-mono text-xs tracking-wide text-muted sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:text-[#94A3B8]">
            <p>
              Parsed from real CRC announcements — RGF India · 75WAY Technologies · BriBooks
            </p>
            <p className="shrink-0 uppercase">gmail.readonly / drive.file</p>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-[13px] font-medium uppercase tracking-[0.18em] text-primary">How it works</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Three steps. <span className="font-display font-medium italic text-muted">Nothing to learn.</span>
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
          {STEPS.map((s) => (
            <div
              key={s.no}
              className="contain-card group relative overflow-hidden rounded-2xl border border-line bg-white p-7 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-pop sm:p-8 dark:border-white/10 dark:bg-[#141824]"
            >
              <span className="pointer-events-none absolute -right-2 -top-5 font-display text-[96px] font-semibold italic leading-none text-primary/10 transition-colors group-hover:text-primary/20">
                {s.no}
              </span>
              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-canvas text-primary dark:border-white/10 dark:bg-[#0B0E14]">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2.5 text-[15px] font-normal leading-relaxed text-muted dark:text-[#94A3B8]">
                  {s.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ DEADLINE / TRACKING BAND ============ */}
      <section className="cv-auto border-y border-line bg-white dark:border-white/10 dark:bg-[#141824]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <p className="font-mono text-[13px] font-medium uppercase tracking-[0.18em] text-primary">Never miss a form</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Deadlines that tap you on the shoulder.
            </h2>
            <p className="mt-4 max-w-lg text-base font-normal leading-relaxed text-muted sm:text-lg dark:text-[#94A3B8]">
              Every drive carries a live countdown. Expiring forms surface first, applied ones settle
              into your timeline — so the “last date kab thi?” panic ends here.
            </p>
            <ul className="mt-7 space-y-3.5">
              {[
                { icon: BellRing, text: 'Urgent & expiring alerts before forms close' },
                { icon: DatabaseZap, text: 'Kanban + list views with instant search' },
                { icon: ArrowUpRight, text: 'Apply buttons open the official form directly' },
              ].map((f) => (
                <li key={f.text} className="flex items-start gap-3 text-[15px] font-medium sm:text-base">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary dark:bg-primary/20">
                    <f.icon className="h-5 w-5" />
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-8 inline-flex h-14 items-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-white shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-95"
            >
              Start tracking free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="relative">
            <div className="track-glow absolute -inset-4 rounded-3xl" aria-hidden="true" />
            <div className="relative space-y-4 rounded-2xl border border-line bg-canvas p-5 shadow-card sm:p-7 dark:border-white/10 dark:bg-[#0B0E14]">
              <div className="contain-card flex items-center justify-between rounded-xl border border-error/25 bg-white px-5 py-4 dark:border-error/30 dark:bg-[#141824]">
                <div>
                  <p className="text-base font-semibold">RGF India — Associate Consultant</p>
                  <p className="mt-0.5 text-sm font-normal text-muted dark:text-[#94A3B8]">
                    Application form closes soon
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-error-soft px-3 py-1.5 text-sm font-semibold text-error">
                  <Clock className="h-4 w-4" /> 2 days left
                </span>
              </div>
              <div className="contain-card flex items-center justify-between rounded-xl border border-line bg-white px-5 py-4 dark:border-white/10 dark:bg-[#141824]">
                <div>
                  <p className="text-base font-semibold">75WAY — SDE (Level I)</p>
                  <p className="mt-0.5 text-sm font-normal text-muted dark:text-[#94A3B8]">
                    Applied on 21 Sept • Mohali
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success-soft px-3 py-1.5 text-sm font-semibold text-success">
                  <FileCheck2 className="h-4 w-4" /> Applied
                </span>
              </div>
              <div className="contain-card flex items-center justify-between rounded-xl border border-line bg-white px-5 py-4 dark:border-white/10 dark:bg-[#141824]">
                <div>
                  <p className="text-base font-semibold">BriBooks — 4 profiles</p>
                  <p className="mt-0.5 text-sm font-normal text-muted dark:text-[#94A3B8]">
                    Python Dev, Design, Outreach
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-semibold text-accent">
                  Round 1 cleared
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRIVACY (dark) ============ */}
      <section className="cv-auto bg-[#17171F] text-white dark:bg-black/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <p className="font-mono text-[13px] font-medium uppercase tracking-[0.18em] text-accent">Private by architecture</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Your mail never leaves{' '}
                <span className="font-display font-medium italic text-accent">your hands.</span>
              </h2>
              <p className="mt-5 max-w-lg text-base font-normal leading-relaxed text-white/70 sm:text-lg">
                This isn’t a policy promise — it’s how the system is built. No database to breach, no
                admin panel peeking at your inbox, no ads, no trackers.
              </p>
              <Link
                href="/privacy"
                className="mt-8 inline-flex h-14 items-center gap-2 rounded-xl border border-white/20 px-7 text-base font-semibold text-white transition-colors duration-150 hover:border-accent hover:text-accent"
              >
                Read the privacy policy
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
            <ul className="space-y-4">
              {[
                { title: 'Read-only Gmail scope', text: 'The app physically cannot send, delete or modify any email — only read placement announcements.' },
                { title: 'Drive.file scope only', text: 'It sees solely the files it created itself (placements.json). The rest of your Drive is invisible to it.' },
                { title: 'Encrypted session cookies', text: 'Google tokens stay server-side in AES-256-GCM cookies. The browser bundle never sees a single token.' },
                { title: 'College-domain gate', text: 'Only verified @saitm.ac.in accounts get in. Everything else is rejected at the server door.' },
              ].map((c) => (
                <li key={c.title} className="contain-card flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/20 text-success">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-base font-semibold sm:text-lg">{c.title}</span>
                    <span className="mt-1 block text-[15px] font-normal leading-relaxed text-white/65">
                      {c.text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="cv-auto mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <p className="font-mono text-[13px] font-medium uppercase tracking-[0.18em] text-primary">Questions</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Asked by every SAITM student, <span className="font-display font-medium italic text-muted">answered once.</span>
          </h2>
        </div>
        <div className="mt-10 space-y-3.5">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="contain-card group rounded-2xl border border-line bg-white shadow-card open:shadow-pop dark:border-white/10 dark:bg-[#141824]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold marker:hidden sm:text-lg [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="px-6 pb-6 text-[15px] font-normal leading-relaxed text-muted sm:text-base dark:text-[#94A3B8]">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="cv-auto mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <div className="cta-light relative overflow-hidden rounded-3xl border border-line bg-white px-6 py-14 text-center shadow-pop sm:px-12 sm:py-20 dark:border-white/10 dark:bg-[#141824]">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="bg-grid absolute inset-0 opacity-60" />
          </div>
          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-pop">
              <ArrowRight className="h-7 w-7" />
            </div>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Stop scrolling Gmail.{' '}
              <span className="font-display font-medium italic text-primary">Start getting placed.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-normal leading-relaxed text-muted sm:text-lg dark:text-[#94A3B8]">
              One sign-in with your college account — your drives, deadlines and applications,
              organized tonight itself.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-white shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-95 sm:w-auto"
              >
                Connect College Gmail
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-line bg-white px-8 text-base font-semibold shadow-card transition-colors duration-150 hover:border-primary hover:text-primary sm:w-auto dark:border-white/10 dark:bg-[#0B0E14] dark:hover:border-primary"
              >
                How it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
