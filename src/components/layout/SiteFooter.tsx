import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';
import { site } from '@/config/site';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="border-t border-line bg-white px-6 py-10 text-sm text-muted dark:border-white/10 dark:bg-[#141824]">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/icon_light.png"
              alt="PlacementWire Logo"
              width={26}
              height={34}
              className="h-6 w-auto object-contain dark:hidden"
            />
            <Image
              src="/icon_dark.png"
              alt="PlacementWire Logo"
              width={26}
              height={34}
              className="hidden h-6 w-auto object-contain dark:block"
            />
            <div>
              <span className="font-semibold text-[#323243] dark:text-[#E2E4ED]">
                Placement<span className="text-primary">Wire</span>
              </span>
              <p className="mt-0.5 text-xs text-muted">
                For students of St. Andrews Institute of Technology & Management.
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold" aria-label="Footer">
            <Link href="/about" className="text-[#323243] transition-colors duration-150 hover:text-primary dark:text-[#E2E4ED] dark:hover:text-primary">
              About
            </Link>
            <Link href="/contact" className="text-[#323243] transition-colors duration-150 hover:text-primary dark:text-[#E2E4ED] dark:hover:text-primary">
              Contact Us
            </Link>
            <Link href="/terms" className="text-[#323243] transition-colors duration-150 hover:text-primary dark:text-[#E2E4ED] dark:hover:text-primary">
              Terms
            </Link>
            <Link href="/privacy" className="text-[#323243] transition-colors duration-150 hover:text-primary dark:text-[#E2E4ED] dark:hover:text-primary">
              Privacy Policy
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={site.creator.github}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-line bg-white p-2 text-muted transition-colors duration-150 hover:border-primary hover:text-primary dark:border-white/10 dark:bg-[#0B0E14] dark:text-[#94A3B8] dark:hover:text-[#E2E4ED]"
              title="GitHub — CraftyScripter"
              aria-label="GitHub profile of Anuj Kumar"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href={site.creator.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-line bg-white p-2 text-muted transition-colors duration-150 hover:border-primary hover:text-primary dark:border-white/10 dark:bg-[#0B0E14] dark:text-[#94A3B8] dark:hover:text-[#E2E4ED]"
              title="LinkedIn — Anuj Kumar"
              aria-label="LinkedIn profile of Anuj Kumar"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${site.creator.email}`}
              className="rounded-md border border-line bg-white p-2 text-muted transition-colors duration-150 hover:border-primary hover:text-primary dark:border-white/10 dark:bg-[#0B0E14] dark:text-[#94A3B8] dark:hover:text-[#E2E4ED]"
              title={site.creator.email}
              aria-label="Email Anuj Kumar"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-line dark:border-white/10 pt-5 text-xs text-muted dark:text-[#94A3B8] sm:flex-row">
          <p>© {new Date().getFullYear()} PlacementWire. Independent student software for SAITM Gurgaon.</p>
          <p>
            Designed & built by{' '}
            <a
              href={site.creator.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-normal text-primary transition-colors duration-150 hover:text-accent"
            >
              {site.creator.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
