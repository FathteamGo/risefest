'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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

  // QR responsive (screen)
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
                  {fmtDateID(event.start_date)} — {fmtDateID(event.end_date)}
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
                    Digunakan pada {fmtDateID(tx.checked_in_at)} oleh {tx.checked_in_by || '-'}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="relative mx-auto inline-block rounded-lg border border-gray-200 bg-white p-3">
                <QRCodeSVG value={qrValue} size={qrSize} level="H" />
                {isUsed && (
                  <div className="pointer-events-none absolute inset-0 z-20 flex select-none items-center justify-center">
                    <div className="rotate-45 px-6 py-10 text-2xl font-extrabold tracking-widest text-black/25 sm:text-3xl md:text-4xl">
                      SUDAH DIGUNAKAN
                    </div>
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
          <Button variant="secondary" className="h-11 px-6" onClick={() => window.print()}>
            Cetak Tiket
          </Button>
          {event?.slug ? (
            <Link href={`/events/${event.slug}`}>
              <Button variant="secondary" className="h-11 px-6">Kembali ke Acara</Button>
            </Link>
          ) : null}
        </div>
      </div>

      {/* ===== PRINT (A4, 1 sheet) ===== */}
      <div id="print-only" className="hidden print:block">
        <div className="sheet">
          <div className="head">
            <div className="title">Tiket Event Anda</div>
            <div className="sub">Simpan tiket ini & tunjukkan saat registrasi masuk.</div>
          </div>

          <div className="card">
            <div className="event">
              <div className="event-title">{event.title}</div>
              <div className="event-sub">
                {fmtDateID(event.start_date)} — {fmtDateID(event.end_date)}
              </div>
              <div className="event-sub">{event.location}</div>
            </div>

            <div className="cols">
              <div className="col">
                <div className="sec">Pemegang Tiket</div>
                <div className="text">{tx.ticket_holder_name}</div>
                <div className="mute">{tx.ticket_holder_email}</div>
                <div className="mute">{tx.ticket_holder_phone}</div>
              </div>
              <div className="col">
                <div className="sec">Detail Tiket</div>
                <div className="text">{ticket.title}</div>
                <div className="amt">{fmtIDR(tx.total_amount)}</div>
                <div className="mute break-all">Kode Transaksi: {tx.id}</div>
                {tx.checked_in_at && (
                  <div className="mute">
                    Digunakan pada {fmtDateID(tx.checked_in_at)} oleh {tx.checked_in_by || '-'}
                  </div>
                )}
              </div>
            </div>

            <div className="qr-wrap">
              <div className="qr-box">
                <QRCodeSVG value={qrValue} size={260} level="H" />
                {isUsed && <div className="used">SUDAH DIGUNAKAN</div>}
              </div>
              <div className="qr-hint">
                {isUsed
                  ? 'Tiket sudah digunakan. QR ditampilkan sebagai referensi.'
                  : 'Tunjukkan & pindai QR ini saat registrasi/check-in.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PRINT STYLES ===== */}
      <style jsx global>{`
        /* Kertas A4 tanpa header/footer */
        @page { size: A4 portrait; margin: 0; }

        /* Lembar A4 tunggal — ukurannya DIKUNCI & tidak boleh meluber */
        .sheet{
          width: 210mm;
          height: 297mm;
          padding: 12mm 14mm;
          box-sizing: border-box;
          display: grid;
          grid-template-rows: auto 1fr;
          row-gap: 6mm;
          overflow: clip;
          page-break-after: avoid;
          break-after: avoid;
        }

        .head{ text-align:center; }
        .title{ font-weight:800; font-size:18pt; line-height:1.2; }
        .sub{ color:#64748b; font-size:10pt; margin-top:2mm; }

        .card{
          border:.3mm solid #e5e7eb;
          border-radius:5mm;
          padding:8mm;
          display:grid;
          grid-auto-rows:max-content;
          row-gap:6mm;
          page-break-inside: avoid;
        }

        .event-title{ font-weight:700; font-size:13pt; }
        .event-sub{ color:#475569; font-size:10pt; }

        .cols{
          display:grid;
          grid-template-columns:1fr 1fr;
          column-gap:8mm;
          page-break-inside: avoid;
        }
        .sec{ font-weight:600; color:#334155; font-size:10pt; margin-bottom:2mm; }
        .text{ color:#0f172a; font-size:10.5pt; }
        .mute{ color:#475569; font-size:10pt; }
        .amt{ font-weight:800; font-size:11pt; color:#0f172a; margin-top:1mm; }

        .qr-wrap{ text-align:center; page-break-inside: avoid; }
        .qr-box{
          display:inline-block; position:relative;
          padding:3mm; border:.3mm solid #e5e7eb; border-radius:3mm; background:#fff;
        }
        .qr-hint{ color:#475569; font-size:9.5pt; margin-top:2mm; }
        .used{
          position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
          font-weight:900; font-size:18pt; letter-spacing:2pt; color:rgba(0,0,0,.22); transform:rotate(45deg);
          pointer-events:none;
        }

        /* Print: tampilkan hanya #print-only, cegah halaman tambahan */
        @media print{
          html, body{ width:210mm; height:297mm; margin:0; background:#fff !important; }
          body *{ visibility: hidden !important; }
          #print-only, #print-only *{ visibility: visible !important; }
          #print-only{ position: fixed; inset: 0; margin: 0; }

          /* Fix beberapa browser yg suka bikin halaman kosong kedua */
          #print-only, .sheet, .card, .cols, .qr-wrap{
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            break-before: avoid !important;
            break-inside: avoid !important;
          }

          /* Sedikit "zoom" supaya engine print tidak split ke halaman 2 */
          .sheet{ transform: scale(0.995); transform-origin: top left; }
        }
      `}</style>
    </>
  );
}
