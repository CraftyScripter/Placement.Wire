import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6 text-center text-[#323243]">
      <div className="rounded-lg border border-line bg-white p-4 shadow-card text-muted mb-6">
        <Compass className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-semibold tracking-tight text-[#323243] sm:text-5xl">404</h1>
      <h2 className="mt-2 text-xl font-semibold text-[#323243]">Page Not Found</h2>
      <p className="mt-3 max-w-md text-sm font-normal text-muted">
        The page you are looking for does not exist.
      </p>
      <div className="mt-8">
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-white shadow-sm hover:bg-primary-hover transition-colors duration-150"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
