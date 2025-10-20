'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Event, EventTicket } from '@/types';
import { Button } from '@/components/ui/button';

type Props = { event: Event; tickets: EventTicket[] };

export default function BottomEnrollBar({ event, tickets }: Props) {
  const targetTicket = useMemo(() => {
    const active = tickets.filter((t) => t.status === 'active');
    if (!active.length) return undefined;
    return active.reduce((min, t) => (t.price < min.price ? t : min), active[0]);
  }, [tickets]);

  if (!targetTicket) return null;

  return (
    <div
      className="
        fixed inset-x-0 bottom-0 z-50
        bg-white border-t border-gray-200
        shadow-[0_-4px_10px_rgba(0,0,0,0.05)]
      "
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-3 flex justify-center">
        <Link
          href={`/events/${event.slug}/register?ticket=${targetTicket.id}`}
          className="w-full max-w-md"
        >
          <Button
            className="
              h-12 w-full rounded-full text-[16px] font-semibold
              bg-[#93C5FD] text-white hover:bg-[#84B6FF]
            "
          >
            Ikuti Event
          </Button>
        </Link>
      </div>
    </div>
  );
}
