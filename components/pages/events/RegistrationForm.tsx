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

// Utils
const rupiah = (n: number) => `IDR ${Number(n || 0).toLocaleString('id-ID')}`;
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// Payment Methods
type PaymentMethod =
  | 'gopay' | 'qris'
  | 'va_bsi' | 'va_mandiri' | 'va_bri' | 'va_cimb' | 'va_permata' | 'va_danamon' | 'va_bjb';

const paymentGroups: { title: string; items: { key: PaymentMethod; label: string }[] }[] = [
  { title: 'Metode Pembayaran', items: [{ key: 'gopay', label: 'Gopay' }, { key: 'qris', label: 'QRIS' }] },
  {
    title: 'Virtual Account (otomatis diverifikasi)',
    items: [
      { key: 'va_bsi', label: 'BSI Virtual Account' },
      { key: 'va_mandiri', label: 'Mandiri Virtual Account' },
      { key: 'va_bri', label: 'BRI Virtual Account' },
      { key: 'va_cimb', label: 'CIMB Virtual Account' },
      { key: 'va_permata', label: 'Permata Virtual Account' },
      { key: 'va_danamon', label: 'Danamon Virtual Account' },
      { key: 'va_bjb', label: 'BJB Virtual Account' },
    ],
  },
];

type CreatedTx = {
  id: string; // uuid
  payment_url?: string | null;
  va_number?: string | null;
  va_bank?: string | null;
  total_amount?: number;
};

export default function RegistrationForm({ event, ticket }: { event: Event; ticket: EventTicket }) {
  const router = useRouter();

  // Data Pembeli
  const [buyerInfo, setBuyerInfo] = useState({ name: '', email: '', phone: '', city: '' });

  // Minimal 1 Pemegang Tiket
  const [ticketHolders, setTicketHolders] = useState<Array<{ name: string; email: string; phone: string }>>([
    { name: '', email: '', phone: '' },
  ]);

  // Pembayaran
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  // UI
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sheet Pembayaran
  const [paySheet, setPaySheet] = useState<{
    open: boolean;
    tx: CreatedTx | null;
    methodKey: PaymentMethod | null;
    methodLabel: string | null;
  }>({ open: false, tx: null, methodKey: null, methodLabel: null });

  // Helpers
  const updateBuyerInfo = (field: keyof typeof buyerInfo, value: string) =>
    setBuyerInfo((b) => ({ ...b, [field]: value }));

  const addTicketHolder = () => setTicketHolders((v) => [...v, { name: '', email: '', phone: '' }]);
  const removeTicketHolder = (index: number) =>
    setTicketHolders((v) => (v.length > 1 ? v.filter((_, i) => i !== index) : v));
  const updateTicketHolder = (index: number, field: 'name' | 'email' | 'phone', value: string) =>
    setTicketHolders((v) => v.map((h, i) => (i === index ? { ...h, [field]: value } : h)));

  // Totals
  const adminFee = 5000;
  const subtotal = useMemo(() => (Number(ticket?.price) || 0) * ticketHolders.length, [ticket?.price, ticketHolders.length]);
  const total = subtotal + adminFee;

  const paymentLabel =
    paymentMethod && paymentGroups.flatMap((g) => g.items).find((i) => i.key === paymentMethod)?.label || null;

  const isBuyerFilled = buyerInfo.name && buyerInfo.email && buyerInfo.phone && buyerInfo.city;
  const isHoldersFilled = ticketHolders.every((h) => h.name && h.email && h.phone);
  const canSubmit = Boolean(isBuyerFilled && isHoldersFilled && paymentMethod && !submitting);

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

      const holder = ticketHolders[0];

      const payload = {
        event_id: event.id,
        event_ticket_id: ticket.id,

        ticket_holder_name: holder.name,
        ticket_holder_email: holder.email,
        ticket_holder_phone: holder.phone,

        buyer_name: buyerInfo.name,
        buyer_email: buyerInfo.email,
        buyer_phone: buyerInfo.phone,
        buyer_city: buyerInfo.city,
        buyer_gender: null,

        payment_method: paymentMethod,
        total_amount: total,
      };

      // Expect backend balikin { transaction, payment_url?, va_number?, va_bank? }
      const res = await ticketTransactionService.createTransaction(payload);
      // Support dua bentuk: kalau backend balikin langsung objek transaksi => res.id ada;
      // kalau balikin wrapper {transaction, payment_url,...}
      const tx: CreatedTx =
        res && 'id' in (res as any)
          ? (res as CreatedTx)
          : res && (res as any).transaction
          ? { ...(res as any).transaction, payment_url: (res as any).payment_url, va_number: (res as any).va_number, va_bank: (res as any).va_bank }
          : (res as CreatedTx);

      // Kalau ada info payment, tampilkan sheet pembayaran.
      if (tx?.payment_url || tx?.va_number) {
        setPaySheet({
          open: true,
          tx,
          methodKey: paymentMethod,
          methodLabel: paymentLabel,
        });
      } else {
        // Fallback: langsung ke halaman tiket (status masih pending)
        router.push(`/ticket/${tx.id}`);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat membuat transaksi.');
    } finally {
      setSubmitting(false);
    }
  };

  const onProceedPayment = () => {
    const url = paySheet.tx?.payment_url;
    if (url) {
      window.location.href = url;
      return;
    }
    // Kalau VA tanpa payment_url, arahkan ke halaman tiket (instruksi lengkap bisa tampil di sana)
    if (paySheet.tx?.id) {
      router.push(`/ticket/${paySheet.tx.id}`);
    }
  };

  const copyVA = async () => {
    if (!paySheet.tx?.va_number) return;
    try {
      await navigator.clipboard.writeText(paySheet.tx.va_number);
      alert('Nomor VA disalin.');
    } catch {
      /* noop */
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Container className="py-8 md:py-10">
        {/* Back */}
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
          {/* Form kiri */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-5 md:p-6">
              <h2 className="mb-4 text-lg font-semibold">Informasi Pembeli</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Nama Lengkap *</label>
                  <Input value={buyerInfo.name} onChange={(e) => updateBuyerInfo('name', e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Alamat Email *</label>
                  <Input type="email" value={buyerInfo.email} onChange={(e) => updateBuyerInfo('email', e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Nomor Telepon *</label>
                  <Input value={buyerInfo.phone} onChange={(e) => updateBuyerInfo('phone', e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Asal Kota *</label>
                  <Input placeholder="Contoh: Jakarta" value={buyerInfo.city} onChange={(e) => updateBuyerInfo('city', e.target.value)} required />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Metode Pembayaran</p>
                  <p className="truncate text-sm text-muted-foreground">{paymentLabel ? paymentLabel : 'Belum dipilih'}</p>
                </div>
                <Button type="button" variant="secondary" onClick={() => setPaymentOpen(true)}>
                  Pilih Metode Pembayaran
                </Button>
              </div>
            </Card>

            <Card className="p-5 md:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="max-w-full break-words text-lg font-semibold">Informasi Pemegang Tiket</h2>
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
                        <button type="button" onClick={() => removeTicketHolder(index)} className="text-xs font-medium text-red-600 hover:underline">
                          Hapus
                        </button>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium">Nama Lengkap *</label>
                        <Input value={holder.name} onChange={(e) => updateTicketHolder(index, 'name', e.target.value)} required />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Alamat Email *</label>
                        <Input type="email" value={holder.email} onChange={(e) => updateTicketHolder(index, 'email', e.target.value)} required />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Nomor Telepon *</label>
                        <Input value={holder.phone} onChange={(e) => updateTicketHolder(index, 'phone', e.target.value)} required />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {errorMsg ? <p className="text-sm text-red-600">{errorMsg}</p> : null}

            <div className="flex items-center justify-end">
              <Button type="submit" className="h-11 px-6" disabled={!canSubmit}>
                {submitting ? 'Memproses…' : 'Bayar Sekarang'}
              </Button>
            </div>
          </form>

          {/* Ringkasan */}
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
                  <div className="text-right font-medium">{paymentLabel ? paymentLabel : '-'}</div>
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
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9z" clipRule="evenodd" />
                    </svg>
                    {event.location}
                  </p>
                  <p className="flex items-center">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {fmtDateTime(event.start_date)}
                  </p>
                  <p className="flex items-center">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {fmtDateTime(event.end_date)}
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </Container>

      {/* Modal Pilih Metode */}
      {paymentOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Pilih Metode Pembayaran" onClick={() => setPaymentOpen(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-base font-semibold">Pilih Metode Pembayaran</h3>
              <button onClick={() => setPaymentOpen(false)} aria-label="Tutup" className="rounded p-1 hover:bg-gray-100">✕</button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              {paymentGroups.map((group) => (
                <div key={group.title} className="mb-5">
                  <div className="mb-2 rounded bg-gray-100 px-3 py-2 text-sm font-semibold">{group.title}</div>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item.key}>
                        <button
                          onClick={() => {
                            setPaymentMethod(item.key);
                            setPaymentOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left hover:border-blue-300"
                        >
                          <span className="flex items-center gap-3">
                            <span className="inline-block h-6 w-6 rounded-full bg-gray-200" />
                            <span>{item.label}</span>
                          </span>
                          {paymentMethod === item.key ? <span className="text-sm font-medium text-blue-600">Dipilih</span> : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
              <Button variant="secondary" onClick={() => setPaymentOpen(false)}>Tutup</Button>
              <Button onClick={() => setPaymentOpen(false)} disabled={!paymentMethod} title={!paymentMethod ? 'Pilih salah satu metode dulu' : ''}>
                Pakai Metode Ini
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sheet Pembayaran (muncul setelah createTransaction) */}
      {paySheet.open && paySheet.tx && (
        <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={() => setPaySheet((s) => ({ ...s, open: false }))}>
          <div className="w-full max-w-lg rounded-t-2xl md:rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b px-5 py-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">Pembayaran</h3>
              <button className="rounded p-1 hover:bg-gray-100" onClick={() => setPaySheet((s) => ({ ...s, open: false }))}>✕</button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Metode</span>
                  <span className="font-medium">{paySheet.methodLabel || '-'}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Dibayar</span>
                  <span className="font-semibold text-blue-600">
                    {rupiah(Number(paySheet.tx.total_amount ?? total))}
                  </span>
                </div>

                {/* VA detail */}
                {paySheet.tx.va_number ? (
                  <div className="mt-4 rounded-md bg-gray-50 p-3">
                    <div className="text-xs text-muted-foreground">Nomor VA {paySheet.tx.va_bank ? `(${paySheet.tx.va_bank})` : ''}</div>
                    <div className="mt-1 font-mono text-lg font-semibold">{paySheet.tx.va_number}</div>
                    <div className="mt-2">
                      <Button type="button" variant="secondary" onClick={copyVA}>Salin Nomor VA</Button>
                    </div>
                  </div>
                ) : null}

                {/* Instruksi singkat */}
                {!paySheet.tx.payment_url && !paySheet.tx.va_number ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Detail pembayaran akan ditampilkan di halaman tiket. Klik lanjutkan untuk melihat instruksi.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="border-t px-5 py-4 flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => setPaySheet((s) => ({ ...s, open: false }))}>Nanti Saja</Button>
              <Button onClick={onProceedPayment}>
                Lanjutkan Pembayaran
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
