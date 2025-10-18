'use client';

import { useState, useEffect, FormEvent } from 'react';
import { eventService } from '@/lib/data-service';
import { Event } from '@/types';
import EventCard from '@/components/ui/EventCard';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingCard from '@/components/ui/LoadingCard';

export default function Home() {
  const [latestEvents, setLatestEvents] = useState<Event[]>([]);
  const [eventsByCategory, setEventsByCategory] = useState<Record<string, Event[]>>({});
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all events from the backend
        const events = await eventService.getAllEvents();
        const allEvents = events.data;
        
        // Get latest events (sorted by created_date DESC)
        const sortedEvents = [...allEvents].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setLatestEvents(sortedEvents.slice(0, 6));

        // Group events by category (location)
        const groupedEvents: Record<string, Event[]> = {};
        allEvents.forEach(event => {
          if (!groupedEvents[event.location]) {
            groupedEvents[event.location] = [];
          }
          groupedEvents[event.location].push(event);
        });
        
        setEventsByCategory(groupedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearching(true);
      const results = await eventService.searchEvents(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching events:', error);
    } finally {
      setSearching(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen app-bg">
        <main className="flex-1 relative pb-14">
          <Container>
            {/* Hero Section */}
            <section className="py-8 relative z-[1] overflow-hidden">
              <header className="mb-4 flex items-center">
                <div className="flex-1 pr-4">
                  <h1 className="text-2xl font-bold mb-1">Find Amazing Events</h1>
                  <p className="text-secondary text-sm">Discover the best events happening around you</p>
                </div>
              </header>
              
              {/* Search Form */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" variant="primary">
                    Search
                  </Button>
                </div>
              </form>
              
              {/* Latest Events Carousel */}
              <div className="overflow-x-auto flex whitespace-nowrap gap-4 py-2">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="w-[160px] flex-shrink-0">
                    <LoadingCard />
                  </div>
                ))}
              </div>
            </section>

            {/* Events by Category */}
            <section className="py-8 relative z-[1] overflow-hidden">
              <header className="mb-4 flex items-center">
                <div className="flex-1 pr-4">
                  <h2 className="text-xl font-bold mb-1">Events by Location</h2>
                  <p className="text-secondary text-sm">Find events happening near you</p>
                </div>
              </header>
              
              <div className="overflow-x-auto flex whitespace-nowrap gap-4 py-2">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="w-[160px] flex-shrink-0">
                    <LoadingCard />
                  </div>
                ))}
              </div>
            </section>
          </Container>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg">
      <main className="flex-1 relative pb-14">
        <Container>
          {/* Hero Section */}
          <section className="py-8 relative z-[1] overflow-hidden">
            <header className="mb-4 flex items-center">
              <div className="flex-1 pr-4">
                <h1 className="text-2xl font-bold mb-1">Find Amazing Events</h1>
                <p className="text-secondary text-sm">Discover the best events happening around you</p>
              </div>
            </header>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" variant="primary">
                  Search
                </Button>
              </div>
            </form>
            
            {/* Search Results */}
            {searchQuery && (
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4">
                  {searching ? 'Searching...' : `Search Results (${searchResults.length})`}
                </h2>
                
                {searching ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, index) => (
                      <LoadingCard key={index} />
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {searchResults.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No events found matching "{searchQuery}"</p>
                  </div>
                )}
              </section>
            )}
            
            {/* Latest Events Carousel */}
            {!searchQuery && (
              <>
                <div className="overflow-x-auto flex whitespace-nowrap gap-4 py-2">
                  {latestEvents.map(event => (
                    <div key={event.id} className="w-[160px] flex-shrink-0">
                      <EventCard event={event} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Events by Category */}
          {!searchQuery && (
            <section className="py-8 relative z-[1] overflow-hidden">
              <header className="mb-4 flex items-center">
                <div className="flex-1 pr-4">
                  <h2 className="text-xl font-bold mb-1">Events by Location</h2>
                  <p className="text-secondary text-sm">Find events happening near you</p>
                </div>
              </header>
              
              <div className="overflow-x-auto flex whitespace-nowrap gap-4 py-2">
                {Object.entries(eventsByCategory).map(([category, categoryEvents]) => (
                  <div key={category} className="w-[160px] flex-shrink-0">
                    <EventCard event={categoryEvents[0]} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </Container>
      </main>
    </div>
  );
}