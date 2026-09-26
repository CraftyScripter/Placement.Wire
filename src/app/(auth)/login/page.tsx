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
import { ThemeToggle } from '@/components/theme/ThemeToggle';

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-4 text-[#323243]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-xs font-normal text-muted">
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
    <div className="login-glow relative flex min-h-screen flex-col items-center justify-center overflow-x-clip bg-canvas px-4 py-10 text-[#323243]">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-lg space-y-7">
        <div className="text-center">
          <Link href="/" className="inline-block" aria-label="Back to homepage">
            <Image
              src="/icon_light.png"
              alt="PlacementWire Logo"
              width={64}
              height={82}
              className="mx-auto h-16 w-auto object-contain sm:h-20 dark:hidden"
              priority
            />
            <Image
              src="/icon_dark.png"
              alt="PlacementWire Logo"
              width={64}
              height={82}
              className="mx-auto hidden h-16 w-auto object-contain sm:h-20 dark:block"
              priority
            />
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#323243] sm:text-4xl">
              Placement<span className="text-primary">Wire</span>
            </h1>
          </Link>
          <p className="mt-2 px-2 text-sm font-normal text-muted sm:text-[15px]">Student Portal • St. Andrews Institute of Technology & Management</p>
        </div>

        {errorParam === 'domain_unauthorized' && (
          <div className="rounded-lg border border-error/30 bg-error-soft p-4 text-xs text-error space-y-2">
            <div className="flex items-center gap-2 font-semibold text-error">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Ineligible Email Domain</span>
            </div>
            <p className="font-normal">
              {attemptedEmail ? (
                <span>
                  The account <strong className="font-semibold text-[#323243]">{attemptedEmail}</strong> is not permitted.
                </span>
              ) : (
                'Your Google account is not permitted.'
              )}
            </p>
            <p className="text-[11px] font-normal opacity-80">
              Only verified SAITM accounts ending in <strong>@saitm.ac.in</strong> can sign in.
            </p>
          </div>
        )}

        {errorParam && errorParam !== 'domain_unauthorized' && (
          <div className="rounded-lg border border-accent/40 bg-accent-soft p-4 text-xs text-[#323243]">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-4 w-4 shrink-0 text-accent" />
              <span>Authentication Notice</span>
            </div>
            <p className="mt-1 font-normal">
              Google authentication could not be completed ({errorParam}). Please try again.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-10 space-y-7">
          <div className="space-y-4">
            <div className="rounded-md border border-line bg-canvas p-3.5 text-xs text-muted">
              <div className="flex items-center gap-1.5 font-semibold text-[#323243]">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Who can sign in</span>
              </div>
              <p className="mt-1 text-[11px] font-normal text-muted">
                Only students with an active <code className="text-[#323243] bg-white border border-line px-1 py-0.5 rounded">@saitm.ac.in</code> Google account.
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 py-2.5 text-base font-semibold text-white shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
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

          <div className="pt-2 border-t border-line text-center">
            <span className="text-[10px] text-muted block mb-2 font-normal">Development & Local Testing</span>
            <button
              onClick={handleMockLogin}
              disabled={mockLoading}
              className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-xs font-medium text-primary hover:border-primary hover:bg-canvas active:scale-[0.98] transition-all duration-150 shadow-card"
            >
              {mockLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" />
              )}
              <span>Dev Login (Demo Student @saitm.ac.in)</span>
            </button>
          </div>

          <div className="space-y-2 pt-1 text-[11px] font-normal text-muted">
            <div className="flex items-start gap-2">
              <HardDrive className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted" />
              <span>Records saved in your personal Google Drive.</span>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted" />
              <span>Read-only Gmail access. Personal emails are never indexed.</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] font-normal text-muted">
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
        <div className="flex min-h-screen items-center justify-center bg-canvas text-muted">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
