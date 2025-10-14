'use client';

import { useState, useEffect } from 'react';
import { ticketTransactions, events, eventTickets } from '../../../lib/dummy-data';
import Link from 'next/link';
import Container from '../../../components/ui/Container';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';

export default function TicketPage({ params }: { params: { uuid: string } }) {
  const [transaction, setTransaction] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      // Find the ticket transaction by UUID
      const foundTransaction = ticketTransactions.find(t => t.id === params.uuid);
      
      if (foundTransaction) {
        setTransaction(foundTransaction);
        
        // Find related event and ticket
        const foundEvent = events.find(e => e.id === foundTransaction.event_id);
        const foundTicket = eventTickets.find(t => t.id === foundTransaction.event_ticket_id);
        
        setEvent(foundEvent);
        setTicket(foundTicket);
      }
      
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [params.uuid]);

  // If still loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <Container>
          <Card className="p-8 text-center max-w-md mx-auto">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading Ticket...</h1>
            <p className="text-gray-600">Please wait while we load your ticket details.</p>
          </Card>
        </Container>
      </div>
    );
  }

  // If transaction not found, show 404
  if (transaction === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <Container>
          <Card className="p-8 text-center max-w-md mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Ticket Not Found</h1>
            <p className="text-gray-600 mb-6">The ticket you're looking for doesn't exist or has been removed.</p>
            <Link href="/events">
              <Button variant="primary">
                Browse All Events
              </Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/events" className="text-indigo-600 hover:text-indigo-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Browse Events
            </Link>
          </div>

          <Card className="overflow-hidden">
            {/* Event Header */}
            {event && (
              <div className="relative h-48">
                <img 
                  src={event.banner} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h1 className="text-3xl font-bold">{event.title}</h1>
                </div>
              </div>
            )}

            <div className="p-6 md:p-8">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Your E-Ticket</h2>
                <p className="text-gray-600">Show this QR code at the event entrance for check-in</p>
              </div>

              <div className="flex flex-col lg:flex-row justify-between items-center gap-8 md:gap-12 mb-8 md:mb-12">
                <div className="text-center">
                  <div className="bg-white p-4 md:p-6 rounded-xl inline-block border border-gray-200 shadow-sm">
                    {/* QR Code */}
                    <QRCodeSVG 
                      value={transaction.id} 
                      size={200} 
                      level="H" 
                      includeMargin={true}
                      className="rounded-lg w-48 h-48 md:w-52 md:h-52"
                    />
                  </div>
                  <p className="mt-4 text-gray-600 font-medium">Scan this QR code for check-in</p>
                </div>

                <div className="w-full lg:w-1/2">
                  <Card className="p-4 md:p-6 bg-gray-50 border border-gray-200">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">Ticket Details</h3>
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600 font-medium">Ticket Holder:</span>
                        <span className="font-bold">{transaction.ticket_holder_name}</span>
                      </div>
                      {ticket && (
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600 font-medium">Ticket Type:</span>
                          <span className="font-bold">{ticket.title}</span>
                        </div>
                      )}
                      {event && (
                        <>
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600 font-medium">Event Date:</span>
                            <span className="font-bold text-sm md:text-base">{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600 font-medium">Location:</span>
                            <span className="font-bold">{event.location}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600 font-medium">Status:</span>
                        <span className={`inline-block px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-semibold ${
                          transaction.status === 'paid' ? 'bg-green-100 text-green-800' : 
                          transaction.status === 'used' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600 font-medium">Ticket ID:</span>
                        <span className="font-mono text-xs md:text-sm">{transaction.id}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <Card className="p-4 mb-6 md:mb-8 bg-yellow-50 border-l-4 border-yellow-400">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Important:</strong> Please save this ticket or take a screenshot. 
                      You'll need to show this QR code at the event entrance for check-in.
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button variant="primary" className="font-bold px-6 py-2 md:px-8 md:py-3 text-sm md:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download PDF
                </Button>
                <Button variant="secondary" className="font-bold px-6 py-2 md:px-8 md:py-3 text-sm md:text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Send to WhatsApp
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
