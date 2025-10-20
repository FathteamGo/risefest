'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Container from '@/components/ui/Container';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import EventCard from '@/components/ui/EventCard';
import { eventService } from '@/lib/data-service';
import { Event } from '@/types';

export default function EventsPage() {
  const [kataKunci, setKataKunci] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [tersaring, setTersaring] = useState<Event[]>([]);
  const [memuat, setMemuat] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ambil semua acara saat halaman dibuka
  useEffect(() => {
    (async () => {
      try {
        setMemuat(true);
        const data = await eventService.getAllEvents();
        setEvents(data || []);
        setTersaring(data || []);
      } finally {
        setMemuat(false);
      }
    })();
  }, []);

  // Debounce pencarian
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const q = kataKunci.trim().toLowerCase();
      setMemuat(true);
      try {
        if (!q) {
          setTersaring(events);
        } else {
          // Coba pakai endpoint pencarian kalau ada
          const res = await eventService.searchEvents(q).catch(() => null);
          setTersaring(
            Array.isArray(res) && res.length
              ? res
              : events.filter((ev) =>
                  [ev.title, ev.description, ev.location]
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(q))
                )
          );
        }
      } finally {
        setMemuat(false);
      }
    }, 350);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [kataKunci, events]);

  // Angka ringkas di toolbar (total & ditampilkan)
  const infoJumlah = useMemo(() => {
    const total = events.length;
    const tampil = tersaring.length;
    return { total, tampil };
  }, [events.length, tersaring.length]);

  return (
    <div className="min-h-screen bg-background py-8">
      <Container>
        {/* Header sederhana */}
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
              Menampilkan <span className="font-medium text-foreground">{infoJumlah.tampil}</span> dari{' '}
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
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
