import { notFound, redirect } from 'next/navigation';
import { eventService, eventTicketService } from '@/lib/data-service';
import RegistrationForm from '@/components/pages/events/RegistrationForm';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ticket?: string }>;
};

export const dynamic = 'force-dynamic';

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const reqTicketId = Number(sp?.ticket ?? '');

  const event = await eventService.getEventBySlug(slug);
  if (!event) notFound();

  const tickets = await eventTicketService.getTicketsByEventId(event.id);
  const list = Array.isArray(tickets) ? tickets : [];

  const now = Date.now();
  const toTs = (d?: string | null) => (d ? new Date(d as any).getTime() : undefined);
  const isActive = (t: any) => String(t.status ?? '').toLowerCase() === 'active';
  const hasQuota = (t: any) => t.quota == null || Number(t.quota) > 0;
  const inWindow = (t: any) => {
    const s = toTs(t.start_date) ?? -Infinity;
    const e = toTs(t.end_date) ?? Infinity;
    return s <= now && now <= e;
  };

  const allowed = list.filter((t) => isActive(t) && hasQuota(t) && inWindow(t));
  if (!allowed.length) redirect(`/events/${slug}`);

  const selected =
    allowed.find((t) => Number(t.id) === reqTicketId) ??
    allowed.reduce((min, t) => ((Number(t.price) || 0) < (Number(min.price) || 0) ? t : min), allowed[0]);

  if (!reqTicketId || Number(selected.id) !== reqTicketId) {
    redirect(`/events/${slug}/register?ticket=${selected.id}`);
  }

  return <RegistrationForm event={event} ticket={selected} />;
}