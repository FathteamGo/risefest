'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const orderId = sp.get('order_id') || '';
  const [msg, setMsg] = useState('Memvalidasi pembayaran…');

  useEffect(() => {
    let alive = true;
    (async () => {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/,'');
      const url = `${base}/dashboard/payment/midtrans/confirm`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
        },
        body: JSON.stringify({ order_id: orderId }),
      }).then(r => r.json()).catch(() => null);

      if (!alive) return;

      if (resp?.success && Array.isArray(resp?.uuids) && resp.uuids.length) {
        router.replace(`/ticket/${resp.uuids[0]}`);
      } else {
        setMsg('Pembayaran sudah diterima, menunggu konfirmasi server…');
        setTimeout(() => router.replace(`/events`), 3500);
      }
    })();
    return () => { alive = false; };
  }, [orderId, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
        <p className="text-sm text-gray-600">{msg}</p>
      </div>
    </div>
  );
}
