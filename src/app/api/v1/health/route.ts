import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'PlacementWire',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    allowed_domain: 'saitm.ac.in',
  });
}
