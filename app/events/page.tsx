'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import Container from '@/components/ui/Container';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import BannerImage from '@/components/BannerImage';
import { eventService } from '@/lib/data-service';
import type { Event } from '@/types';

const stripHtml = (html?: string | null) =>
  html ? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';

export default function EventsPage() {
  const router = useRouter();

  const [kataKunci, setKataKunci] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [tersaring, setTersaring] = useState<Event[]>([]);
  const [memuat, setMemuat] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setMemuat(true);
        const data = (await eventService.getAllEvents().catch(() => [])) as Event[];

        const filtered = (data || [])
          .filter(
            (ev) =>
              String(ev.status).toLowerCase() === 'active' &&
              !!ev.is_featured,
          )
          .map((ev) => ({
            ...ev,
            description: stripHtml(ev.description as any),
          }));

        if (!mounted) return;

        setEvents(filtered);
        setTersaring(filtered);
      } finally {
        if (mounted) setMemuat(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      const q = kataKunci.trim().toLowerCase();
      setMemuat(true);
      try {
        if (!q) {
          setTersaring(events);
        } else {
          const res = (await eventService.searchEvents(q).catch(() => null)) as
            | Event[]
            | null;

          if (Array.isArray(res) && res.length) {
            setTersaring(
              res.map((ev) => ({
                ...ev,
                description: stripHtml(ev.description as any),
              })),
            );
          } else {
            setTersaring(
              events.filter((ev) =>
                [ev.title, ev.description, ev.location]
                  .filter(Boolean)
                  .some((v) => String(v).toLowerCase().includes(q)),
              ),
            );
          }
        }
      } finally {
        setMemuat(false);
      }
    }, 350);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [kataKunci, events]);

  const infoJumlah = useMemo(
    () => ({ total: events.length, tampil: tersaring.length }),
    [events.length, tersaring.length],
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <Container>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Semua Acara</h1>
          <p className="text-sm text-muted-foreground">
            Jelajahi seluruh acara yang tersedia
          </p>
        </div>

        {/* Toolbar: cari + statistik kecil */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="w-full md:w-[360px]">
            <Input
              placeholder="Cari acara (judul, lokasi, deskripsi)…"
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              aria-label="Cari acara"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Menampilkan{' '}
              <span className="font-medium text-foreground">{infoJumlah.tampil}</span> dari{' '}
              <span className="font-medium text-foreground">{infoJumlah.total}</span> acara
            </span>
          </div>
        </div>

        {/* Konten */}
        {memuat ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                aria-hidden="true"
              >
                <div className="aspect-[16/9] w-full bg-muted" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : tersaring.length === 0 ? (
          <div className="py-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto mb-4 h-14 w-14 text-muted-foreground/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
              />
            </svg>
            <h2 className="mb-1 text-lg font-semibold">Acara tidak ditemukan</h2>
            <p className="text-sm text-muted-foreground">
              Coba ubah kata kunci pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tersaring.map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => router.push(`/events/${ev.slug}`)}
                className="group overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                  <BannerImage
                    src={ev.banner}
                    alt={ev.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    fallbackSrc="/icons/placeholder.jpg"
                  />
                  {ev.status && (
                    <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                      {String(ev.status).toLowerCase()}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 p-4">
                  <h2 className="line-clamp-1 text-base font-semibold text-foreground">
                    {ev.title}
                  </h2>
                  {ev.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {stripHtml(ev.description as any)}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {ev.location && (
                      <span className="inline-flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="line-clamp-1 max-w-[150px]">
                          {ev.location}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
