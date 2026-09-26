import { NextResponse } from 'next/server';
import { env } from '@/config/env';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'PlacementWire',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    allowed_domain: env.ALLOWED_EMAIL_DOMAIN,
  });
}
