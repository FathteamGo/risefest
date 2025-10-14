'use client';

import { useState, useEffect } from 'react';
import { events, eventTickets, ticketTransactions } from '../../../lib/dummy-data';
import Link from 'next/link';
import Container from '../../../components/ui/Container';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function AdminEventsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeEvents, setActiveEvents] = useState<any[]>([]);

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
      
      // Filter events that are active (regardless of date)
      const active = events.filter(event => {
        return event.status === 'active';
      });
      
      setActiveEvents(active);
    } else {
      // Redirect to login page
      window.location.href = '/admin/login';
    }
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (!isLoggedIn) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Select Event for Check-in</h1>
            <p className="text-gray-600">Choose an event to manage attendee check-in</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Input 
              type="text" 
              placeholder="Search events..." 
              className="flex-grow"
            />
            <Button variant="primary">
              Search
            </Button>
          </div>
        </div>

        {activeEvents.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-bold mb-2">No Active Events</h2>
              <p className="text-gray-600 mb-6">There are currently no events available for check-in.</p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Refresh Events
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeEvents.map(event => {
              // Get tickets for this event
              const eventTicketsForEvent = eventTickets.filter(ticket => ticket.event_id === event.id);
              
              // Get transactions for this event
              const eventTransactionsForEvent = ticketTransactions.filter(transaction => transaction.event_id === event.id);
              
              // Count total tickets sold
              const totalTicketsSold = eventTransactionsForEvent.length;
              
              // Count tickets checked in (using 'paid' status since that's what's in the dummy data)
              const checkedInTickets = eventTransactionsForEvent.filter(transaction => transaction.status === 'paid').length;

              return (
                <Card key={event.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.thumbnail} 
                      alt={event.title} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {event.status}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 line-clamp-1">{event.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">{event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span className="text-sm">{checkedInTickets} / {totalTicketsSold} checked in</span>
                      </div>
                    </div>
                    <Link 
                      href={`/admin/check-in/${event.id}`}
                      className="block w-full text-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-300 font-medium"
                    >
                      Select for Check-in
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}