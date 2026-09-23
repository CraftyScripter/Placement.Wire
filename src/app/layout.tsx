import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { site } from '@/config/site';
import { env } from '@/config/env';
import { AnalyticsBeacon } from '@/components/analytics/AnalyticsBeacon';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
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
    images: [{ url: '/icon_light.png', width: 512, height: 512, alt: 'PlacementWire' }],
  },
  twitter: {
    card: 'summary',
    title: 'PlacementWire — Your Placement Emails. Organized.',
    description: site.description,
    images: ['/icon_light.png'],
  },
  icons: {
    icon: '/icon_light.png',
    apple: '/icon_light.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('pw_theme');
                  var m = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (t === 'dark' || ((!t || t === 'system') && m)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-canvas font-sans text-inktext antialiased selection:bg-primary/20 dark:bg-[#0B0E14] dark:text-[#E2E4ED]">
        <AnalyticsBeacon />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
