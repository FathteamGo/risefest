import { notFound, redirect } from 'next/navigation';
import { eventService, eventTicketService } from '@/lib/data-service';
import RegistrationForm from '@/components/pages/events/RegistrationForm';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ticket?: string }>;
};

export const dynamic = 'force-dynamic';

function slugifyTitle(s: string): string {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const rawTicketParam = sp?.ticket?.trim();

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

  let selected: any | undefined;

  if (rawTicketParam) {
    if (/^\d+$/.test(rawTicketParam)) {
      const reqId = Number(rawTicketParam);
      selected = allowed.find((t) => Number(t.id) === reqId);
    } else {
      const reqSlug = slugifyTitle(decodeURIComponent(rawTicketParam));
      selected = allowed.find((t) => slugifyTitle(String(t.title || '')) === reqSlug);
    }
  }

  if (!selected) {
    selected = allowed.reduce(
      (min, t) => ((Number(t.price) || 0) < (Number(min.price) || 0) ? t : min),
      allowed[0]
    );
  }

  const expectedParam = encodeURIComponent(slugifyTitle(String(selected.title || '')));

  if (!rawTicketParam || slugifyTitle(String(rawTicketParam)) !== slugifyTitle(String(selected.title || ''))) {
    redirect(`/events/${slug}/register?ticket=${expectedParam}`);
  }

  return <RegistrationForm event={event} ticket={selected} />;
}
