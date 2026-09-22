import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0c10] p-6 text-center text-slate-100">
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-slate-400 mb-6">
        <Compass className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">404</h1>
      <h2 className="mt-2 text-xl font-semibold text-slate-200">Page Not Found</h2>
      <p className="mt-3 max-w-md text-sm text-slate-400">
        The page you are looking for does not exist.
      </p>
      <div className="mt-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors duration-150"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
