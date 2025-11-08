import Container from '@/components/ui/Container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ticketTransactionService } from '@/lib/data-service';
import TicketCard from '@/components/pages/ticket/TicketCard';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { ENV } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function TicketPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  let tx: any | null = null;
  try {
    tx = await ticketTransactionService.getTransactionByUuid(uuid);
  } catch {
    tx = null;
  }

  if (!tx) {
    return (
      <div className="min-h-[100svh] bg-white py-12">
        <Container>
          <Card className="mx-auto max-w-md p-8 text-center">
            <h1 className="mb-2 text-2xl font-bold">Tiket Tidak Ditemukan</h1>
            <p className="mb-6 text-muted-foreground">
              Kode tiket tidak valid atau sudah dihapus.
            </p>
            <Link href="/events">
              <Button>Kembali ke Daftar Acara</Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  const event = tx.event ?? {
    title: 'Acara',
    location: '-',
    start_date: tx.start_date ?? '',
    end_date: tx.end_date ?? '',
    slug: '/events',
    fb_pixel_id: null,
  };

  const ticket = tx.ticket ?? { title: 'Tiket' };

  const status = String(tx.status || '').toLowerCase();
  const isPaid = status === 'paid' || status === 'used';

  if (!isPaid) {
    return (
      <div className="min-h-[100svh] bg-white py-12">
        <Container>
          <Card className="mx-auto max-w-md p-8 text-center">
            <h1 className="mb-2 text-2xl font-bold">Tiket Tidak Ditemukan</h1>
            <p className="mb-6 text-muted-foreground">
              Kode tiket tidak valid atau sudah dihapus.
            </p>
            <Link href="/events">
              <Button>Kembali ke Daftar Acara</Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-white pb-[calc(88px+env(safe-area-inset-bottom))] sm:pb-10 pt-6">
      {/* GA dari ENV, FB Pixel dari event backend */}
      <AnalyticsProvider
        gaId={ENV.PUBLIC_GOOGLE_ANALYTICS_ID}
        fbPixelId={event.fb_pixel_id}
      />

      <Container>
        <div className="mx-auto max-w-2xl">
          {status === 'used' && (
            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              <b>Tiket telah digunakan.</b>{' '}
              <span>
                Digunakan pada{' '}
                {tx.checked_in_at
                  ? new Date(tx.checked_in_at).toLocaleString('id-ID')
                  : '-'}
                .
              </span>
            </div>
          )}

          <TicketCard tx={tx} event={event} ticket={ticket} />
        </div>
      </Container>
    </div>
  );
}
