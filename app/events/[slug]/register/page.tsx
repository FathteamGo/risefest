// ============================================================================
// Halaman Pendaftaran Tiket (Server Component)
// - Mengambil event & ticket dari dummy-data via slug + query ?ticket=ID
// - Jika tidak ditemukan → tampilkan state kosong berbahasa Indonesia
// - Render RegistrationForm (Client) di bawah
// ============================================================================

import { events, eventTickets } from '@/lib/dummy-data';
import type { Event, EventTicket } from '@/types';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RegistrationForm from '@/components/pages/events/RegistrationForm';

export default async function TicketRegistrationPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { ticket?: string };
}) {
  // Ambil slug dari route dinamis
  const { slug } = params;

  // Cari event dari dummy-data
  const event = events.find((e: Event) => e.slug === slug) || null;

  // Ambil ticket dari query ?ticket=ID
  const ticketId = searchParams.ticket ? parseInt(searchParams.ticket, 10) : null;
  const ticket = ticketId ? (eventTickets.find((t: EventTicket) => t.id === ticketId) ?? null) : null;

  // Jika event/ticket tidak ada → tampilkan 404 sederhana
  if (!event || !ticket) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12">
        <Container>
          <Card className="p-8 text-center max-w-md mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400 mb-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
              />
            </svg>
            <h1 className="text-2xl font-bold mb-2">Acara atau Tiket Tidak Ditemukan</h1>
            <p className="text-muted-foreground mb-6">
              Acara atau tiket yang Anda cari tidak tersedia atau sudah dihapus.
            </p>
            <Link href="/events">
              <Button>Kembali ke Daftar Acara</Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  // Tampilkan form pendaftaran
  return <RegistrationForm event={event} ticket={ticket} />;
}
