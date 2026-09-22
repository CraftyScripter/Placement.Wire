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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0c10] p-6 text-center text-slate-100">
      <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-rose-400 mb-6">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm text-slate-400">
        An unexpected error occurred. Please try reloading or return home.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors duration-150"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/[0.05] transition-colors duration-150"
        >
          <Home className="h-4 w-4" /> Go Home
        </Link>
      </div>
    </div>
  );
}
