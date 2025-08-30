import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

function sign(orderId: string, ts: string) {
  const secret = process.env.QR_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret';
  return createHmac('sha256', secret).update(`${orderId}:${ts}`).digest('hex');
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const o = url.searchParams.get('o');
  const t = url.searchParams.get('t');
  const sig = url.searchParams.get('sig');

  if (!o || !t || !sig) {
    return NextResponse.redirect(new URL('/', url), { status: 302 });
  }

  try {
    const expected = sign(o, t);
    const ok = timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    if (!ok) throw new Error('bad sig');
    // Optional: TTL check (e.g., 30 days)
    // if (Date.now() - Number(t) > 30*24*3600*1000) throw new Error('expired');
  } catch {
    return NextResponse.redirect(new URL('/', url), { status: 302 });
  }

  // Redirect to a readable order page (customer order page).
  // Adjust to an internal admin URL if preferred.
  return NextResponse.redirect(new URL(`/orders/${o}`, url), { status: 302 });
}
