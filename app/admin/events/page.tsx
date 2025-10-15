'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/lib/data-service';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Event } from '@/types';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await adminService.getEventsForCheckIn();
        setEvents(eventsData);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventSelect = (eventId: number) => {
    router.push(`/admin/check-in/${eventId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Select Event</h1>
              <p className="text-gray-600">Choose an event to start check-in process</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-6"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Select Event</h1>
            <p className="text-gray-600">Choose an event to start check-in process</p>
          </div>
        </div>

        {events.length === 0 ? (
          <Card className="p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Active Events</h2>
            <p className="text-gray-600 mb-6">There are currently no events available for check-in.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <Card key={event.id} className="p-6 hover:border-indigo-300 transition border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{event.location}</span>
                </div>
                
                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={() => handleEventSelect(event.id)}
                >
                  Select Event
                </Button>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}