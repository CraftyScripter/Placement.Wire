import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/config/env';
import { rateLimit, clientKey } from '@/lib/security/rate-limit';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(160),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  subject: z.string().trim().max(160).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Please write a message (min 10 characters).').max(5000),
  // Honeypot — real users leave it empty, bots fill it.
  website: z.string().trim().max(200).optional().or(z.literal('')),
  formStartedAt: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, 'contact'), 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many messages. Please try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetAfterMs / 1000)) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message || 'Please check the form and try again.' },
      { status: 400 }
    );
  }

  // Silently accept honeypot hits as success so bots learn nothing.
  if (parsed.data.website) {
    return NextResponse.json({ success: true, message: 'Message sent successfully.' });
  }

  // Reject instant submits (< 3s) — humans need time to type.
  if (parsed.data.formStartedAt && Date.now() - parsed.data.formStartedAt < 3000) {
    return NextResponse.json(
      { success: false, error: 'Please take a moment to write your message and try again.' },
      { status: 400 }
    );
  }

  if (!env.CONTACT_FORM_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'Contact service is not configured yet. Please email us directly.' },
      { status: 503 }
    );
  }

  try {
    const upstream = await fetch(env.CONTACT_FORM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': env.CONTACT_FORM_API_KEY,
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || '',
        subject: parsed.data.subject || 'PlacementWire Contact',
        message: parsed.data.message,
      }),
    });

    if (!upstream.ok) {
      throw new Error(`Upstream responded with ${upstream.status}`);
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Contact form relay failed:', err);
    return NextResponse.json(
      { success: false, error: 'Could not send your message right now. Please try again later.' },
      { status: 502 }
    );
  }
}
