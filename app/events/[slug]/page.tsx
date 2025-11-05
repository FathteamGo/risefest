import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import { Card } from "@/components/ui/card";
import BottomEnrollBar from "@/components/pages/events/BottomEnrollBar";
import { eventService, eventTicketService } from "@/lib/data-service";
import type { EventTicket } from "@/types";
import BannerImage from "@/components/BannerImage";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

/* ===============================
 *  WIB helpers
 *  =============================== */
const WIB_OFFSET = "+07:00";

function parseToWIB(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const s = String(dateStr).trim();
  if (/[zZ]|[+\-]\d{2}:\d{2}$/.test(s)) return new Date(s);
  return new Date(s.replace(" ", "T") + WIB_OFFSET);
}

function formatWIB(dateStr?: string | null): string {
  const d = parseToWIB(dateStr);
  if (!d) return "-";
  return d.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ===============================
 *  PAGE
 *  =============================== */
export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;

  const event = await eventService.getEventBySlug(slug);
  if (!event) notFound();

  const tickets: EventTicket[] =
    (await eventTicketService.getTicketsByEventId(event.id)) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ======== BANNER ======== */}
      <div className="relative h-[280px] md:h-[420px] lg:h-[480px] overflow-hidden rounded-b-3xl shadow-md">
        <BannerImage
          src={event.banner}
          alt={event.title}
          className="h-full w-full object-cover scale-105 transition-transform duration-700 ease-in-out hover:scale-110"
          fallbackSrc="/icons/placeholder.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 pb-6 md:pb-10">
          <Container>
            <div className="text-white drop-shadow-md space-y-2">
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm md:text-base text-gray-100">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-white/90" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{event.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-white/90" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    {formatWIB(event.start_date)} – {formatWIB(event.end_date)}
                  </span>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* ======== CONTENT ======== */}
      <Container className="py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <Card className="p-6 md:p-8 border border-gray-100 shadow-md rounded-2xl hover:shadow-lg transition duration-300">
            <h3 className="text-xl font-semibold mb-6">Rincian Acara</h3>

            <div className="space-y-5 text-sm leading-relaxed">
              <div>
                <h4 className="font-medium text-foreground">Lokasi</h4>
                <p className="text-muted-foreground">{event.location}</p>
              </div>

              <div>
                <h4 className="font-medium text-foreground">Tanggal & Waktu</h4>
                <p className="text-muted-foreground">
                  {formatWIB(event.start_date)} <br />– {formatWIB(event.end_date)}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-foreground">Status</h4>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    event.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {String(event.status ?? "")
                    .replace(/^./, (c) => c.toUpperCase())
                    .replace("_", " ")}
                </span>
              </div>

              {event.link && (
                <div>
                  <h4 className="font-medium text-foreground">Tautan Eksternal</h4>
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline underline-offset-2"
                  >
                    Kunjungi situs
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* RIGHT */}
          <div className="lg:col-span-2">
            <Card className="p-6 md:p-8 border border-gray-100 shadow-md rounded-2xl hover:shadow-lg transition duration-300">
              <h2 className="text-2xl font-semibold mb-4">Deskripsi Acara</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {event.description || "Tidak ada deskripsi untuk acara ini."}
              </p>
            </Card>
          </div>
        </div>

        <div className="h-24 md:h-0" aria-hidden />
      </Container>

      <BottomEnrollBar event={event} tickets={tickets} />
    </div>
  );
}
