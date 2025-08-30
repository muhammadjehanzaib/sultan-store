import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';

function sign(orderId: string, ts: string) {
  const secret = process.env.QR_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret';
  return createHmac('sha256', secret).update(`${orderId}:${ts}`).digest('hex');
}

function buildBaseUrl(h: Headers): string {
  const xfProto = h.get('x-forwarded-proto');
  const xfHost = h.get('x-forwarded-host');
  const host = h.get('host');
  const proto = xfProto || 'http';
  const authority = xfHost || host || 'localhost:3000';
  return `${proto}://${authority}`;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ts = Date.now().toString();
  const sig = sign(id, ts);
  const base = process.env.PUBLIC_BASE_URL || buildBaseUrl(request.headers);
  const trackUrl = `${base}/track?o=${encodeURIComponent(id)}&t=${encodeURIComponent(ts)}&sig=${encodeURIComponent(sig)}`;
  return NextResponse.json({ trackUrl });
}
