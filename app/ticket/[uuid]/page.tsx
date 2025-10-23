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
  } catch { tx = null; }

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
  };
  const ticket = tx.ticket ?? { title: 'Tiket' };

  const isPending = String(tx.status || '').toLowerCase() !== 'paid';

  // kalau masih pending
  const isPaid = String(tx.status || '').toLowerCase() === 'paid';
  if (!isPaid)     
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

  return (
    <div className="min-h-[100svh] bg-white pb-[calc(88px+env(safe-area-inset-bottom))] sm:pb-10 pt-6">
      <Container>
        <div className="mx-auto max-w-2xl">
          {/* Banner kecil kalau masih menunggu verifikasi */}
          {isPending && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"/>
              </svg>
              <span>Menunggu verifikasi pembayaran… halaman akan otomatis diperbarui.</span>
            </div>
          )}

          <TicketCard tx={tx} event={event} ticket={ticket} />
        </div>
      </Container>
    </div>
  );
}
