import { notFound } from 'next/navigation';
import Container from '@/components/ui/Container';
import { Card } from '@/components/ui/card';
import BottomEnrollBar from '@/components/pages/events/BottomEnrollBar';
import { eventService, eventTicketService } from '@/lib/data-service';
import type { EventTicket } from '@/types';
import BannerImage from '@/components/BannerImage';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';

type Props = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';

/* WIB helpers */
const WIB_OFFSET = '+07:00';

function parseToWIB(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const s = String(dateStr).trim();
  if (/[zZ]|[+\-]\d{2}:\d{2}$/.test(s)) return new Date(s);
  return new Date(s.replace(' ', 'T') + WIB_OFFSET);
}

function formatWIBDate(dateStr?: string | null): string {
  const d = parseToWIB(dateStr);
  if (!d) return '-';
  return d.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatWIBTime(dateStr?: string | null): string {
  const d = parseToWIB(dateStr);
  if (!d) return '-';
  return d.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatWIBTimeRange(start?: string | null, end?: string | null): string {
  const startTime = formatWIBTime(start);
  const endTime = formatWIBTime(end);
  if (startTime === '-' || endTime === '-') return '-';
  return `${startTime} – ${endTime}`;
}

/* PAGE */
export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;

  const event = await eventService.getEventBySlug(slug);
  if (!event) notFound();

  const tickets: EventTicket[] =
    (await eventTicketService.getTicketsByEventId(event.id)) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <AnalyticsProvider
        gaId={event.google_analytic_id || null}
        fbPixelId={event.fb_pixel_id || null}
      />

      {/* BANNER */}
      <div className="relative h-[260px] md:h-[420px] lg:h-[460px] overflow-hidden rounded-b-3xl shadow-md">
        <BannerImage
          src={event.banner}
          alt={event.title}
          className="h-full w-full object-cover scale-105 transition-transform duration-700 ease-in-out hover:scale-110"
          fallbackSrc="/icons/placeholder.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 pb-5 md:pb-10">
          <Container>
            <div className="space-y-2 text-white drop-shadow-md">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs md:text-sm lg:text-base text-gray-100">
                <div className="inline-flex items-center gap-2">
                  <svg
                    className="h-4 w-4 md:h-5 md:w-5 text-white/90"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="truncate max-w-[260px] md:max-w-none">
                    {event.location}
                  </span>
                </div>

                <div className="inline-flex items-start md:items-center gap-2 md:gap-3">
                  <svg
                    className="h-5 w-5 md:h-6 md:w-6 shrink-0 text-white/90"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex flex-col leading-snug">
                    {/* MOBILE */}
                    <span className="block md:hidden">
                      {formatWIBDate(event.start_date)}
                    </span>
                    <span className="block md:hidden">
                      {formatWIBTimeRange(event.start_date, event.end_date)}
                    </span>

                    {/* DESKTOP */}
                    <span className="hidden md:inline-flex md:items-center md:gap-2">
                      <span>{formatWIBDate(event.start_date)}</span>
                      <span>•</span>
                      <span>{formatWIBTimeRange(event.start_date, event.end_date)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* CONTENT */}
      <Container className="py-8 md:py-12 lg:py-16">
        {/* full-width background on mobile, max-width on desktop */}
        <div className="mx-[-1rem] sm:mx-[-1.5rem] md:mx-auto md:max-w-6xl">
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.85fr)]">
            <Card className="bg-white/95 p-5 md:p-6 lg:p-7 border border-gray-100 shadow-md rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-lg md:text-xl font-semibold mb-5">
                Rincian Acara
              </h3>

              <div className="space-y-4 text-sm md:text-base leading-relaxed">
                <div className="flex flex-col gap-1">
                  <h4 className="font-medium text-gray-900">Lokasi</h4>
                  <p className="text-gray-600 break-words">{event.location}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="font-medium text-gray-900">
                    Tanggal &amp; Waktu
                  </h4>
                  <p className="text-gray-600 space-y-0.5">
                    <span className="block">
                      {formatWIBDate(event.start_date)}
                    </span>
                    <span className="block">
                      {formatWIBTimeRange(event.start_date, event.end_date)}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="font-medium text-gray-900">Status</h4>
                  <span
                    className={`inline-flex w-fit items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      event.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {String(event.status ?? '')
                      .replace(/^./, (c) => c.toUpperCase())
                      .replace('_', ' ')}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="bg-white/95 p-5 md:p-6 lg:p-7 border border-gray-100 shadow-md rounded-2xl hover:shadow-lg transition-shadow duration-300 mt-2 lg:mt-0">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-5">
                Deskripsi Acara
              </h2>

              {event.description ? (
                <div
                  className="
                    prose prose-sm md:prose-base
                    max-w-none
                    text-gray-600
                    leading-relaxed
                    [&>*]:text-gray-600
                    [&>p]:mb-3
                    [&>p]:text-justify
                    [&>ul]:pl-5
                    [&>ol]:pl-5
                  "
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              ) : (
                <p className="text-gray-500">
                  Tidak ada deskripsi untuk acara ini.
                </p>
              )}
            </Card>
          </div>
        </div>

        <div className="h-28 md:h-12" aria-hidden />
      </Container>

      <BottomEnrollBar event={event} tickets={tickets} />
    </div>
  );
}
