'use client';

import React, { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'success' } | { kind: 'error'; message: string };

const inputCls =
  'w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-colors duration-150 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30';

export const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not send your message. Please try again.');
      }
      setStatus({ kind: 'success' });
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setStatus({ kind: 'error', message: err?.message || 'Something went wrong. Please try again.' });
    }
  };

  if (status.kind === 'success') {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-6 text-center sm:p-8">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
        <h2 className="mt-3 text-lg font-bold text-white">Message sent!</h2>
        <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-slate-300">
          Thanks for reaching out. Your message has been received and you will hear back soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: 'idle' })}
          className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-slate-200 transition-colors duration-150 hover:bg-white/[0.05]"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status.kind === 'error' && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-xs font-semibold text-slate-300">
            Full name *
          </label>
          <input
            id="contact-name"
            type="text"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className={inputCls}
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-xs font-semibold text-slate-300">
            Email *
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputCls}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
        <div>
          <label htmlFor="contact-phone" className="mb-1.5 block text-xs font-semibold text-slate-300">
            Phone <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91-XXXXXXXXXX"
            className={inputCls}
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor="contact-subject" className="mb-1.5 block text-xs font-semibold text-slate-300">
            Subject <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="contact-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What is this about?"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold text-slate-300">
          Message *
        </label>
        <textarea
          id="contact-message"
          required
          minLength={10}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message here..."
          className={`${inputCls} resize-y`}
        />
      </div>

      <button
        type="submit"
        disabled={status.kind === 'sending'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 sm:w-auto"
      >
        {status.kind === 'sending' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span>{status.kind === 'sending' ? 'Sending...' : 'Send Message'}</span>
      </button>
    </form>
  );
};
