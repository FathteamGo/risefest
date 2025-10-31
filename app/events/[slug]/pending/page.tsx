'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PendingPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const orderId = sp.get('order_id') || '';

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace(`/events`);
    }, 4000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
        <p className="text-sm text-gray-600">Menunggu penyelesaian pembayaran…</p>
        <p className="mt-1 text-xs text-gray-500 break-all">Order ID: {orderId}</p>
      </div>
    </div>
  );
}
