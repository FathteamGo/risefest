// app/admin/check-in/[eventId]/page.tsx
// ===================================================================================
// Halaman: Admin Check-In (UI rapi, tidak lebay, full Bahasa Indonesia)
// Fitur utama:
// - Proteksi akses sederhana via localStorage 'adminToken' (DEMO).
// - Pemindai QR (html5-qrcode) di panel kiri.
// - Panel kanan: informasi tiket yang dipindai (valid / tidak valid), badge status,
//   serta aksi "Konfirmasi Check-in" dan "Pindai Lagi".
// - UI ringkas: breadcrumb, judul, toolbar, grid 2 kolom responsif, panel kanan sticky.
// - TANPA background tambahan — memakai latar putih bawaan.
// - Komentar (//) sebagai dokumentasi alur & struktur. JANGAN DIHAPUS.
// Catatan penting:
// - Ini implementasi demo. Untuk produksi, hubungkan ke backend dan kelola sesi secara benar.
// - Pastikan sudah `npm i html5-qrcode`.
// - Event & tiket dummy diambil dari '@/lib/dummy-data'.
// ===================================================================================

'use client';

import React, { use as usePromise, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { events, ticketTransactions, eventTickets } from '@/lib/dummy-data';

// -------------------------------
// Tipe data ringkas untuk Event
// -------------------------------
type EventLite = {
  id: number;
  slug: string;
  title: string;
  location?: string;
  start_date?: string;
  end_date?: string;
};

// -------------------------------
// Util: format tanggal lokal Indonesia
// -------------------------------
const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

// -------------------------------
// Komponen kecil: Badge status transaksi
// status: paid | used | pending | canceled (contoh di dummy-data)
// -------------------------------
function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'paid'
      ? 'bg-green-100 text-green-800'
      : status === 'used'
      ? 'bg-blue-100 text-blue-800'
      : status === 'canceled'
      ? 'bg-red-100 text-red-800'
      : 'bg-yellow-100 text-yellow-800';

  const label = status.charAt(0).toUpperCase() + status.slice(1); // → "Paid", "Used", dst.

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${cls}`}
      aria-label={`Status tiket: ${label}`}
    >
      {label}
    </span>
  );
}

// -------------------------------
// Komponen kecil: Header halaman (Breadcrumb + judul + meta event)
// -------------------------------
function PageHeader({ event }: { event: EventLite }) {
  return (
    <div className="mb-6">
      {/* Breadcrumb (sederhana) */}
      <nav className="mb-2 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/admin/events" className="hover:underline">
          Admin
        </Link>
        <span>/</span>
        <Link href="/admin/events" className="hover:underline">
          Acara
        </Link>
        <span>/</span>
        <span className="text-foreground">Check-in</span>
      </nav>

      {/* Judul + meta event */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight md:text-3xl">
            Check-in — {event.title}
          </h1>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center">
              {/* Ikon lokasi sederhana */}
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              {event.location || '—'}
            </span>

            <span className="hidden sm:inline">•</span>

            <span className="inline-flex items-center">
              {/* Ikon kalender sederhana */}
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              {fmtDate(event.start_date)} — {fmtDate(event.end_date)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------
// Komponen panel kanan: detail hasil pemindaian
// -------------------------------
function TicketDetailPanel({
  scannedTicket,
  scanResult,
  onConfirm,
  onReset,
}: {
  scannedTicket: any;
  scanResult: string | null;
  onConfirm: () => void;
  onReset: () => void;
}) {
  return (
    <Card className="p-6 lg:sticky lg:top-6">
      <h2 className="mb-4 text-xl font-semibold">Informasi Tiket</h2>

      {/* Hasil teks mentah dari QR (biasanya UUID / tautan) */}
      {scanResult && (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          Dipindai: <span className="break-all font-mono">{scanResult}</span>
        </div>
      )}

      {/* Saat belum ada yang dipindai */}
      {!scannedTicket && (
        <Card className="bg-gray-50 p-6 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto mb-4 h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          <p className="text-sm text-muted-foreground">Arahkan kamera ke QR Code tiket untuk melihat detailnya.</p>
        </Card>
      )}

      {/* Saat QR tidak valid / tidak ditemukan */}
      {scannedTicket?.error && (
        <Card className="border-red-200 bg-red-50 p-6">
          <div className="mb-3 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-base font-semibold text-red-700">Tiket Tidak Valid</h3>
          </div>
          <p className="mb-4 text-sm text-red-700">{scannedTicket.error}</p>
          <Button onClick={onReset} className="w-full sm:w-auto">
            Pindai Lagi
          </Button>
        </Card>
      )}

      {/* Saat QR valid */}
      {scannedTicket?.transaction && (
        <Card className="border-green-200 bg-green-50 p-6">
          <div className="mb-3 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-6 w-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-base font-semibold text-green-700">Tiket Valid</h3>
          </div>

          {/* Ringkasan detil tiket */}
          <div className="mb-6 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Nama Pemegang Tiket</p>
              <p className="font-medium">{scannedTicket.transaction.ticket_holder_name}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="truncate text-sm font-medium">{scannedTicket.transaction.ticket_holder_email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telepon</p>
                <p className="text-sm font-medium">{scannedTicket.transaction.ticket_holder_phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Jenis Tiket</p>
                <p className="text-sm font-medium">{scannedTicket.ticket?.title || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge status={scannedTicket.transaction.status} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Tanggal Beli</p>
                <p className="text-sm font-medium">{fmtDate(scannedTicket.transaction.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Terakhir Diperbarui</p>
                <p className="text-sm font-medium">{fmtDate(scannedTicket.transaction.updated_at)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">ID Transaksi</p>
              <p className="truncate font-mono text-xs">{scannedTicket.transaction.id}</p>
            </div>
          </div>

          {/* Peringatan jika sudah "used" */}
          {scannedTicket.transaction.status === 'used' && (
            <Card className="border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm font-medium text-yellow-700">
                Tiket ini sudah digunakan untuk check-in sebelumnya.
              </p>
            </Card>
          )}

          {/* Aksi */}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {scannedTicket.transaction.status !== 'used' && (
              <Button className="w-full sm:flex-1" onClick={onConfirm}>
                Konfirmasi Check-in
              </Button>
            )}
            <Button variant="secondary" className="w-full sm:flex-1" onClick={onReset}>
              Pindai Lagi
            </Button>
          </div>
        </Card>
      )}
    </Card>
  );
}

// -------------------------------
// Komponen panel kiri: pemindai QR
// -------------------------------
function ScannerPanel({
  isScanning,
  onScanSuccess,
  onReady,
}: {
  isScanning: boolean;
  onScanSuccess: (text: string) => void;
  onReady?: () => void;
}) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const elRef = useRef<HTMLDivElement>(null);

  // Inisialisasi scanner setiap kali isScanning = true
  useEffect(() => {
    if (!isScanning) return;

    if (elRef.current) {
      // Inisialisasi html5-qrcode
      const scanner = new Html5QrcodeScanner(
        'qr-reader', // id DOM harus unik
        { fps: 10, qrbox: { width: 280, height: 280 } },
        false
      );
      scannerRef.current = scanner;

      scanner.render(
        (decodedText: string) => {
          // Sukses memindai → kirim ke parent
          onScanSuccess(decodedText);
        },
        // Error scanning (umumnya noise) — kita biarkan senyap agar tidak mengganggu UI
        (_errorMessage: string) => {}
      );

      // Callback opsional ketika scanner siap
      onReady?.();
    }

    // Bersihkan scanner saat unmount / menghentikan pemindaian
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isScanning, onScanSuccess, onReady]);

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pemindai QR</h2>
        <div className="text-xs font-medium text-muted-foreground" aria-live="polite">
          {isScanning ? 'Aktif' : 'Jeda'}
        </div>
      </div>

      {/* Kontainer scanner (library memerlukan ID) */}
      <div
        id="qr-reader"
        ref={elRef}
        className="flex h-80 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
      >
        {!isScanning && (
          <p className="text-sm text-muted-foreground">Pemindai dijeda. Tekan &quot;Pindai Lagi&quot; di panel kanan.</p>
        )}
      </div>

      {/* Tips penggunaan kamera yang sederhana */}
      <div className="mt-4 rounded-md bg-gray-100 p-3 text-xs text-muted-foreground">
        Tips: Arahkan kamera ke QR Code ±15–25 cm dan pastikan pencahayaan cukup.
      </div>
    </Card>
  );
}

// -------------------------------
// PAGE: AdminCheckInPage
// -------------------------------
export default function AdminCheckInPage({
  params,
}: {
  // Next.js 15: di Client Component, params adalah Promise → perlu di-"unwrap".
  params: Promise<{ eventId: string }>;
}) {
  const router = useRouter();

  // ---------------------------
  // Unwrap params (Promise → value)
  // ---------------------------
  const { eventId } = usePromise(params);

  // ---------------------------
  // Proteksi minimal (DEMO)
  // Jika tidak ada token → arahkan ke halaman login
  // ---------------------------
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('adminToken')) {
      router.replace('/admin/login');
    }
  }, [router]);

  // ---------------------------
  // Ambil event dari dummy-data
  // ---------------------------
  const event = useMemo(() => {
    return events.find((e: any) => e.id === parseInt(eventId));
  }, [eventId]);

  // Jika event tidak ditemukan → kembali ke daftar acara admin
  useEffect(() => {
    if (!event) {
      router.replace('/admin/events');
    }
  }, [event, router]);

  // Saat belum ada event (menghindari render sebelum redirect)
  if (!event) return null;

  // ---------------------------
  // State check-in (UI kanan/kiri)
  // ---------------------------
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedTicket, setScannedTicket] = useState<any>(null);

  // ---------------------------
  // Ketika pemindai berhasil membaca data QR
  // ---------------------------
  const handleScanSuccess = (decodedText: string) => {
    setScanResult(decodedText);

    // Catatan bisnis:
    // Umumnya QR berisi UUID transaksi / URL validasi.
    // Untuk demo ini, kita cocokkan langsung ke id transaksi di dummy-data.
    const tx = ticketTransactions.find((t: any) => t.id === decodedText);

    if (tx) {
      const tkt = eventTickets.find((t: any) => t.id === tx.event_ticket_id);
      setScannedTicket({ transaction: tx, ticket: tkt });
    } else {
      setScannedTicket({ error: 'Tiket tidak ditemukan pada sistem.' });
    }

    // Jeda pemindaian agar kamera tidak terus aktif
    setIsScanning(false);
  };

  // ---------------------------
  // Aksi: Konfirmasi check-in
  // ---------------------------
  const confirmCheckIn = () => {
    if (!scannedTicket?.transaction) return;

    // TODO (produksi): panggil API untuk memperbarui status tiket di database.
    alert(`Tiket atas nama ${scannedTicket.transaction.ticket_holder_name} berhasil check-in!`);

    // Update state lokal (DEMO) → tandai sebagai "used"
    setScannedTicket((prev: any) =>
      prev ? { ...prev, transaction: { ...prev.transaction, status: 'used' } } : prev
    );
  };

  // ---------------------------
  // Aksi: Pindai lagi (reset)
  // ---------------------------
  const resetScanner = () => {
    setScannedTicket(null);
    setScanResult(null);
    setIsScanning(true);
  };

  // ---------------------------
  // Render halaman
  // ---------------------------
  return (
    // Tidak menambahkan background khusus → gunakan latar putih bawaan
    <div className="min-h-screen">
      <Container className="py-8">
        {/* Header */}
        <PageHeader event={event as EventLite} />

        {/* Toolbar ringkas */}
        <Card className="mb-6 flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
          <div className="text-sm text-muted-foreground">
            Gunakan kamera perangkat untuk memindai QR Code tiket.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => router.push('/admin/events')}>
              Kembali ke Acara
            </Button>
            <Link href={`/events/${(event as EventLite).slug}`} className="hidden sm:block">
              <Button variant="ghost">Lihat Halaman Publik</Button>
            </Link>
          </div>
        </Card>

        {/* Grid dua kolom: kiri = pemindai, kanan = detail (sticky) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <ScannerPanel
            isScanning={isScanning}
            onScanSuccess={handleScanSuccess}
            onReady={() => {
              // Callback jika ingin menandai "scanner siap" → opsional
            }}
          />

          <TicketDetailPanel
            scannedTicket={scannedTicket}
            scanResult={scanResult}
            onConfirm={confirmCheckIn}
            onReset={resetScanner}
          />
        </div>

        {/* Footer kecil */}
        <div className="mt-10 text-center text-xs text-muted-foreground">
          MJFest Admin • Konsol Check-in
        </div>
      </Container>
    </div>
  );
}
