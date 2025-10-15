'use client';

import { ticketTransactionService, eventService, eventTicketService } from '../../../lib/data-service';
import Container from '../../../components/ui/Container';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect } from 'react';

export default function TicketPage({ params }: { params: { uuid: string } }) {
  const { uuid } = params;
  
  // In a real implementation, you would fetch the data here
  // For now, we'll use dummy data
  const transaction = {
    id: uuid,
    event_id: 1,
    event_ticket_id: 1,
    ticket_holder_name: "John Doe",
    ticket_holder_phone: "+1234567890",
    ticket_holder_email: "john@example.com",
    buyer_name: "John Doe",
    buyer_phone: "+1234567890",
    buyer_email: "john@example.com",
    buyer_gender: "male",
    buyer_city: "New York",
    payment_method: "Credit Card",
    payment_status: "paid",
    status: "paid",
    total_amount: 150000,
    created_at: "2023-10-15T10:00:00Z",
    updated_at: "2023-10-15T10:00:00Z"
  };

  const event = {
    id: 1,
    slug: "music-festival-2023",
    title: "Music Festival 2023",
    description: "An amazing music festival with top artists",
    thumbnail: "/images/event1.jpg",
    banner: "/images/event1-banner.jpg",
    location: "Central Park, New York",
    link: "https://musicfestival2023.com",
    start_date: "2023-12-15T18:00:00Z",
    end_date: "2023-12-17T23:00:00Z",
    status: "active",
    created_at: "2023-10-01T00:00:00Z",
    updated_at: "2023-10-01T00:00:00Z"
  };

  const ticket = {
    id: 1,
    event_id: 1,
    title: "VIP Pass",
    description: "Access to all areas including VIP lounge",
    price: 150000,
    quota: 100,
    start_date: "2023-10-01T00:00:00Z",
    end_date: "2023-12-10T00:00:00Z",
    status: "active",
    created_at: "2023-10-01T00:00:00Z",
    updated_at: "2023-10-01T00:00:00Z"
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Since this is a client component, we can't use server-side rendering
  // We'll handle the case where data might not be available
  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <Container>
          <Card className="p-8 text-center max-w-md mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Ticket Not Found</h1>
            <p className="text-gray-600 mb-6">The ticket you're looking for doesn't exist or has been removed.</p>
            <Button variant="primary" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 md:p-8 border border-gray-200 shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Your Event Ticket</h1>
              <p className="text-gray-600">Thank you for registering. Please save this ticket.</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{event?.title || 'Event Title'}</h2>
                  <p className="text-gray-600">{formatDate(event?.start_date || '')} - {formatDate(event?.end_date || '')}</p>
                  <p className="text-gray-600">{event?.location || 'Event Location'}</p>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-full">
                  <span className="text-sm font-semibold text-gray-700">PAID</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Ticket Holder</h3>
                    <p className="text-gray-800">{transaction.ticket_holder_name}</p>
                    <p className="text-gray-600">{transaction.ticket_holder_email}</p>
                    <p className="text-gray-600">{transaction.ticket_holder_phone}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Ticket Details</h3>
                    <p className="text-gray-800">{ticket?.title || 'Ticket Type'}</p>
                    <p className="text-gray-800 font-bold">IDR {transaction.total_amount.toLocaleString()}</p>
                    <p className="text-gray-600">Transaction ID: {transaction.id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-lg border border-gray-200 mb-6">
                <QRCodeSVG 
                  value={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/ticket/${uuid}`} 
                  size={200} 
                  level="H"
                />
              </div>
              <p className="text-gray-600 mb-6">Scan this QR code at the event entrance</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="primary" 
                  onClick={() => window.print()}
                  className="print:hidden"
                >
                  Print Ticket
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => window.history.back()}
                  className="print:hidden"
                >
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