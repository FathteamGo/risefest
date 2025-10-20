'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/ui/Container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingCard from '@/components/ui/LoadingCard';

export default function MyEventsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch the user's tickets
    // For now, we'll simulate with dummy data
    const fetchTickets = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dummy data - in a real app this would come from an API
        const dummyTickets = [
          {
            id: '1',
            eventId: 1,
            eventName: 'Music Festival 2023',
            eventDate: '2023-12-15T18:00:00Z',
            ticketType: 'VIP Pass',
            status: 'paid',
            qrCode: 'dummy-qr-code-1'
          },
          {
            id: '2',
            eventId: 2,
            eventName: 'Tech Conference',
            eventDate: '2023-11-20T09:00:00Z',
            ticketType: 'General Admission',
            status: 'paid',
            qrCode: 'dummy-qr-code-2'
          }
        ];
        
        setTickets(dummyTickets);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen app-bg py-8">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex-1 pr-4">
              <div className="w-[250px] h-6 bg-slate-200 loading-pulse rounded-md mb-4"></div>
              <div className="w-[150px] h-4 bg-slate-200 loading-pulse rounded-md"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(2)].map((_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg py-8">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Events</h1>
            <p className="text-secondary text-sm">Your purchased event tickets</p>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">No Tickets Found</h2>
            <p className="text-secondary mb-6">You haven't purchased any event tickets yet</p>
            <Button onClick={() => window.location.href = '/events'}>
              Browse Events
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tickets.map(ticket => (
              <Card key={ticket.id} className="flex flex-col h-full">
                <div className="p-6 flex-grow">
                  <h3 className="text-lg font-bold mb-2">{ticket.eventName}</h3>
                  <p className="text-gray-600 mb-4">{formatDate(ticket.eventDate)}</p>
                  <div className="mb-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {ticket.ticketType}
                    </span>
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-2">
                      {ticket.status}
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 text-center mb-4">
                    <div className="bg-white p-2 rounded inline-block">
                      {/* In a real app, this would be an actual QR code */}
                      <div className="w-24 h-24 bg-gray-300 rounded flex items-center justify-center mx-auto">
                        <span className="text-xs text-gray-500">QR Code</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <Button 
                    onClick={() => window.location.href = `/ticket/${ticket.id}`}
                  >
                    View Ticket
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}