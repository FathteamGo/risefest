'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useMemo } from 'react';

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
  const status = (payment_status || '').toLowerCase();
  const map: Record<string, { text: string; className: string }> = {
    paid: { text: 'LUNAS', className: 'bg-green-100 text-green-700' },
    pending: { text: 'MENUNGGU PEMBAYARAN', className: 'bg-amber-100 text-amber-700' },
    failed: { text: 'GAGAL', className: 'bg-red-100 text-red-700' },
  };
  const picked = map[status] || { text: 'STATUS TIDAK DIKETAHUI', className: 'bg-gray-100 text-gray-700' };
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${picked.className}`}>{picked.text}</span>;
}

function loadSnap() {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).snap) return resolve();
    const s = document.createElement('script');
    s.src =
      process.env.NODE_ENV === 'production'
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
    s.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    s.onload = () => resolve();
    s.onerror = reject;
    document.body.appendChild(s);
  });
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
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const qrValue = `${baseUrl}/ticket/${tx.id}`;

  // ukuran QR responsif (maks 220, min 160)
  const qrSize = useMemo(() => {
    if (typeof window === 'undefined') return 220;
    const w = Math.min(window.innerWidth, 480);
    return Math.max(160, Math.min(220, Math.floor(w * 0.6)));
  }, []);

  const openSnap = async () => {
    if (!tx?.snap_token) return;
    try {
      await loadSnap();
      (window as any).snap.pay(tx.snap_token, {
        onSuccess: () => router.refresh(),
        onPending: () => router.refresh(),
        onError: () => alert('Pembayaran gagal. Coba lagi.'),
        onClose: () => {},
      });
    } catch {
      alert('Gagal memuat Midtrans Snap.');
    }
  };

  return (
    <>
      {/* mb-24 di mobile untuk ruang sticky bar */}
      <Card className="ticket-card border border-gray-200 bg-white p-5 shadow-sm md:rounded-2xl md:p-8 mb-24 sm:mb-0">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold md:text-2xl">Tiket Acara</h1>
          <p className="text-sm text-gray-600">Simpan tiket ini &amp; tunjukkan saat masuk lokasi.</p>
        </div>

        {/* Event + Status */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
          <div className="mb-5 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold md:text-xl">{event.title}</h2>
              <p className="text-gray-600">
                {fmtDateID(event.start_date)} — {fmtDateID(event.end_date)}
              </p>
              <p className="text-gray-600">{event.location}</p>
            </div>
            <StatusBadge payment_status={tx.payment_status} />
          </div>

          <div className="border-t border-gray-200 pt-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Pemegang Tiket</h3>
                <p className="text-gray-800">{tx.ticket_holder_name}</p>
                <p className="text-gray-600">{tx.ticket_holder_email}</p>
                <p className="text-gray-600">{tx.ticket_holder_phone}</p>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Detail Tiket</h3>
                <p className="text-gray-800">{ticket.title}</p>
                <p className="font-bold text-gray-800">{fmtIDR(tx.total_amount)}</p>
                <p className="break-all text-gray-600">Kode Transaksi: {tx.id}</p>
              </div>
            </div>

            {/* pembayaran jika pending */}
            {String(tx.payment_status).toLowerCase() === 'pending' && (
              <div className="mt-5 rounded-md bg-gray-50 p-4">
                {tx.va_number ? (
                  <>
                    <p className="mb-2 text-sm text-gray-600">
                      Transfer ke Virtual Account <span className="font-semibold uppercase">{tx.va_bank}</span>:
                    </p>
                    <div className="mb-3 font-mono text-lg font-semibold">{tx.va_number}</div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(tx.va_number);
                            alert('Nomor VA disalin.');
                          } catch {}
                        }}
                      >
                        Salin Nomor VA
                      </Button>
                      <Button variant="outline" onClick={() => router.refresh()}>
                        Saya Sudah Bayar
                      </Button>
                    </div>
                  </>
                ) : tx.snap_token ? (
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={openSnap}>Bayar Sekarang (Snap)</Button>
                    <Button variant="outline" onClick={() => router.refresh()}>
                      Cek Status
                    </Button>
                  </div>
                ) : tx.payment_url ? (
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => (window.location.href = tx.payment_url!)}>Buka Halaman Pembayaran</Button>
                    <Button variant="outline" onClick={() => router.refresh()}>Cek Status</Button>
                  </div>
                ) : null}
              </div>
            )}

            {/* QR */}
            <div className="mt-6 text-center">
              <div className="mx-auto inline-block rounded-lg border border-gray-200 bg-white p-3">
                <QRCodeSVG value={qrValue} size={qrSize} level="H" />
              </div>
              <p className="mt-3 text-sm text-gray-600">Tunjukkan &amp; pindai QR ini saat registrasi/check-in.</p>
            </div>
          </div>
        </div>

        {/* Aksi (desktop & tablet) */}
        <div className="no-print mt-6 hidden justify-center gap-3 sm:flex">
          <Button variant="secondary" className="h-11 px-6" onClick={() => window.print()}>
            Cetak Tiket
          </Button>
          {event?.slug ? (
            <Link href={`/events/${event.slug}`}>
              <Button variant="secondary" className="h-11 px-6">Kembali ke Acara</Button>
            </Link>
          ) : (
            <Button variant="secondary" className="h-11 px-6" onClick={() => window.history.back()}>
              Kembali
            </Button>
          )}
        </div>
      </Card>

      {/* Sticky action bar (mobile) */}
      <div
        className="no-print fixed inset-x-0 bottom-0 z-50 border-t bg-white px-4 py-3 shadow-[0_-6px_12px_rgba(0,0,0,0.06)] sm:hidden"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <div className="mx-auto flex max-w-[680px] gap-2">
          <Button className="h-11 flex-1" onClick={() => window.print()}>Cetak</Button>
          {event?.slug ? (
            <Link href={`/events/${event.slug}`} className="flex-1">
              <Button variant="secondary" className="h-11 w-full">Kembali</Button>
            </Link>
          ) : (
            <Button variant="secondary" className="h-11 flex-1" onClick={() => window.history.back()}>
              Kembali
            </Button>
          )}
        </div>
      </div>

      {/* Print only hides .no-print */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>
    </>
  );
}
