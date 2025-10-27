'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Event, EventTicket } from '@/types';
import { Button } from '@/components/ui/button';

type Props = { event: Event; tickets: EventTicket[] };

function slugifyTitle(s: string): string {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function BottomEnrollBar({ event, tickets }: Props) {
  const targetTicket = useMemo(() => {
    const active = tickets.filter((t) => String(t.status).toLowerCase() === 'active');
    if (!active.length) return undefined;
    return active.reduce((min, t) => (Number(t.price) < Number(min.price) ? t : min), active[0]);
  }, [tickets]);

  if (!targetTicket) return null;

  const ticketParam = encodeURIComponent(slugifyTitle(String(targetTicket.title || '')));

  return (
    <div
      className="
        fixed inset-x-0 bottom-0 z-50
        bg-white/80 backdrop-blur-md border-t
      "
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-3">
        <Link href={`/events/${event.slug}/register?ticket=${ticketParam}`} className="block">
          <Button
            className="
              h-11 w-full rounded-full text-[15px] font-semibold
              bg-blue-600 text-white
              hover:bg-blue-700
              transition
              duration-200
              ease-out
              hover:-translate-y-0.5
              focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2
              shadow-sm hover:shadow
            "
          >
            Ikuti Event
          </Button>
        </Link>
      </div>
    </div>
  );
}
