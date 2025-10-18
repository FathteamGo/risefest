'use client';

import { useState, useEffect } from 'react';
import { eventService } from '@/lib/data-service';
import EventCard from '@/components/ui/EventCard';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingCard from '@/components/ui/LoadingCard';
import { Event } from '@/types';

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const events = await eventService.getAllEvents();
        setFilteredEvents(events.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Search events
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (searchTerm.trim() === '') {
        const events = await eventService.getAllEvents();
        setFilteredEvents(events);
      } else {
        const events = await eventService.searchEvents(searchTerm);
        setFilteredEvents(events);
      }
    } catch (error) {
      console.error('Failed to search events:', error);
    } finally {
      setLoading(false);
    }
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
            {[...Array(6)].map((_, index) => (
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
            <h1 className="text-2xl font-bold">All Events</h1>
            <p className="text-secondary text-sm">Browse all available events</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-4 w-full md:w-auto">
            <Input 
              type="text" 
              placeholder="Search events..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Button variant="primary" type="submit">
              Search
            </Button>
          </form>
        </div>

        {filteredEvents?.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">No Events Found</h2>
            <p className="text-secondary mb-6">Try adjusting your search criteria</p>
            <Button variant="primary" onClick={() => setSearchTerm('')}>
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents?.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}