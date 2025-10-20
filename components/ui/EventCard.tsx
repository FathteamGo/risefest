import { Event } from '@/types';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function EventCard({ event }: { event: Event }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const fmt = (s?: string) => s ? new Date(s).toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '';

  return (
    <Link href={`/events/${event.slug}`} className="group block focus:outline-none">
      <Card className="h-full overflow-hidden transition-all group-hover:shadow-lg group-hover:-translate-y-0.5">
        <div className="relative aspect-[4/5] w-full bg-muted">
          {event?.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${baseUrl}/${event.thumbnail}`}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : null}
          <div className="absolute top-2 right-2 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
            {event.status}
          </div>
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-2">{event.title}</CardTitle>
          {event.description ? <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p> : null}
        </CardHeader>

        <CardContent className="pt-0 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="truncate">{event.location ?? '—'}</span>
            <span className="truncate">{fmt(event.start_date)}{event.end_date ? ` — ${fmt(event.end_date)}` : ''}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
export { EventCard };