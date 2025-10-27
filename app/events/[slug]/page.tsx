import { notFound } from 'next/navigation';
import Container from '@/components/ui/Container';
import { Card } from '@/components/ui/card';
import BottomEnrollBar from '@/components/pages/events/BottomEnrollBar';
import { eventService, eventTicketService } from '@/lib/data-service';
import type { EventTicket } from '@/types';
import BannerImage from '@/components/BannerImage';

type Props = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;

  const event = await eventService.getEventBySlug(slug);
  if (!event) notFound();

  const tickets: EventTicket[] =
    (await eventTicketService.getTicketsByEventId(event.id)) || [];

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-64 md:h-96">
        <BannerImage
          src={event.banner}
          alt={event.title}
          className="h-full w-full object-cover"
          fallbackSrc="/icons/placeholder.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <Container>
            <div className="py-6 text-white md:py-8">
              <h1 className="mb-2 text-3xl font-bold md:text-4xl">{event.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                <div className="inline-flex items-center">
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{event.location}</span>
                </div>
                <div className="inline-flex items-center">
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    {formatDate(event.start_date)} – {formatDate(event.end_date)}
                  </span>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>

      <Container className="py-6 md:py-8">
        {/* DETAILS DI KIRI (LG), DESKRIPSI DI KANAN (LG).
            DI MOBILE: DETAILS DI ATAS, DESKRIPSI DI BAWAH */}
        <div className="flex flex-col gap-6 md:gap-8 lg:flex-row">
          {/* LEFT: Rincian */}
          <div className="lg:order-1 lg:w-1/3">
            <Card className="border border-gray-200 p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-bold">Rincian Acara</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-foreground">Lokasi</h4>
                  <p className="text-muted-foreground">{event.location}</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Tanggal & Waktu</h4>
                  <p className="text-muted-foreground">
                    {formatDate(event.start_date)} – {formatDate(event.end_date)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Status</h4>
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                    {String(event.status ?? '').replace(/^./, (c) => c.toUpperCase())}
                  </span>
                </div>
                {event.link ? (
                  <div>
                    <h4 className="font-medium text-foreground">Tautan Eksternal</h4>
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline-offset-2 hover:underline"
                    >
                      Kunjungi situs
                    </a>
                  </div>
                ) : null}
              </div>
            </Card>
          </div>

          {/* RIGHT: Deskripsi */}
          <div className="lg:order-2 lg:w-2/3">
            <Card className="border border-gray-200 p-6 shadow-sm md:p-8">
              <h2 className="mb-4 text-2xl font-bold">Deskripsi Acara</h2>
              <p className="leading-relaxed text-muted-foreground">{event.description}</p>
            </Card>
          </div>
        </div>

        <div className="h-20 md:h-0" aria-hidden />
      </Container>

      <BottomEnrollBar event={event} tickets={tickets} />
    </div>
  );
}
