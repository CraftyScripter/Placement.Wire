import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'PlacementWire — Your Placement Emails. Organized.',
  description:
    'Smart placement email management and drive-tracking platform designed exclusively for students of St. Andrews Institute of Technology and Management (SAITM).',
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
        {children}
      </body>
    </html>
  );
}
