import type { Metadata } from 'next';
import { Github, Linkedin, Mail, Phone, MapPin, Code2, GraduationCap, ShieldCheck } from 'lucide-react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { site } from '@/config/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'PlacementWire is an independent student-built placement tracker for SAITM students, designed and built by Anuj Kumar. Learn the story, privacy model and how it works.',
  alternates: { canonical: '/about' },
};

const HIGHLIGHTS = [
  {
    icon: GraduationCap,
    title: 'Built for SAITM students',
    text: 'Placement, internship, hackathon and training announcements from CRC mail — organized in one private tracker.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    text: 'No central database. Your drives, notes and statuses live only in your own Google Drive file.',
  },
  {
    icon: Code2,
    title: 'Independent student software',
    text: 'Designed, coded and maintained by a SAITM student — not an official institute product.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-canvas text-[#323243]">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">About</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#323243] sm:text-5xl">
          Placement emails, <span className="font-display font-medium italic text-primary">finally organized.</span>
        </h1>
        <p className="mt-5 max-w-3xl text-base font-normal leading-relaxed text-muted sm:text-lg">
          {site.description} PlacementWire reads only placement announcements from your college Gmail —
          personal emails are never opened or stored.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 md:grid-cols-3 lg:gap-5">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-canvas text-primary">
                <h.icon className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-[#323243]">{h.title}</h2>
              <p className="mt-2 text-[15px] font-normal leading-relaxed text-muted">{h.text}</p>
            </div>
          ))}
        </div>

        {/* Creator card */}
        <section className="mt-8 rounded-lg border border-line bg-white p-4 shadow-card sm:p-6" aria-label="About the creator">
          <p className="text-xs font-normal uppercase tracking-wider text-muted">Created by</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-xl font-semibold text-primary">
              A
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-[#323243]">{site.creator.name}</h2>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-normal text-muted">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> SAITM, Gurgaon
                </span>
                <span aria-hidden="true">•</span>
                <span>Student Developer</span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={site.creator.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-white px-4 text-xs font-medium text-[#323243] shadow-sm transition-colors duration-150 hover:bg-canvas hover:border-primary hover:text-primary"
              >
                <Github className="h-3.5 w-3.5" /> GitHub
              </a>
              <a
                href={site.creator.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-xs font-medium text-white shadow-sm transition-colors duration-150 hover:bg-primary-hover"
              >
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn
              </a>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 text-xs min-[480px]:grid-cols-2">
            <a
              href={`mailto:${site.creator.email}`}
              className="flex items-center gap-2 rounded-md border border-line bg-white p-3 text-muted transition-colors duration-150 hover:border-primary hover:text-primary"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate font-normal">{site.creator.email}</span>
            </a>
            <a
              href={`tel:${site.creator.phone.replace(/[^+\d]/g, '')}`}
              className="flex items-center gap-2 rounded-md border border-line bg-white p-3 text-muted transition-colors duration-150 hover:border-primary hover:text-primary"
            >
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <span className="font-normal">{site.creator.phone}</span>
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
