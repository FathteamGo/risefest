import Container from '@/components/ui/Container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ticketTransactionService } from '@/lib/data-service';
import TicketCard from '@/components/pages/ticket/TicketCard';

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
      <main className="min-h-screen bg-white py-12">
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
      </main>
    );
  }

  const event = tx.event ?? {
    title: 'Acara',
    location: '-',
    start_date: tx.start_date ?? '',
    end_date: tx.end_date ?? '',
    slug: '/events',
  };
  const ticket = tx.ticket ?? { title: 'Tiket' };

  return (
    <main className="min-h-screen bg-white">
      <Container className="py-6 pb-24 md:py-10">
        <div className="mx-auto w-full max-w-[680px]">
          <TicketCard tx={tx} event={event} ticket={ticket} />
        </div>
      </Container>
    </main>
  );
}
