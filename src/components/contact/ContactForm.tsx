'use client';

import React, { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'success' } | { kind: 'error'; message: string };

const inputCls =
  'w-full rounded-md border border-line bg-white h-10 px-3.5 text-sm font-normal text-[#323243] placeholder:text-muted placeholder:font-normal transition-colors duration-150 focus:border-primary focus:outline-none';

export const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [formStartedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message, website, formStartedAt }),
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
      setWebsite('');
    } catch (err: any) {
      setStatus({ kind: 'error', message: err?.message || 'Something went wrong. Please try again.' });
    }
  };

  if (status.kind === 'success') {
    return (
      <div className="rounded-lg border border-success/30 bg-success-soft p-6 text-center sm:p-8">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <h2 className="mt-3 text-lg font-semibold text-[#323243]">Message sent!</h2>
        <p className="mx-auto mt-1.5 max-w-sm text-xs font-normal leading-relaxed text-muted">
          Thanks for reaching out. Your message has been received and you will hear back soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: 'idle' })}
          className="mt-5 inline-flex h-9 items-center rounded-md border border-line bg-white px-4 text-xs font-medium text-[#323243] shadow-sm transition-colors duration-150 hover:bg-canvas hover:border-primary hover:text-primary"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot — hidden from humans, bots fill it and get silently dropped */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">
          Website
          <input
            id="contact-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>
      {status.kind === 'error' && (
        <div className="flex items-start gap-2 rounded-md border border-error/30 bg-error-soft p-3.5 text-xs font-normal text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-xs font-semibold text-[#323243]">
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
          <label htmlFor="contact-email" className="mb-1.5 block text-xs font-semibold text-[#323243]">
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
          <label htmlFor="contact-phone" className="mb-1.5 block text-xs font-semibold text-[#323243]">
            Phone <span className="font-normal text-muted">(optional)</span>
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
          <label htmlFor="contact-subject" className="mb-1.5 block text-xs font-semibold text-[#323243]">
            Subject <span className="font-normal text-muted">(optional)</span>
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
        <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold text-[#323243]">
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
          className="w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm font-normal text-[#323243] placeholder:text-muted placeholder:font-normal transition-colors duration-150 focus:border-primary focus:outline-none resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={status.kind === 'sending'}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-primary-hover active:scale-[0.99] disabled:opacity-50 sm:w-auto"
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
