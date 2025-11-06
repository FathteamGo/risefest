import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { order_id } = await req.json();
    if (!order_id) return NextResponse.json({ ok: false, error: 'order_id is required' }, { status: 400 });

    const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');
    const res = await fetch(`${base}/dashboard/payment/midtrans/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY ?? '',
      },
      body: JSON.stringify({ order_id }),
      cache: 'no-store',
    });

    const data = await res.json().catch(async () => ({ raw: await res.text() }));
    if (!res.ok) return NextResponse.json({ ok: false, error: data }, { status: res.status });

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
}
