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

      // Send WhatsApp notification if payment was successful
      if (resp?.success && Array.isArray(resp?.uuids) && resp.uuids.length) {
        try {
          // Get transaction details to extract buyer info
          const txUrl = `${base}/dashboard/ticket-transactions/${resp.uuids[0]}`;
          const txResp = await fetch(txUrl, {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.NEXT_PUBLIC_API_KEY!,
            },
          }).then(r => r.json()).catch(() => null);
          
          if (txResp?.data) {
            const transaction = txResp.data;
            const ticketUrl = `${window.location.origin}/ticket/${resp.uuids[0]}`;
            
            // Prepare WhatsApp message
            const waMessage = `🎉 Pembayaran Berhasil!

Terima kasih atas pembelian tiket Anda.

Event: ${transaction.event?.title || 'Event'}
Tanggal: ${transaction.event?.start_date ? new Date(transaction.event.start_date).toLocaleDateString('id-ID') : '-'}

Detail Tiket:
- Nama Pemegang: ${transaction.ticket_holder_name}
- Nomor Tiket: ${resp.uuids[0]}

Silakan simpan e-ticket Anda:
${ticketUrl}

Tunjukkan e-ticket ini saat check-in di lokasi acara.

Salam,
Tim MJFest`;

            // Format phone number for WhatsApp
            const formatPhoneNumber = (raw: string) => {
              let s = String(raw || "").replace(/\D/g, "");
              if (!s) return s;
              if (s.startsWith("0")) s = "62" + s.slice(1);
              if (s.startsWith("8")) s = "62" + s;
              return s;
            };

            const buyerPhone = formatPhoneNumber(transaction.buyer_phone);
            
            if (buyerPhone) {
              // Send WhatsApp notification
              const waResponse = await fetch('/api/notify-wa', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  number: buyerPhone,
                  message: waMessage,
                }),
              });
              
              const waResult = await waResponse.json().catch(() => null);
              console.log('WhatsApp notification result:', waResult);
            } else {
              console.error('Invalid buyer phone number:', transaction.buyer_phone);
            }
          } else {
            console.error('Failed to fetch transaction data:', txResp);
          }
        } catch (error) {
          // Log the error for debugging
          console.error('Failed to send WhatsApp notification:', error);
        }
        
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