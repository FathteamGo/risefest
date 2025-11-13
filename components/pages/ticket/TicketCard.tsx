'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function fmtIDR(n: number) {
  return `IDR ${Number(n || 0).toLocaleString('id-ID')}`;
}

/** WIB helpers **/
const WIB_OFFSET = '+07:00';

function parseToWIB(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const s = String(dateStr).trim();
  // kalau sudah ada Z atau offset => langsung pakai
  if (/[zZ]|[+\-]\d{2}:\d{2}$/.test(s)) return new Date(s);
  // format "YYYY-MM-DD HH:MM:SS" => paksa ke WIB
  return new Date(s.replace(' ', 'T') + WIB_OFFSET);
}

function formatWIBDate(dateStr?: string | null): string {
  const d = parseToWIB(dateStr);
  if (!d) return '-';
  return d.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatWIBTime(dateStr?: string | null): string {
  const d = parseToWIB(dateStr);
  if (!d) return '-';
  return d.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatWIBTimeRange(start?: string | null, end?: string | null): string {
  const startTime = formatWIBTime(start);
  const endTime = formatWIBTime(end);
  if (startTime === '-' || endTime === '-') return '-';
  return `${startTime} – ${endTime}`;
}

// buat checked_in_at dsb
function formatWIBDateTime(dateStr?: string | null): string {
  const d = parseToWIB(dateStr);
  if (!d) return '-';
  return d.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const qrValue = `${baseUrl}/ticket/${tx.id}`;
  const isUsed = String(tx.status || '').toLowerCase() === 'used';

  const [qrSize, setQrSize] = useState<number>(260);
  useEffect(() => {
    const calc = () => {
      const w = Math.min(window.innerWidth, 560);
      setQrSize(Math.max(220, Math.min(300, Math.floor(w * 0.6))));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  return (
    <>
      {/* ===== SCREEN ===== */}
      <div className="mb-24 sm:mb-0 print:hidden">
        <Card className="relative border border-gray-200 bg-white p-4 sm:p-6 md:rounded-2xl md:p-8">
          <div className="mb-4 text-center">
            <h1 className="text-lg font-bold sm:text-xl md:text-2xl">Tiket Event Anda</h1>
            <p className="text-xs text-gray-600 sm:text-sm">
              Simpan tiket ini &amp; tunjukkan saat registrasi masuk.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-5 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-base font-semibold sm:text-lg md:text-xl">
                  {event.title}
                </h2>
                <p className="text-gray-600">
                  {formatWIBDate(event.start_date)} • {formatWIBTimeRange(event.start_date, event.end_date)}
                </p>
                <p className="text-gray-600">{event.location}</p>
              </div>
            </div>

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
                {tx.checked_in_at && (
                  <p className="mt-2 text-xs text-gray-600">
                    Digunakan pada {formatWIBDateTime(tx.checked_in_at)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="relative mx-auto inline-block overflow-hidden rounded-lg border border-gray-200 bg-white p-3">
                <QRCodeSVG value={qrValue} size={qrSize} level="H" />
                {isUsed && (
                  <div className="used-wrap">
                    <span>SUDAH</span>
                    <span>DIGUNAKAN</span>
                  </div>
                )}
              </div>
              <p className="mt-3 text-xs text-gray-600 sm:text-sm">
                {isUsed
                  ? 'Tiket sudah digunakan. QR tetap ditampilkan hanya sebagai referensi.'
                  : 'Tunjukkan & pindai QR ini saat registrasi/check-in.'}
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-6 hidden justify-center gap-3 sm:flex">
          <Button
            variant="secondary"
            className="h-11 px-6"
            onClick={() => window.print()}
          >
            Cetak Tiket
          </Button>
          {event?.slug ? (
            <Link href={`/events/${event.slug}`}>
              <Button variant="secondary" className="h-11 px-6">
                Kembali ke Acara
              </Button>
            </Link>
          ) : null}
        </div>
      </div>

      <style jsx global>{`
        .used-wrap {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.12em;
          transform: rotate(-32deg);
          pointer-events: none;
          user-select: none;
        }

        .used-wrap span {
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: rgba(100, 116, 139, 0.9);
          font-size: 2.2rem; /* FIXED: sama di HP & desktop */
          line-height: 1.1;
          white-space: nowrap;
          text-shadow: 0 0 3px rgba(255, 255, 255, 0.9);
        }
      `}</style>
    </>
  );
}
