'use client';

import Container from '@/components/ui/Container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';

export default function TicketPage({ params }: { params: { uuid: string } }) {
  const { uuid } = params;

  // dummy transaction + event + ticket
  const transaction = {
    id: uuid,
    total_amount: 150000,
    ticket_holder_name: 'John Doe',
    ticket_holder_phone: '+1234567890',
    ticket_holder_email: 'john@example.com',
  };

  const event = {
    title: 'Music Festival 2023',
    location: 'Central Park, New York',
    start_date: '2023-12-15T18:00:00Z',
    end_date: '2023-12-17T23:00:00Z',
  };

  const ticket = {
    title: 'VIP Pass',
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="mx-auto max-w-2xl">
          <Card className="border border-gray-200 p-6 shadow-sm md:p-8">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-2xl font-bold text-gray-800 md:text-3xl">Your Event Ticket</h1>
              <p className="text-gray-600">Thank you for registering. Please save this ticket.</p>
            </div>

            <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-6 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{event.title}</h2>
                  <p className="text-gray-600">
                    {formatDate(event.start_date)} - {formatDate(event.end_date)}
                  </p>
                  <p className="text-gray-600">{event.location}</p>
                </div>
                <div className="rounded-full bg-gray-100 px-4 py-2">
                  <span className="text-sm font-semibold text-gray-700">PAID</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-700">Ticket Holder</h3>
                    <p className="text-gray-800">{transaction.ticket_holder_name}</p>
                    <p className="text-gray-600">{transaction.ticket_holder_email}</p>
                    <p className="text-gray-600">{transaction.ticket_holder_phone}</p>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-700">Ticket Details</h3>
                    <p className="text-gray-800">{ticket.title}</p>
                    <p className="font-bold text-gray-800">IDR {transaction.total_amount.toLocaleString()}</p>
                    <p className="text-gray-600">Transaction ID: {transaction.id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-6 inline-block rounded-lg border border-gray-200 bg-white p-4">
                <QRCodeSVG
                  value={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/ticket/${uuid}`}
                  size={200}
                  level="H"
                />
              </div>
              <p className="mb-6 text-gray-600">Scan this QR code at the event entrance</p>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button onClick={() => window.print()} className="print:hidden">
                  Print Ticket
                </Button>
                <Button variant="secondary" onClick={() => window.history.back()} className="print:hidden">
                  Back to Event
                </Button>
              </div>
            </div>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-500 print:hidden">
            <p>Need help? Contact us at support@mjfest.com</p>
          </div>
        </div>
      </Container>

      {/* CSS print-only sederhana */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white;
            padding: 0;
            margin: 0;
          }
          button {
            display: none !important;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}