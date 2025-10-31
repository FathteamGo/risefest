'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import { Card } from '@/components/ui/card';
import { eventService } from '@/lib/data-service';
import BannerImage from '@/components/BannerImage';

type EventItem = {
  id: number;
  slug: string;
  title: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  banner?: string;
  thumbnail?: string;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = (await eventService.getAllEvents()) as EventItem[];
        setEvents(data ?? []);
      } catch (e: any) {
        console.error(e);
        setErr('Gagal memuat acara.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const StatusBadge = ({ status }: { status?: string }) => {
    const s = (status ?? 'active').toLowerCase();
    const cls =
      s === 'active'
        ? 'bg-emerald-100 text-emerald-700'
        : s === 'draft'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-gray-200 text-gray-700';
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {s.charAt(0).toUpperCase() + s.slice(1)}
      </span>
    );
  };

  const fmt = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
      : '—';

  return (
    <div className="min-h-screen">
      <Container className="py-8 md:py-10">
        <div className="mb-6">
          <div className="mb-1 text-xs md:text-sm text-muted-foreground">Admin / Acara</div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Kelola Acara</h1>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Memuat data…</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}

        {!loading && !err && (
          <>
            <div className="grid grid-cols-1 gap-5 md:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <Link key={event.id} href={`/admin/check-in/${event.id}`} className="group block focus:outline-none">
                  <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-[3px] bg-blue-200" />
                      <BannerImage
                        src={event.thumbnail ?? event.banner ?? ''}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                        fallbackSrc="/icons/placeholder.jpg"
                      />
                      <div className="absolute right-3 top-3">
                        <StatusBadge status={event.status} />
                      </div>
                    </div>

                    <div className="p-4 md:p-5">
                      <h2 className="line-clamp-2 text-base md:text-lg font-medium md:font-semibold tracking-tight">
                        {event.title}
                      </h2>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center">
                          <svg className="mr-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {event.location || '—'}
                        </span>

                        <span className="inline-flex items-center">
                          <svg className="mr-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {fmt(event.start_date)} — {fmt(event.end_date)}
                        </span>
                      </div>

                      <div className="mt-4 text-right text-[11px] font-medium text-blue-600/70 group-hover:text-blue-600">
                        Klik untuk membuka check-in →
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {events.length === 0 && (
              <Card className="mt-10 grid place-items-center border border-dashed border-gray-300 p-12 text-center">
                <div className="mx-auto max-w-md">
                  <svg className="mx-auto mb-3 h-10 w-10 text-gray-400" viewBox="0 0 24 24" fill="none">
                    <path d="M3 7h18M7 3v18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <h3 className="mb-1 text-lg font-semibold">Belum ada acara</h3>
                  <p className="text-sm text-muted-foreground">Tidak ada data untuk ditampilkan.</p>
                </div>
              </Card>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
