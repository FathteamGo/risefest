'use client';

import type { Event, EventTicket } from '@/types';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Container from '@/components/ui/Container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ticketTransactionService } from '@/lib/data-service';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
const API_KEY  = process.env.NEXT_PUBLIC_API_KEY!;

const rupiah = (n: number) => `IDR ${Number(n || 0).toLocaleString('id-ID')}`;
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

function loadSnap() {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).snap) return resolve();
    const s = document.createElement('script');
    const SNAP_IS_PROD = String(process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION ?? 'false').toLowerCase() === 'true';
    s.src = SNAP_IS_PROD ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';
    s.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    s.onload = () => resolve();
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

type CreatedTx = {
  id: string;
  total_amount?: number | null;
  payment_url?: string | null;
  snap_token?: string | null;
};

export default function RegistrationForm({ event, ticket }: { event: Event; ticket: EventTicket; }) {
  const router = useRouter();

  const [buyerInfo, setBuyerInfo] = useState({ name: '', email: '', phone: '', city: '' });
  const [ticketHolders, setTicketHolders] = useState<Array<{ name: string; email: string; phone: string }>>([{ name: '', email: '', phone: '' }]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // overlay loading saat redirect/pindah halaman
  const [redirecting, setRedirecting] = useState(false);

  const updateBuyerInfo = (field: keyof typeof buyerInfo, value: string) => setBuyerInfo((b) => ({ ...b, [field]: value }));
  const addTicketHolder = () => setTicketHolders((v) => [...v, { name: '', email: '', phone: '' }]);
  const removeTicketHolder = (i: number) => setTicketHolders((v) => (v.length > 1 ? v.filter((_, idx) => idx !== i) : v));
  const updateTicketHolder = (i: number, field: 'name'|'email'|'phone', value: string) =>
    setTicketHolders((v) => v.map((h, idx) => (idx === i ? { ...h, [field]: value } : h)));

  const adminFee = 2000;
  const subtotal = useMemo(() => (Number(ticket?.price) || 0) * ticketHolders.length, [ticket?.price, ticketHolders.length]);
  const total = subtotal + adminFee;

  const isBuyerFilled = buyerInfo.name && buyerInfo.email && buyerInfo.phone && buyerInfo.city;
  const isHoldersFilled = ticketHolders.every((h) => h.name && h.email && h.phone);
  const canSubmit = Boolean(isBuyerFilled && isHoldersFilled && !submitting);

  // cek status ke Midtrans, lalu PATCH ke Laravel bila sudah paid
  async function confirmAndPatch(txId: string) {
    const orderId = `TIX-${txId}`;

    const resp = await fetch(`/api/midtrans/status?order_id=${encodeURIComponent(orderId)}`)
      .then(r => r.json())
      .catch(() => null);

    const st = resp?.data?.transaction_status;
    if (st === 'settlement' || st === 'capture') {
      await fetch(`${API_BASE}/dashboard/ticket-transactions/${txId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({
          payment_status: 'paid',
          status: 'paid',
          midtrans_order_id: orderId,
          midtrans_transaction_id: resp?.data?.transaction_id || null,
        }),
      }).catch(() => {});
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isBuyerFilled || !isHoldersFilled) { setErrorMsg('Lengkapi semua data pembeli dan pemegang tiket.'); return; }

    try {
      setSubmitting(true);

      // buat transaksi di backend (pending)
      const th = ticketHolders[0];
      const created = await ticketTransactionService.createTransaction({
        event_id: event.id,
        event_ticket_id: ticket.id,
        ticket_holder_name: th.name,
        ticket_holder_phone: th.phone,
        ticket_holder_email: th.email,
        buyer_name: buyerInfo.name,
        buyer_phone: buyerInfo.phone,
        buyer_email: buyerInfo.email,
        buyer_city: buyerInfo.city,
        payment_method: 'snap', // metode midtrans
        total_amount: total,
      });

      const txUuid: string = created?.transaction?.id || created?.id || created?.uuid;
      if (!txUuid) throw new Error('Gagal membuat transaksi (UUID kosong).');

      // prefetch halaman tiket
      router.prefetch(`/ticket/${txUuid}`);

      const resp = await fetch('/api/midtrans/snap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: `TIX-${txUuid}`,
          gross_amount: total,
          customer: { first_name: buyerInfo.name, email: buyerInfo.email, phone: buyerInfo.phone },
        }),
      }).then(r => r.json());

      if (!resp?.ok || !resp?.transaction?.snap_token) {
        throw new Error(typeof resp?.error === 'string' ? resp.error : 'Gagal membuat transaksi');
      }
      const data = resp.transaction as CreatedTx;

      await loadSnap();
      (window as any).snap.pay(data.snap_token, {
        onSuccess: async () => {
          try {
            await confirmAndPatch(txUuid);

            await fetch(process.env.NEXT_PUBLIC_WA_API_URL!, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.NEXT_PUBLIC_WA_API_KEY!,
              },
              body: JSON.stringify({
                sender: process.env.NEXT_PUBLIC_WA_SENDER!,
                to: buyerInfo.phone,
                message: `Halo ${buyerInfo.name}! 👋\n` +
                        `Pembayaran kamu untuk *${event.title}* sudah *LUNAS* ✅\n\n` +
                        `Tiketmu bisa kamu akses di:\n${process.env.NEXT_PUBLIC_BASE_URL}/ticket/${txUuid}\n\nTerima kasih 🙏`,
              }),
            }).catch(() => {});

            setRedirecting(true);
            router.push(`/ticket/${txUuid}`);
          } catch (e) {
            console.error(e);
            router.push(`/ticket/${txUuid}`);
          }
        },
        onPending: async () => {
          // kalau pending juga bisa langsung patch dan redirect
          await confirmAndPatch(txUuid);
          setRedirecting(true);
          router.push(`/ticket/${txUuid}`);
        },
        onError: () => alert('Pembayaran gagal. Coba lagi.'),
        onClose: () => {},
      });

    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat membuat transaksi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Container className="py-8 md:py-10">
        <div className="mb-6">
          <Link href={`/events/${event.slug}`} className="inline-flex items-center text-sm text-blue-600 hover:underline">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l3.879 3.879a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali ke Acara
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Daftar untuk {event.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Lengkapi data di bawah untuk menyelesaikan pendaftaran.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* left form */}
          <form id="regForm" onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-5 md:p-6">
              <h2 className="mb-4 text-lg font-semibold">Informasi Pembeli</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><label className="mb-1 block text-sm font-medium">Nama Lengkap *</label>
                  <Input value={buyerInfo.name} onChange={(e) => updateBuyerInfo('name', e.target.value)} required /></div>
                <div><label className="mb-1 block text-sm font-medium">Alamat Email *</label>
                  <Input type="email" value={buyerInfo.email} onChange={(e) => updateBuyerInfo('email', e.target.value)} required /></div>
                <div><label className="mb-1 block text-sm font-medium">Nomor Telepon *</label>
                  <Input value={buyerInfo.phone} onChange={(e) => updateBuyerInfo('phone', e.target.value)} required /></div>
                <div><label className="mb-1 block text-sm font-medium">Asal Kota *</label>
                  <Input placeholder="Contoh: Jakarta" value={buyerInfo.city} onChange={(e) => updateBuyerInfo('city', e.target.value)} required /></div>
              </div>
            </Card>

            <Card className="p-5 md:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="max-w-full break-words text-lg font-semibold">Informasi Pemegang Tiket</h2>
                <Button type="button" variant="secondary" onClick={addTicketHolder}>+ Tambah Pemegang</Button>
              </div>

              <div className="space-y-4">
                {ticketHolders.map((h, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="max-w-[70%] truncate text-sm font-medium sm:max-w-none sm:truncate-0">Pemegang Tiket {i + 1}</p>
                      {ticketHolders.length > 1 && (
                        <button type="button" onClick={() => removeTicketHolder(i)} className="text-xs font-medium text-red-600 hover:underline">Hapus</button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div><label className="mb-1 block text-sm font-medium">Nama Lengkap *</label>
                        <Input value={h.name} onChange={(e) => updateTicketHolder(i, 'name', e.target.value)} required /></div>
                      <div><label className="mb-1 block text-sm font-medium">Alamat Email *</label>
                        <Input type="email" value={h.email} onChange={(e) => updateTicketHolder(i, 'email', e.target.value)} required /></div>
                      <div><label className="mb-1 block text-sm font-medium">Nomor Telepon *</label>
                        <Input value={h.phone} onChange={(e) => updateTicketHolder(i, 'phone', e.target.value)} required /></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {errorMsg ? <p className="text-sm text-red-600">{errorMsg}</p> : null}

            <div className="hidden items-center justify-end md:flex">
              <Button type="submit" variant="secondary" className="h-11 px-6" disabled={!canSubmit}>
                {submitting ? 'Memproses…' : 'Lanjutkan Pembayaran'}
              </Button>
            </div>
          </form>

          {/* right summary */}
          <aside className="lg:sticky lg:top-6">
            <Card className="p-5 md:p-6">
              <h3 className="text-base font-semibold">Ringkasan Pembayaran</h3>
              <div className="mt-4 divide-y rounded-lg border">
                <div className="grid grid-cols-2 gap-3 p-4 text-sm">
                  <div className="text-muted-foreground">Tiket</div>
                  <div className="text-right font-medium">{ticket.title} × {ticketHolders.length}</div>
                  <div className="text-muted-foreground">Subtotal</div>
                  <div className="text-right font-medium">{rupiah(subtotal)}</div>
                  <div className="text-muted-foreground">Biaya Admin</div>
                  <div className="text-right font-medium">{rupiah(adminFee)}</div>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-bold text-blue-600">{rupiah(total)}</span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="mb-2 text-sm font-semibold">Detail Acara</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                    {event.location}
                  </p>
                  <p className="flex items-center">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                    {fmtDateTime(event.start_date)}
                  </p>
                  <p className="flex items-center">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                    {fmtDateTime(event.end_date)}
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </Container>

      {/* mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 shadow-[0_-6px_20px_rgba(0,0,0,0.06)] md:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-lg font-bold">{rupiah(total)}</div>
          </div>
          <Button form="regForm" type="submit" variant="secondary" className="h-11 flex-1" disabled={!canSubmit}>
            {submitting ? 'Memproses…' : 'Lanjutkan Pembayaran'}
          </Button>
        </div>
      </div>

      {/* overlay loading saat redirect */}
      {redirecting && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-gray-700">
            <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
            <p className="text-sm">Memproses pembayaran…</p>
          </div>
        </div>
      )}
    </div>
  );
}
