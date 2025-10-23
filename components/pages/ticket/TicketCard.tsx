'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useMemo } from 'react';

function fmtIDR(n: number) { return `IDR ${Number(n || 0).toLocaleString('id-ID')}`; }
function fmtDateID(iso?: string) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('id-ID', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function TicketCard({ tx, event, ticket }: { tx: any; event: any; ticket: any; }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const qrValue = `${baseUrl}/ticket/${tx.id}`;

  const qrSize = useMemo(() => {
    if (typeof window === 'undefined') return 220;
    const w = Math.min(window.innerWidth, 480);
    return Math.max(160, Math.min(220, Math.floor(w * 0.6)));
  }, []);

  const isUsed = String(tx.status).toLowerCase() === 'used';

  return (
    <>
      <div className="mb-24 sm:mb-0">
        <Card id="print-area" className="relative ticket-card border border-gray-200 bg-white p-5 shadow-sm md:rounded-2xl md:p-8">
          {/* Watermark USED */}
          {isUsed && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rotate-45 border-4 border-black/80 px-8 py-16 text-6xl font-extrabold tracking-widest text-black/80 opacity-20">
                USED
              </div>
            </div>
          )}

          <div className="mb-4 text-center">
            <h1 className="text-xl font-bold md:text-2xl">Tiket Acara</h1>
            <p className="text-sm text-gray-600">Simpan tiket ini &amp; tunjukkan saat masuk lokasi.</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-5 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-lg font-semibold md:text-xl">{event.title}</h2>
                <p className="text-gray-600">{fmtDateID(event.start_date)} — {fmtDateID(event.end_date)}</p>
                <p className="text-gray-600">{event.location}</p>
              </div>
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
                  {tx.checked_in_at && (
                    <p className="mt-2 text-xs text-gray-600">
                      Digunakan pada {fmtDateID(tx.checked_in_at)} oleh {tx.checked_in_by || '-'}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="mx-auto inline-block rounded-lg border border-gray-200 bg-white p-3">
                  <QRCodeSVG value={qrValue} size={qrSize} level="H" />
                </div>
                <p className="mt-3 text-sm text-gray-600">Tunjukkan &amp; pindai QR ini saat registrasi/check-in.</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="no-print mt-6 hidden justify-center gap-3 sm:flex">
          <Button variant="secondary" className="h-11 px-6" onClick={() => window.print()}>Cetak Tiket</Button>
          {event?.slug ? (
            <Link href={`/events/${event.slug}`}><Button variant="secondary" className="h-11 px-6">Kembali ke Acara</Button></Link>
          ) : null}
        </div>
      </div>

      <div className="no-print fixed inset-x-0 bottom-0 z-50 border-t bg-white px-4 py-3 shadow-[0_-6px_12px_rgba(0,0,0,0.06)] sm:hidden"
           style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
        <div className="mx-auto flex max-w-[680px] gap-2">
          <Button variant="secondary" className="h-11 flex-1" onClick={() => window.print()}>Cetak</Button>
          {event?.slug ? (
            <Link href={`/events/${event.slug}`} className="flex-1"><Button variant="secondary" className="h-11 w-full">Kembali</Button></Link>
          ) : null}
        </div>
      </div>

      <style jsx global>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area { position: absolute !important; left: 0; top: 0; width: 100% !important; box-shadow: none !important; border: none !important; }
          .no-print { display: none !important; }
          html, body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: #fff !important; }
        }
      `}</style>
    </>
  );
}
