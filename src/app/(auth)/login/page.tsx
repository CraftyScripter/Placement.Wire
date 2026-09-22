'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Lock,
  HardDrive,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mockLoading, setMockLoading] = useState(false);

  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  const errorParam = searchParams.get('error');
  const attemptedEmail = searchParams.get('email');

  if (authLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0c10] p-4 text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-xs text-slate-400">
          {isAuthenticated ? 'Already signed in. Redirecting to dashboard...' : 'Checking student session...'}
        </p>
      </div>
    );
  }

  const handleGoogleLogin = () => {
    setIsSubmitting(true);
    window.location.href = '/api/v1/auth/google/login';
  };

  const handleMockLogin = async () => {
    setMockLoading(true);
    try {
      const res = await fetch('/api/v1/auth/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'student.demo@saitm.ac.in',
          name: 'Aditya Sharma (SAITM 2026)',
        }),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        alert('Mock login failed.');
      }
    } catch (e) {
      alert('Mock login error.');
    } finally {
      setMockLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0c10] p-4 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/icon_dark.png"
              alt="PlacementWire Logo"
              width={52}
              height={66}
              className="h-14 w-auto object-contain mx-auto"
              priority
            />
          </Link>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Placement<span className="text-indigo-400">Wire</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">Student Portal • St. Andrews Institute of Technology & Management</p>
        </div>

        {errorParam === 'domain_unauthorized' && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-200">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
              <span>Ineligible Email Domain</span>
            </div>
            <p>
              {attemptedEmail ? (
                <span>
                  The account <strong className="text-white">{attemptedEmail}</strong> is not permitted.
                </span>
              ) : (
                'Your Google account is not permitted.'
              )}
            </p>
            <p className="text-[11px] text-rose-300/80">
              Only verified SAITM accounts ending in <strong>@saitm.ac.in</strong> can sign in.
            </p>
          </div>
        )}

        {errorParam && errorParam !== 'domain_unauthorized' && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300">
            <div className="flex items-center gap-2 font-bold text-amber-200">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
              <span>Authentication Notice</span>
            </div>
            <p className="mt-1">
              Google authentication could not be completed ({errorParam}). Please try again.
            </p>
          </div>
        )}

        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3.5 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                <span>Who can sign in</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Only students with an active <code className="text-slate-300 bg-white/[0.06] px-1 py-0.5 rounded">@saitm.ac.in</code> Google account.
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100 active:scale-95 disabled:opacity-50 transition-colors duration-150"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Sign In with College Google</span>
            </button>
          </div>

          <div className="pt-2 border-t border-white/10 text-center">
            <span className="text-[10px] text-slate-500 block mb-2 font-medium">Development & Local Testing</span>
            <button
              onClick={handleMockLogin}
              disabled={mockLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.05] active:scale-95 transition-colors duration-150"
            >
              {mockLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span>Dev Login (Demo Student @saitm.ac.in)</span>
            </button>
          </div>

          <div className="space-y-2 pt-1 text-[11px] text-slate-500">
            <div className="flex items-start gap-2">
              <HardDrive className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>Records saved in your personal Google Drive.</span>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>Read-only Gmail access. Personal emails are never indexed.</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500">
          Independent student software for SAITM Gurgaon
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0c10] text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
