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
  // ⬇️ di Next 15 params adalah Promise
  params: Promise<{ uuid: string }>;
}) {
  // ⬇️ WAJIB di-await sebelum dipakai
  const { uuid } = await params;

  let tx: any | null = null;
  try {
    tx = await ticketTransactionService.getTransactionByUuid(uuid);
  } catch {
    tx = null;
  }

  if (!tx) {
    return (
      <div className="min-h-screen bg-white py-12">
        <Container>
          <Card className="p-8 text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-2">Tiket Tidak Ditemukan</h1>
            <p className="text-muted-foreground mb-6">
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
  };
  const ticket = tx.ticket ?? { title: 'Tiket' };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <Container>
        <div className="mx-auto max-w-2xl">
          <TicketCard tx={tx} event={event} ticket={ticket} />
        </div>
      </Container>
    </div>
  );
}