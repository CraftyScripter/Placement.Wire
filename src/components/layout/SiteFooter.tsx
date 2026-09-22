import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';
import { site } from '@/config/site';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="border-t border-white/10 px-4 sm:px-6 py-8 text-xs text-slate-500">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/icon_dark.png"
              alt="PlacementWire Logo"
              width={26}
              height={34}
              className="h-6 w-auto object-contain"
            />
            <div>
              <span className="font-bold text-white">
                Placement<span className="text-indigo-400">Wire</span>
              </span>
              <p className="mt-0.5 text-[11px]">
                For students of St. Andrews Institute of Technology & Management.
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium" aria-label="Footer">
            <Link href="/about" className="hover:text-white transition-colors duration-150">
              About
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors duration-150">
              Contact Us
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors duration-150">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors duration-150">
              Privacy Policy
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={site.creator.github}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 p-2 text-slate-400 transition-colors duration-150 hover:bg-white/5 hover:text-white"
              title="GitHub — CraftyScripter"
              aria-label="GitHub profile of Anuj Kumar"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href={site.creator.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 p-2 text-slate-400 transition-colors duration-150 hover:bg-white/5 hover:text-white"
              title="LinkedIn — Anuj Kumar"
              aria-label="LinkedIn profile of Anuj Kumar"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${site.creator.email}`}
              className="rounded-lg border border-white/10 p-2 text-slate-400 transition-colors duration-150 hover:bg-white/5 hover:text-white"
              title={site.creator.email}
              aria-label="Email Anuj Kumar"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-5 text-[11px] sm:flex-row">
          <p>© {new Date().getFullYear()} PlacementWire. Independent student software for SAITM Gurgaon.</p>
          <p>
            Designed & built by{' '}
            <a
              href={site.creator.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors duration-150"
            >
              {site.creator.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
