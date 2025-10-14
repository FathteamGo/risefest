import { events } from '../lib/dummy-data';
import { Event } from '../types';
import EventCard from '../components/ui/EventCard';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TestComponent from '../components/ui/TestComponent';

export default function Home() {
  // Get latest events (sorted by created_date DESC)
  const latestEvents = [...events].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 6);

  // Group events by category (for demo purposes, we'll use location as category)
  const eventsByCategory: Record<string, Event[]> = {};
  events.forEach(event => {
    if (!eventsByCategory[event.location]) {
      eventsByCategory[event.location] = [];
    }
    eventsByCategory[event.location].push(event);
  });

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
            
            {/* Latest Events Carousel */}
            <div className="overflow-x-auto flex whitespace-nowrap gap-4 py-2">
              {latestEvents.map(event => (
                <div key={event.id} className="w-[160px] flex-shrink-0">
                  <EventCard event={event} />
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
              {Object.entries(eventsByCategory).map(([category, categoryEvents]) => (
                <div key={category} className="w-[160px] flex-shrink-0">
                  <EventCard event={categoryEvents[0]} />
                </div>
              ))}
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}