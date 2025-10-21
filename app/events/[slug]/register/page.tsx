// app/events/[slug]/register/page.tsx
import Link from "next/link";
import Container from "@/components/ui/Container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RegistrationForm from "@/components/pages/events/RegistrationForm";
import { eventService, eventTicketService } from "@/lib/data-service";
import type { Event, EventTicket } from "@/types";

export const dynamic = "force-dynamic";

export default async function TicketRegistrationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;                 // ← params adalah Promise
  searchParams: Promise<{ ticket?: string }>;        // ← searchParams juga Promise
}) {
  // WAJIB: tunggu params & searchParams
  const { slug } = await params;
  const sp = await searchParams;
  const ticketId = sp?.ticket ? Number(sp.ticket) : undefined;

  // Ambil event by slug dari backend
  let event: Event | null = null;
  try {
    const e = await eventService.getEventBySlug(slug);
    event = (e ?? null) as Event | null;
  } catch {
    event = null;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12">
        <Container>
          <Card className="p-8 text-center max-w-md mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
            </svg>
            <h1 className="text-2xl font-bold mb-2">Acara Tidak Ditemukan</h1>
            <p className="text-muted-foreground mb-6">Acara yang Anda cari tidak tersedia atau sudah dihapus.</p>
            <Link href="/events"><Button>Kembali ke Daftar Acara</Button></Link>
          </Card>
        </Container>
      </div>
    );
  }

  // Ambil daftar tiket event
  let tickets: EventTicket[] = [];
  try {
    tickets = (await eventTicketService.getTicketsByEventId(event.id)) as EventTicket[];
  } catch {
    tickets = [];
  }

  // Pilih tiket sesuai query, atau fallback ke yang active termurah
  let ticket: EventTicket | null =
    (ticketId ? tickets.find((t) => Number(t.id) === ticketId) ?? null : null);

  if (!ticket && tickets.length) {
    const active = tickets.filter((t) => (t.status ?? "").toLowerCase() === "active");
    const pool = active.length ? active : tickets;
    ticket = pool.reduce(
      (min, t) => ((Number(t.price) || 0) < (Number(min.price) || 0) ? t : min),
      pool[0]
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12">
        <Container>
          <Card className="p-8 text-center max-w-md mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
            </svg>
            <h1 className="text-2xl font-bold mb-2">Tiket Tidak Ditemukan</h1>
            <p className="text-muted-foreground mb-6">Tiket untuk acara ini belum tersedia atau sudah ditutup.</p>
            <Link href={`/events/${event.slug}`}><Button>Lihat Detail Acara</Button></Link>
          </Card>
        </Container>
      </div>
    );
  }

  return <RegistrationForm event={event} ticket={ticket} />;
}
