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

// ——— utils
const rupiah = (n: number) => `IDR ${Number(n || 0).toLocaleString('id-ID')}`;
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// WA helper
const toWa = (raw: string) => {
  let s = (raw || '').replace(/\D/g, '');
  if (s.startsWith('0')) s = '62' + s.slice(1);
  return s;
};
async function notifyWA(to: string, message: string) {
  try {
    await fetch('/api/notify-wa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message }),
    });
  } catch {}
}

// ——— payment
type PaymentMethod =
  | 'gopay'
  | 'qris'
  | 'va_bsi'
  | 'va_mandiri'
  | 'va_bri'
  | 'va_cimb'
  | 'va_permata'
  | 'va_danamon'
  | 'va_bjb';

const methodMeta: Record<PaymentMethod, { label: string; logo: string }> = {
  gopay:      { label: 'Gopay',                   logo: 'https://logo.clearbit.com/gojek.com' },
  qris:       { label: 'QRIS',                    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/42/QRIS_logo.svg' },
  va_bsi:     { label: 'BSI Virtual Account',     logo: 'https://logo.clearbit.com/bankbsi.co.id' },
  va_mandiri: { label: 'Mandiri Virtual Account', logo: 'https://logo.clearbit.com/bankmandiri.co.id' },
  va_bri:     { label: 'BRI Virtual Account',     logo: 'https://logo.clearbit.com/bri.co.id' },
  va_cimb:    { label: 'CIMB Virtual Account',    logo: 'https://logo.clearbit.com/cimbniaga.co.id' },
  va_permata: { label: 'Permata Virtual Account', logo: 'https://logo.clearbit.com/permatabank.com' },
  va_danamon: { label: 'Danamon Virtual Account', logo: 'https://logo.clearbit.com/danamon.co.id' },
  va_bjb:     { label: 'BJB Virtual Account',     logo: 'https://logo.clearbit.com/bankbjb.co.id' },
};

const paymentGroups: { title: string; items: PaymentMethod[] }[] = [
  { title: 'Metode Pembayaran', items: ['gopay', 'qris'] },
  {
    title: 'Virtual Account (otomatis diverifikasi)',
    items: [
      'va_bsi',
      'va_mandiri',
      'va_bri',
      'va_cimb',
      'va_permata',
      'va_danamon',
      'va_bjb',
    ],
  },
];

type CreatedTx = {
  id: string; // = UUID transaksi backend
  total_amount?: number | null;
  payment_url?: string | null;
  snap_token?: string | null;
  va_number?: string | null;
  va_bank?: string | null;
};

// muat Snap hanya saat dipakai
function loadSnap() {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).snap) return resolve();
    const s = document.createElement('script');
    s.src =
      process.env.NODE_ENV === 'production'
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
    s.setAttribute(
      'data-client-key',
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
    );
    s.onload = () => resolve();
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

export default function RegistrationForm({
  event,
  ticket,
}: {
  event: Event;
  ticket: EventTicket;
}) {
  const router = useRouter();

  // ——— form states
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
  });
  const [ticketHolders, setTicketHolders] = useState<
    Array<{ name: string; email: string; phone: string }>
  >([{ name: '', email: '', phone: '' }]);

  // ——— payment state
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  // ——— ui
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ——— pay sheet
  const [paySheet, setPaySheet] = useState<{
    open: boolean;
    tx: CreatedTx | null;
    methodKey: PaymentMethod | null;
    methodLabel: string | null;
  }>({ open: false, tx: null, methodKey: null, methodLabel: null });

  // ——— helpers
  const updateBuyerInfo = (
    field: keyof typeof buyerInfo,
    value: string
  ) => setBuyerInfo((b) => ({ ...b, [field]: value }));

  const addTicketHolder = () =>
    setTicketHolders((v) => [...v, { name: '', email: '', phone: '' }]);

  const removeTicketHolder = (index: number) =>
    setTicketHolders((v) =>
      v.length > 1 ? v.filter((_, i) => i !== index) : v
    );

  const updateTicketHolder = (
    index: number,
    field: 'name' | 'email' | 'phone',
    value: string
  ) => setTicketHolders((v) =>
    v.map((h, i) => (i === index ? { ...h, [field]: value } : h))
  );

  // ——— totals
  const adminFee = 5000;
  const subtotal = useMemo(
    () => (Number(ticket?.price) || 0) * ticketHolders.length,
    [ticket?.price, ticketHolders.length]
  );
  const total = subtotal + adminFee;

  const paymentLabel = paymentMethod ? methodMeta[paymentMethod].label : null;

  const isBuyerFilled =
    buyerInfo.name && buyerInfo.email && buyerInfo.phone && buyerInfo.city;
  const isHoldersFilled = ticketHolders.every(
    (h) => h.name && h.email && h.phone
  );
  const canSubmit = Boolean(
    isBuyerFilled && isHoldersFilled && paymentMethod && !submitting
  );

  // ——— submit: BUAT TRANSAKSI → pakai UUID sebagai order_id ke Midtrans
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!paymentMethod) {
      setPaymentOpen(true);
      return;
    }
    if (!isBuyerFilled || !isHoldersFilled) {
      setErrorMsg('Lengkapi semua data pembeli dan pemegang tiket.');
      return;
    }

    try {
      setSubmitting(true);

      // 1) Buat transaksi ke backend → dapat UUID
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
        payment_method: paymentMethod, // simpan preferensi metode
        total_amount: total,
      });

      // Ambil uuid-nya (id pada service = uuid)
      const txUuid: string =
        created?.transaction?.id || created?.id || created?.uuid;

      if (!txUuid) throw new Error('Gagal membuat transaksi (UUID kosong).');

      // 2) Panggil API Midtrans pakai order_id = UUID
      let resp: any;
      if (paymentMethod === 'gopay' || paymentMethod === 'qris') {
        resp = await fetch('/api/midtrans/snap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: txUuid,                   // <<<<<<<<<< HERE
            gross_amount: total,
            enabled_payments: paymentMethod === 'gopay' ? ['gopay'] : ['qris'],
            customer: {
              first_name: buyerInfo.name,
              email: buyerInfo.email,
              phone: buyerInfo.phone,
            },
          }),
        }).then((r) => r.json());
      } else {
        resp = await fetch('/api/midtrans/va', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: txUuid,                   // <<<<<<<<<< HERE
            gross_amount: total,
            bank_key: paymentMethod, // 'va_bri'|'va_mandiri'|...
            customer: {
              first_name: buyerInfo.name,
              email: buyerInfo.email,
              phone: buyerInfo.phone,
            },
          }),
        }).then((r) => r.json());
      }

      if (!resp?.ok) throw new Error(resp?.error || 'Gagal membuat transaksi');

      const data = resp.transaction as CreatedTx;

      // 3) Kirim WA (link tiket FE pakai origin FE)
      const appOrigin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const linkTiket = `${appOrigin}/ticket/${txUuid}`;

      const lines: string[] = [
        `Halo ${buyerInfo.name || 'Sahabat MJFest'} 👋`,
        `Terima kasih sudah mendaftar: *${event.title}*`,
        ``,
        `Total: *${rupiah(total)}*`,
      ];
      if (data.snap_token) {
        lines.push('Metode: GoPay/QRIS (Midtrans). Setelah berhasil, tiket langsung aktif.');
      } else if (data.va_number) {
        lines.push(`Metode: VA ${data.va_bank?.toUpperCase() || ''}`);
        lines.push(`Nomor VA: *${data.va_number}*`);
      } else if (data.payment_url) {
        lines.push('Selesaikan pembayaran lewat tautan berikut.');
      }
      lines.push('', `Link tiketmu: ${linkTiket}`, '', '— Panitia MJFest');
      notifyWA(toWa(buyerInfo.phone), lines.join('\n'));

      // 4) Tampilkan sheet / lanjut ke tiket
      const txForSheet: CreatedTx = {
        id: txUuid,
        total_amount: total,
        payment_url: data?.payment_url ?? null,
        snap_token: data?.snap_token ?? null,
        va_number: data?.va_number ?? null,
        va_bank: data?.va_bank ?? null,
      };

      if (txForSheet.payment_url || txForSheet.va_number || txForSheet.snap_token) {
        setPaySheet({
          open: true,
          tx: txForSheet,
          methodKey: paymentMethod,
          methodLabel: paymentLabel,
        });
      } else {
        router.push(`/ticket/${txUuid}`);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat membuat transaksi.');
    } finally {
      setSubmitting(false);
    }
  };

  // ——— klik “Lanjutkan Pembayaran”
  const onProceedPayment = async () => {
    if (paySheet.tx?.snap_token) {
      try {
        await loadSnap();
        (window as any).snap.pay(paySheet.tx.snap_token, {
          onSuccess: () => router.push(`/ticket/${paySheet.tx!.id}`),
          onPending: () => router.push(`/ticket/${paySheet.tx!.id}`),
          onError: () => alert('Pembayaran gagal. Coba lagi.'),
          onClose: () => {},
        });
      } catch {
        alert('Gagal memuat Midtrans Snap.');
      }
      return;
    }
    if (paySheet.tx?.payment_url) {
      window.location.href = paySheet.tx.payment_url!;
      return;
    }
    if (paySheet.tx?.id) {
      router.push(`/ticket/${paySheet.tx.id}`);
    }
  };

  const copyVA = async () => {
    if (!paySheet.tx?.va_number) return;
    try {
      await navigator.clipboard.writeText(paySheet.tx.va_number);
      alert('Nomor VA disalin.');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-white">
      <Container className="py-8 md:py-10">
        {/* back */}
        <div className="mb-6">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center text-sm text-blue-600 hover:underline"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.293 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l3.879 3.879a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Kembali ke Acara
          </Link>
        </div>

        {/* heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Daftar untuk {event.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lengkapi data di bawah untuk menyelesaikan pendaftaran.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* left form */}
          <form id="regForm" onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-5 md:p-6">
              <h2 className="mb-4 text-lg font-semibold">Informasi Pembeli</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Nama Lengkap *
                  </label>
                  <Input
                    value={buyerInfo.name}
                    onChange={(e) => updateBuyerInfo('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Alamat Email *
                  </label>
                  <Input
                    type="email"
                    value={buyerInfo.email}
                    onChange={(e) => updateBuyerInfo('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Nomor Telepon *
                  </label>
                  <Input
                    value={buyerInfo.phone}
                    onChange={(e) => updateBuyerInfo('phone', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Asal Kota *
                  </label>
                  <Input
                    placeholder="Contoh: Jakarta"
                    value={buyerInfo.city}
                    onChange={(e) => updateBuyerInfo('city', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Metode Pembayaran</p>
                  <div className="flex items-center gap-2 truncate text-sm text-muted-foreground">
                    {paymentMethod ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={methodMeta[paymentMethod].logo}
                          alt=""
                          className="h-4 w-auto"
                        />
                        <span>{methodMeta[paymentMethod].label}</span>
                      </>
                    ) : (
                      <span>Belum dipilih</span>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPaymentOpen(true)}
                >
                  Pilih Metode Pembayaran
                </Button>
              </div>
            </Card>

            <Card className="p-5 md:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="max-w-full break-words text-lg font-semibold">
                  Informasi Pemegang Tiket
                </h2>
                <Button type="button" variant="secondary" onClick={addTicketHolder}>
                  + Tambah Pemegang
                </Button>
              </div>

              <div className="space-y-4">
                {ticketHolders.map((holder, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="max-w-[70%] truncate text-sm font-medium sm:max-w-none sm:truncate-0">
                        Pemegang Tiket {index + 1}
                      </p>
                      {ticketHolders.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeTicketHolder(index)}
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          Hapus
                        </button>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Nama Lengkap *
                        </label>
                        <Input
                          value={holder.name}
                          onChange={(e) =>
                            updateTicketHolder(index, 'name', e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Alamat Email *
                        </label>
                        <Input
                          type="email"
                          value={holder.email}
                          onChange={(e) =>
                            updateTicketHolder(index, 'email', e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Nomor Telepon *
                        </label>
                        <Input
                          value={holder.phone}
                          onChange={(e) =>
                            updateTicketHolder(index, 'phone', e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {errorMsg ? <p className="text-sm text-red-600">{errorMsg}</p> : null}

            {/* desktop CTA */}
            <div className="hidden items-center justify-end md:flex">
              <Button type="submit" variant="secondary" className="h-11 px-6" disabled={!canSubmit}>
                {submitting ? 'Memproses…' : 'Bayar Sekarang'}
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
                  <div className="text-right font-medium">
                    {ticket.title} × {ticketHolders.length}
                  </div>

                  <div className="text-muted-foreground">Subtotal</div>
                  <div className="text-right font-medium">{rupiah(subtotal)}</div>

                  <div className="text-muted-foreground">Biaya Admin</div>
                  <div className="text-right font-medium">{rupiah(adminFee)}</div>

                  <div className="text-muted-foreground">Metode</div>
                  <div className="flex items-center justify-end gap-2">
                    {paymentMethod ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={methodMeta[paymentMethod].logo}
                          alt=""
                          className="h-4 w-auto"
                        />
                        <span className="font-medium">
                          {methodMeta[paymentMethod].label}
                        </span>
                      </>
                    ) : (
                      <span className="font-medium">-</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-bold text-blue-600">
                    {rupiah(total)}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="mb-2 text-sm font-semibold">Detail Acara</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {event.location}
                  </p>
                  <p className="flex items-center">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {fmtDateTime(event.start_date)}
                  </p>
                  <p className="flex items-center">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {fmtDateTime(event.end_date)}
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </Container>

      {/* mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 shadow-[0_-6px_20px_rgba(0,0,0,0.06)] md:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Metode</div>
            <div className="flex items-center gap-2 truncate">
              {paymentMethod ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={methodMeta[paymentMethod].logo}
                    alt=""
                    className="h-4 w-auto"
                  />
                  <span className="text-sm">{methodMeta[paymentMethod].label}</span>
                </>
              ) : (
                <span className="text-sm">-</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-lg font-bold">{rupiah(total)}</div>
          </div>
          {paymentMethod ? (
            <Button
              form="regForm"
              type="submit"
              variant="secondary"
              className="h-11 flex-1"
              disabled={!canSubmit}
              title={!canSubmit ? 'Lengkapi data' : ''}
            >
              {submitting ? 'Memproses…' : 'Lanjutkan Pembayaran'}
            </Button>
          ) : (
            <Button type="button" variant="secondary" className="h-11" onClick={() => setPaymentOpen(true)}>
              Pilih Metode
            </Button>
          )}
        </div>
      </div>

      {/* modal pilih metode */}
      {paymentOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Pilih Metode Pembayaran"
          onClick={() => setPaymentOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-base font-semibold">Pilih Metode Pembayaran</h3>
              <button
                onClick={() => setPaymentOpen(false)}
                aria-label="Tutup"
                className="rounded p-1 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              {paymentGroups.map((group) => (
                <div key={group.title} className="mb-5">
                  <div className="mb-2 rounded bg-gray-100 px-3 py-2 text-sm font-semibold">
                    {group.title}
                  </div>
                  <ul className="space-y-2">
                    {group.items.map((key) => (
                      <li key={key}>
                        <button
                          onClick={() => {
                            setPaymentMethod(key);
                            setPaymentOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left hover:border-blue-300"
                        >
                          <span className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={methodMeta[key].logo} alt="" className="h-5 w-auto" />
                            <span>{methodMeta[key].label}</span>
                          </span>
                          {paymentMethod === key ? (
                            <span className="text-sm font-medium text-blue-600">Dipilih</span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
              <Button variant="secondary" onClick={() => setPaymentOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* sheet pembayaran */}
      {paySheet.open && paySheet.tx && (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-4 md:items-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setPaySheet((s) => ({ ...s, open: false }))}
        >
          <div
            className="w-full max-w-lg rounded-t-2xl bg-white shadow-xl md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-base font-semibold">Pembayaran</h3>
              <button
                className="rounded p-1 hover:bg-gray-100"
                onClick={() => setPaySheet((s) => ({ ...s, open: false }))}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Metode</span>
                  <span className="flex items-center gap-2 font-medium">
                    {paySheet.methodKey ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={methodMeta[paySheet.methodKey].logo}
                          alt=""
                          className="h-4 w-auto"
                        />
                        {methodMeta[paySheet.methodKey].label}
                      </>
                    ) : (
                      '-'
                    )}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Dibayar</span>
                  <span className="font-semibold text-blue-600">
                    {rupiah(Number(paySheet.tx.total_amount ?? total))}
                  </span>
                </div>

                {/* detil VA */}
                {paySheet.tx.va_number ? (
                  <div className="mt-4 rounded-md bg-gray-50 p-3">
                    <div className="text-xs text-muted-foreground">
                      Nomor VA {paySheet.tx.va_bank ? `(${String(paySheet.tx.va_bank).toUpperCase()})` : ''}
                    </div>
                    <div className="mt-1 font-mono text-lg font-semibold">
                      {paySheet.tx.va_number}
                    </div>
                    <div className="mt-2">
                      <Button type="button" variant="secondary" onClick={copyVA}>
                        Salin Nomor VA
                      </Button>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <p className="font-medium">Cara bayar (ringkas):</p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Buka mobile banking / ATM bank yang sama.</li>
                        <li>Pilih menu <b>Virtual Account</b>.</li>
                        <li>Masukkan nomor VA di atas lalu konfirmasi.</li>
                        <li>Bayar sesuai total & selesaikan transaksi.</li>
                      </ol>
                      <p className="text-xs text-muted-foreground">
                        Status akan otomatis jadi <b>LUNAS</b> setelah pembayaran terverifikasi.
                      </p>
                    </div>
                  </div>
                ) : null}

                {!paySheet.tx.payment_url && !paySheet.tx.va_number && !paySheet.tx.snap_token ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Detail pembayaran akan ditampilkan di halaman tiket. Klik lanjutkan.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
              <Button
                variant="secondary"
                onClick={() => setPaySheet((s) => ({ ...s, open: false }))}
              >
                Nanti Saja
              </Button>
              <Button onClick={onProceedPayment}>Lanjutkan Pembayaran</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
