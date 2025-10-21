'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function fmtIDR(n: number) {
  return `IDR ${Number(n || 0).toLocaleString('id-ID')}`;
}

function fmtDateID(iso?: string) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ payment_status }: { payment_status?: string }) {
  const status = (payment_status || '').toLowerCase(); // paid|pending|failed
  const map: Record<string, { text: string; className: string }> = {
    paid: { text: 'LUNAS', className: 'bg-green-100 text-green-700' },
    pending: { text: 'MENUNGGU PEMBAYARAN', className: 'bg-amber-100 text-amber-700' },
    failed: { text: 'GAGAL', className: 'bg-red-100 text-red-700' },
  };
  const picked = map[status] || { text: 'STATUS TIDAK DIKETAHUI', className: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${picked.className}`}>
      {picked.text}
    </span>
  );
}

export default function TicketCard({
  tx,
  event,
  ticket,
}: {
  tx: any;
  event: any;
  ticket: any;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const qrValue = `${baseUrl}/ticket/${tx.id}`;

  return (
    <>
      <Card className="border border-gray-200 p-6 shadow-sm md:p-8 bg-white">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-800 md:text-3xl">
            Tiket Acara
          </h1>
          <p className="text-gray-600">
            Terima kasih! Simpan tiket ini dan tunjukkan saat masuk lokasi acara.
          </p>
        </div>

        {/* Event + Status */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-6 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{event.title}</h2>
              <p className="text-gray-600">
                {fmtDateID(event.start_date)} — {fmtDateID(event.end_date)}
              </p>
              <p className="text-gray-600">{event.location}</p>
            </div>
            <StatusBadge payment_status={tx.payment_status} />
          </div>

          {/* Detail Tiket */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold text-gray-700">Pemegang Tiket</h3>
                <p className="text-gray-800">{tx.ticket_holder_name}</p>
                <p className="text-gray-600">{tx.ticket_holder_email}</p>
                <p className="text-gray-600">{tx.ticket_holder_phone}</p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-gray-700">Detail Tiket</h3>
                <p className="text-gray-800">{ticket.title}</p>
                <p className="font-bold text-gray-800">{fmtIDR(tx.total_amount)}</p>
                <p className="text-gray-600">Kode Transaksi: {tx.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* QR + Aksi */}
        <div className="text-center">
          <div className="mb-6 inline-block rounded-lg border border-gray-200 bg-white p-4">
            <QRCodeSVG value={qrValue} size={200} level="H" />
          </div>
          <p className="mb-6 text-gray-600">
            Tunjukkan &amp; pindai QR ini saat registrasi/check-in.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row print:hidden">
            <Button onClick={() => window.print()}>Cetak Tiket</Button>
            {event?.slug ? (
              <Link href={`/events/${event.slug}`}>
                <Button variant="secondary">Kembali ke Acara</Button>
              </Link>
            ) : (
              <Button variant="secondary" onClick={() => window.history.back()}>
                Kembali
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Footer kecil */}
      <div className="mt-8 text-center text-sm text-gray-500 print:hidden">
        <p>Butuh bantuan? Hubungi support@mjfest.com</p>
      </div>

      {/* Gaya cetak sederhana */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white;
            margin: 0;
          }
          .print\\:hidden,
          button {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
