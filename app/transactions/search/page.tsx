'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type TicketTx = {
  id: string;
  event_id: number;
  event_ticket_id: number;
  ticket_holder_name: string | null;
  ticket_holder_phone: string | null;
  ticket_holder_email: string | null;
  buyer_name: string | null;
  buyer_phone: string | null;
  buyer_email: string | null;
  payment_method: string | null;
  payment_status: string | null;
  status: string | null;
  created_at: string | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

const onlyDigits = (s: string) => s.replace(/\D+/g, '');
const isFullPhone = (s: string) => {
  const d = onlyDigits(s);
  return d.length >= 10 && d.length <= 15;
};
const fmtID = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

export default function PublicSearchTransactionsPage() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TicketTx[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const goDetail = (id: string) => router.push(`/ticket/${id}`);
  const goBack = () => router.back();

  const doSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErr(null);
    setRows([]);

    if (!isFullPhone(q)) {
      setErr('Masukkan nomor HP lengkap yang valid (10–15 digit).');
      return;
    }

    setLoading(true);
    try {
      const url = `${API_BASE}/transactions/search?phone=${encodeURIComponent(q.trim())}`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json', 'X-Api-Key': API_KEY },
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        setErr(json?.message || 'Gagal mengambil data.');
      } else {
        setRows(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e: any) {
      setErr(e?.message || 'Jaringan bermasalah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl">
        {/* Tombol Kembali */}
        <button
          onClick={goBack}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>

        {/* Card utama full width */}
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-lg sm:px-10 sm:py-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Cari Tiket Kamu</h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Cari tiket dengan <span className="font-medium">nomor HP pemegang tiket</span>. Harus{' '}
              <b>persis sama</b> seperti saat pendaftaran.
            </p>
          </div>

          {/* Form pencarian */}
          <form
            onSubmit={doSearch}
            className="mx-auto mb-8 flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <input
                value={q}
                inputMode="numeric"
                onChange={(e) => setQ(e.target.value)}
                placeholder="cth: 0895xxxxxxxx"
                aria-label="Nomor HP pemegang tiket"
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pr-12 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-label="Cari"
                title="Cari"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                  />
                </svg>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setQ('');
                setRows([]);
                setErr(null);
              }}
              className="h-12 rounded-xl border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              Bersihkan
            </button>
          </form>

          {/* Pesan error */}
          {err && (
            <div className="mx-auto mb-6 max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700 shadow-sm">
              {err}
            </div>
          )}

          {/* Hasil */}
          {loading ? (
            <div className="text-center text-sm text-slate-600">Memuat…</div>
          ) : rows.length === 0 ? (
            <div className="text-center text-sm text-slate-500">Belum ada hasil.</div>
          ) : (
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((r) => {
                const badge =
                  r.status === 'paid'
                    ? 'bg-emerald-50 text-emerald-700'
                    : r.status === 'used'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-slate-100 text-slate-600';

                return (
                  <div
                    key={r.id}
                    onClick={() => goDetail(r.id)}
                    className="group flex cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 group-hover:text-slate-950">
                        {r.ticket_holder_name ?? '-'}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${badge}`}
                      >
                        {r.status ?? '-'}
                      </span>
                    </div>

                    <dl className="mt-1 space-y-1 text-xs">
                      <div>
                        <dt className="text-slate-500">Nomor HP</dt>
                        <dd className="font-medium text-slate-800">
                          {r.ticket_holder_phone ?? '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Dibuat</dt>
                        <dd className="font-medium text-slate-800">{fmtID(r.created_at)}</dd>
                      </div>
                    </dl>

                    <div className="mt-3">
                      <Link
                        href={`/ticket/${r.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        Lihat Tiket
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
