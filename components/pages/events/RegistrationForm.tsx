'use client';

import type { Event, EventTicket } from '@/types';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Container from '@/components/ui/Container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

/* -------------------- Helpers -------------------- */
const rupiah = (n: number) => `IDR ${Number(n || 0).toLocaleString('id-ID')}`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

const fmtDateRange = (startISO?: string, endISO?: string) => {
  if (!startISO) return '-';
  if (!endISO) return `${fmtDate(startISO)} pukul ${fmtTime(startISO)}`;
  const s = new Date(startISO);
  const e = new Date(endISO);
  const sameDay =
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate();
  if (sameDay)
    return `${fmtDate(startISO)} pukul ${fmtTime(startISO)} - ${fmtTime(endISO)}`;
  return `${fmtDate(startISO)} ${fmtTime(startISO)} - ${fmtDate(endISO)} ${fmtTime(
    endISO,
  )}`;
};

/* -------------------- CitySelect -------------------- */
function CitySelect({
  value,
  onChange,
  placeholder = 'Cari & pilih kota (cth: Bandung)',
  required = true,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/data/kota-indonesia.json', { cache: 'force-cache' });
        const arr = (await res.json()) as string[];
        setAllCities(Array.isArray(arr) ? arr : []);
      } catch {
        setAllCities([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!open) setQuery(value || '');
  }, [open, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCities.slice(0, 200);
    return allCities.filter((c) => c.toLowerCase().includes(q)).slice(0, 200);
  }, [allCities, query]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = filtered[highlight];
      if (pick) {
        onChange(pick);
        setOpen(false);
      }
    } else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative z-50">
      <input tabIndex={-1} className="sr-only" value={value} readOnly required={required} />
      <Input
        inputMode="search"
        className="bg-white"
        placeholder={placeholder}
        value={open ? query : value}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        autoComplete="new-password"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      {open && (
        <div className="absolute z-[9999] mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Ketik untuk mencari kota.
          </div>
          <div ref={listRef} className="max-h-64 overflow-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500">Tidak ada hasil.</div>
            ) : (
              filtered.map((c, i) => {
                const isActive = i === highlight;
                return (
                  <button
                    type="button"
                    key={c}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'
                    }`}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => {
                      onChange(c);
                      setOpen(false);
                    }}
                  >
                    <span>{c}</span>
                    {value === c && (
                      <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L8.5 12.586l6.793-6.793a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- Midtrans Loader -------------------- */
function loadSnap() {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).snap) return resolve();
    const s = document.createElement('script');
    const SNAP_IS_PROD =
      String(process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION ?? 'false').toLowerCase() === 'true';
    s.src = SNAP_IS_PROD
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    s.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    s.onload = () => resolve();
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

/* -------------------- Main Form -------------------- */
type StoreResp = {
  success: boolean;
  message?: string;
  data?: { order_id: string; snap_token: string };
};

export default function RegistrationForm({
  event,
  ticket,
}: {
  event: Event;
  ticket: EventTicket;
}) {
  const router = useRouter();

  const [buyerInfo, setBuyerInfo] = useState({ name: '', email: '', phone: '', city: '' });
  const [ticketHolders, setTicketHolders] = useState([{ name: '', email: '', phone: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const updateBuyerInfo = (field: keyof typeof buyerInfo, value: string) =>
    setBuyerInfo((b) => ({ ...b, [field]: value }));
  const addTicketHolder = () =>
    setTicketHolders((v) => [...v, { name: '', email: '', phone: '' }]);
  const removeTicketHolder = (i: number) =>
    setTicketHolders((v) => (v.length > 1 ? v.filter((_, idx) => idx !== i) : v));
  const updateTicketHolder = (i: number, field: 'name' | 'email' | 'phone', value: string) =>
    setTicketHolders((v) => v.map((h, idx) => (idx === i ? { ...h, [field]: value } : h)));

  const adminFee = 2000;
  const subtotal = useMemo(
    () => (Number(ticket?.price) || 0) * ticketHolders.length,
    [ticket?.price, ticketHolders.length],
  );
  const total = subtotal + adminFee;

  const isBuyerFilled = buyerInfo.name && buyerInfo.email && buyerInfo.phone && buyerInfo.city;
  const isHoldersFilled = ticketHolders.every((h) => h.name && h.email && h.phone);
  const canSubmit = Boolean(isBuyerFilled && isHoldersFilled && !submitting);

  const resetSnapArtifacts = useCallback(() => {
    const html = document.documentElement;
    const body = document.body;
    ['overflow', 'paddingRight', 'marginRight', 'position', 'height', 'width'].forEach((k) => {
      // @ts-ignore
      html.style[k] = '';
      // @ts-ignore
      body.style[k] = '';
    });
    ['snap-body', 'snap-open', 'modal-open', 'swal2-shown'].forEach((cls) => {
      html.classList.remove(cls);
      body.classList.remove(cls);
    });
  }, []);

  async function confirmOnServer(orderId: string): Promise<string | null> {
    const resp = await fetch(`${API_BASE}/dashboard/payment/midtrans/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify({ order_id: orderId }),
    })
      .then((r) => r.json())
      .catch(() => null as any);
    return resp?.success ? (resp?.uuid as string) : null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!isBuyerFilled || !isHoldersFilled) {
      setErrorMsg('Lengkapi semua data pembeli dan pemegang tiket.');
      return;
    }
    try {
      setSubmitting(true);
      const th = ticketHolders[0];
      const created: StoreResp = await fetch(`${API_BASE}/dashboard/ticket-transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({
          event_id: event.id,
          event_ticket_id: ticket.id,
          ticket_holder_name: th.name,
          ticket_holder_phone: th.phone,
          ticket_holder_email: th.email,
          buyer_name: buyerInfo.name,
          buyer_phone: buyerInfo.phone,
          buyer_email: buyerInfo.email,
          buyer_city: buyerInfo.city,
          payment_method: 'snap',
        }),
      }).then((r) => r.json());
      const orderId = created?.data?.order_id;
      const snapToken = created?.data?.snap_token;
      if (!orderId || !snapToken)
        throw new Error('Gagal membuat transaksi (order_id/snap_token kosong).');
      await loadSnap();
      (window as any).snap.pay(snapToken, {
        onSuccess: async () => {
          const uuid = await confirmOnServer(orderId);
          setRedirecting(true);
          resetSnapArtifacts();
          if (uuid) router.push(`/ticket/${uuid}`);
        },
        onPending: async () => {
          const uuid = await confirmOnServer(orderId);
          setRedirecting(true);
          resetSnapArtifacts();
          if (uuid) router.push(`/ticket/${uuid}`);
        },
        onError: () => {
          setErrorMsg('Pembayaran gagal. Coba lagi.');
          resetSnapArtifacts();
        },
        onClose: resetSnapArtifacts,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat membuat transaksi.');
    } finally {
      setSubmitting(false);
      resetSnapArtifacts();
    }
  };

  return (
    <div className="min-h-screen bg-white antialiased">
      <div className="border-b bg-white">
        <Container className="py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={`/events/${event.slug}`}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
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

          <div className="mt-3">
            <h1 className="text-2xl font-bold md:text-3xl">
              Daftar untuk <span className="text-blue-700">{event.title}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Lengkapi data di bawah untuk menyelesaikan pendaftaran kamu.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-8 md:py-10">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* FORM */}
          <form id="regForm" onSubmit={handleSubmit} className="space-y-6">
            <Card className="overflow-visible border-slate-200 p-0 shadow-sm">
              <div className="border-b bg-slate-50 px-5 py-4 md:px-6">
                <h2 className="text-base font-semibold">Informasi Pembeli</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Data ini digunakan untuk invoice & notifikasi.
                </p>
              </div>
              <div className="px-5 py-5 md:px-6 md:py-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Nama Lengkap *</label>
                    <Input
                      className="bg-white"
                      placeholder="Nama sesuai KTP"
                      value={buyerInfo.name}
                      onChange={(e) => updateBuyerInfo('name', e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Alamat Email *</label>
                    <Input
                      className="bg-white"
                      type="email"
                      placeholder="nama@email.com"
                      value={buyerInfo.email}
                      onChange={(e) => updateBuyerInfo('email', e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Nomor Telepon *</label>
                    <Input
                      className="bg-white"
                      inputMode="tel"
                      placeholder="08xxxxxxxxxx"
                      value={buyerInfo.phone}
                      onChange={(e) => updateBuyerInfo('phone', e.target.value)}
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Asal Kota *</label>
                    <CitySelect
                      value={buyerInfo.city}
                      onChange={(v) => updateBuyerInfo('city', v)}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-visible border-slate-200 p-0 shadow-sm">
              <div className="flex items-center justify-between border-b bg-slate-50 px-5 py-4 md:px-6">
                <div>
                  <h2 className="text-base font-semibold">Informasi Pemegang Tiket</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Nama akan muncul pada tiket & QR check-in.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={addTicketHolder}
                  className="h-9 rounded-full bg-white px-4 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
                >
                  + Tambah Pemegang
                </Button>
              </div>

              <div className="px-5 py-5 md:px-6 md:py-6">
                <div className="space-y-4">
                  {ticketHolders.map((h, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_0_rgba(15,23,42,0.03)]"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="max-w-[70%] truncate text-sm font-medium sm:max-w-none">
                          Pemegang Tiket {i + 1}
                        </p>
                        {ticketHolders.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTicketHolder(i)}
                            className="rounded-full px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            Hapus
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-sm font-medium">Nama Lengkap *</label>
                          <Input
                            className="bg-white"
                            placeholder="Nama lengkap"
                            value={h.name}
                            onChange={(e) => updateTicketHolder(i, 'name', e.target.value)}
                            autoComplete="off"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium">Alamat Email *</label>
                          <Input
                            className="bg-white"
                            type="email"
                            placeholder="email@contoh.com"
                            value={h.email}
                            onChange={(e) => updateTicketHolder(i, 'email', e.target.value)}
                            autoComplete="off"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium">Nomor Telepon *</label>
                          <Input
                            className="bg-white"
                            inputMode="tel"
                            placeholder="08xxxxxxxxxx"
                            value={h.phone}
                            onChange={(e) => updateTicketHolder(i, 'phone', e.target.value)}
                            autoComplete="off"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {errorMsg ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMsg}
              </div>
            ) : null}
          </form>

          {/* RINGKASAN + TOMBOL (DESKTOP SAJA) */}
          <aside className="lg:sticky lg:top-6">
            <Card className="overflow-hidden border-slate-200 shadow-sm">
              <div className="border-b bg-slate-50 px-5 py-4 md:px-6">
                <h3 className="text-base font-semibold">Ringkasan Pembayaran</h3>
              </div>

              <div className="space-y-6 px-5 py-5 md:px-6 md:py-6">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="divide-y text-sm">
                    <div className="grid grid-cols-2 gap-3 p-4">
                      <div className="text-slate-500">Tiket</div>
                      <div className="text-right font-medium">
                        {ticket.title} × {ticketHolders.length}
                      </div>

                      <div className="text-slate-500">Subtotal</div>
                      <div className="text-right font-medium">{rupiah(subtotal)}</div>

                      <div className="text-slate-500">Biaya Admin</div>
                      <div className="text-right font-medium">{rupiah(adminFee)}</div>
                    </div>

                    <div className="flex items-center justify-between bg-blue-50 px-4 py-3">
                      <span className="text-sm font-semibold text-blue-700">Total</span>
                      <span className="text-lg font-bold text-blue-700">{rupiah(total)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold">Detail Acara</h4>
                  <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
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
                    <p className="flex items-start">
                      <svg className="mr-2 mt-0.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {fmtDateRange(event.start_date, event.end_date)}
                    </p>
                  </div>
                </div>

                {/* Tombol khusus desktop (md+) di dalam ringkasan */}
                <div className="hidden md:flex">
                  <Button
                    form="regForm"
                    type="submit"
                    className="h-11 w-full rounded-full bg-blue-700 font-semibold text-white shadow-md hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                    disabled={!canSubmit}
                  >
                    {submitting ? 'Memproses…' : 'Lanjutkan Pembayaran'}
                  </Button>
                </div>

                <p className="text-center text-[11px] leading-relaxed text-slate-500">
                  Dengan melanjutkan, Anda menyetujui <span className="underline">Syarat & Ketentuan</span>{' '}
                  serta <span className="underline">Kebijakan Privasi</span>.
                </p>
              </div>
            </Card>
          </aside>
        </div>
      </Container>

      {/* Spacer untuk menghindari ketutup bottom bar di mobile */}
      <div className="h-[88px] md:hidden" />

      {/* Bottom bar hanya di MOBILE */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="text-xs text-slate-500">Total</div>
            <div className="truncate text-lg font-bold">{rupiah(total)}</div>
          </div>
          <Button
            form="regForm"
            type="submit"
            className="h-11 flex-1 rounded-full bg-blue-700 font-semibold text-white shadow-md hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            disabled={!canSubmit}
          >
            {submitting ? 'Memproses…' : 'Lanjutkan Pembayaran'}
          </Button>
        </div>
      </div>

      {redirecting && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-white/80">
          <div className="flex flex-col items-center gap-3 text-gray-700">
            <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <p className="text-sm">Memproses pembayaran…</p>
          </div>
        </div>
      )}
    </div>
  );
}
