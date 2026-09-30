'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-6 text-center text-[#323243]">
      <div className="rounded-lg border border-error/30 bg-error-soft p-4 text-error mb-6">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-[#323243] sm:text-3xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm font-normal text-muted">
        An unexpected error occurred. Please try reloading or return home.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-white shadow-sm hover:bg-primary-hover transition-colors duration-150"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-5 text-sm font-medium text-[#323243] shadow-sm hover:bg-canvas hover:border-primary hover:text-primary transition-colors duration-150"
        >
          <Home className="h-4 w-4" /> Go Home
        </Link>
      </div>
    </div>
  );
}
