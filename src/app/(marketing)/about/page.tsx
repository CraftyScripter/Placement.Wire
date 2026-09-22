import type { Metadata } from 'next';
import { Github, Linkedin, Mail, Phone, MapPin, Code2, GraduationCap, ShieldCheck } from 'lucide-react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { site } from '@/config/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'PlacementWire is an independent student-built placement tracker for SAITM students, designed and built by Anuj Kumar. Learn the story, privacy model and how it works.',
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
    <div className="min-h-screen bg-[#0a0c10] text-slate-100">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">About</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Placement emails, finally organized.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
          {site.description} PlacementWire reads only placement announcements from your college Gmail —
          personal emails are never opened or stored.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:gap-4 min-[560px]:grid-cols-2 md:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300">
                <h.icon className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-white">{h.title}</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{h.text}</p>
            </div>
          ))}
        </div>

        {/* Creator card */}
        <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.03] p-5 sm:p-6" aria-label="About the creator">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Created by</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 text-xl font-extrabold text-indigo-300">
              A
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-white">{site.creator.name}</h2>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-200 transition-colors duration-150 hover:bg-white/[0.05] hover:text-white"
              >
                <Github className="h-3.5 w-3.5" /> GitHub
              </a>
              <a
                href={site.creator.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-indigo-500"
              >
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn
              </a>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 text-xs min-[480px]:grid-cols-2">
            <a
              href={`mailto:${site.creator.email}`}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-slate-300 transition-colors duration-150 hover:border-indigo-500/40 hover:text-white"
            >
              <Mail className="h-4 w-4 shrink-0 text-indigo-400" />
              <span className="truncate">{site.creator.email}</span>
            </a>
            <a
              href={`tel:${site.creator.phone.replace(/[^+\d]/g, '')}`}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-slate-300 transition-colors duration-150 hover:border-indigo-500/40 hover:text-white"
            >
              <Phone className="h-4 w-4 shrink-0 text-indigo-400" />
              <span>{site.creator.phone}</span>
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
