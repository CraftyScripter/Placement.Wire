import type { Metadata } from 'next';
import { Mail, Phone } from 'lucide-react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { ContactForm } from '@/components/contact/ContactForm';
import { site } from '@/config/site';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact the PlacementWire team — report an issue, request a feature or ask a question. Built by Anuj Kumar for SAITM students.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Contact Us</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Let&apos;s talk.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
          Found a bug, want a feature, or just saying hi? Fill the form — your message reaches the
          developer directly.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <ContactForm />
          </div>

          <aside className="space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-sm font-bold text-white">Direct contact</h2>
              <p className="mt-1 text-[11px] text-slate-500">Prefer email or phone?</p>
              <div className="mt-3 space-y-2 text-xs">
                <a
                  href={`mailto:${site.creator.email}`}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-slate-300 transition-colors duration-150 hover:border-indigo-500/40 hover:text-white"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                  <span className="truncate">{site.creator.email}</span>
                </a>
                <a
                  href={`tel:${site.creator.phone.replace(/[^+\d]/g, '')}`}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-slate-300 transition-colors duration-150 hover:border-indigo-500/40 hover:text-white"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                  <span>{site.creator.phone}</span>
                </a>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 text-[11px] leading-relaxed text-slate-500">
              PlacementWire is independent student software. For official placement queries, please
              contact the SAITM CRC office directly.
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
