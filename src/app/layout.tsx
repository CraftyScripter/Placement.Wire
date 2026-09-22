import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { site } from '@/config/site';
import { env } from '@/config/env';
import { AnalyticsBeacon } from '@/components/analytics/AnalyticsBeacon';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

const APP_URL = env.APP_URL;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'PlacementWire — Your Placement Emails. Organized.',
    template: '%s | PlacementWire',
  },
  description: site.description,
  keywords: [
    'PlacementWire',
    'SAITM placements',
    'campus drives',
    'placement tracker',
    'SAITM Gurgaon',
    'internship tracker',
    'CRC emails',
    'college placements',
  ],
  authors: [{ name: site.creator.name, url: site.creator.github }],
  creator: site.creator.name,
  publisher: 'PlacementWire',
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'PlacementWire',
    title: 'PlacementWire — Your Placement Emails. Organized.',
    description: site.description,
    images: [{ url: '/icon_dark.png', width: 512, height: 512, alt: 'PlacementWire' }],
  },
  twitter: {
    card: 'summary',
    title: 'PlacementWire — Your Placement Emails. Organized.',
    description: site.description,
    images: ['/icon_dark.png'],
  },
  icons: {
    icon: '/icon_dark.png',
    apple: '/icon_dark.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-[#0a0c10] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 antialiased">
        <AnalyticsBeacon />
        {children}
      </body>
    </html>
  );
}
