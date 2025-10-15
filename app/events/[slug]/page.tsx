import { eventService, eventTicketService } from '@/lib/data-service';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Event, EventTicket } from '@/types';

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await the params to fix the dynamic route issue
  const { slug } = await params;
  
  // Fetch the event by slug
  const event = await eventService.getEventBySlug(slug);
  
  // If event not found, show 404
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <Container>
          <Card className="p-8 text-center max-w-md mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h1>
            <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
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

  // Get tickets for this event
  const tickets = await eventTicketService.getTicketsByEventId(event.id);

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
      {/* Banner */}
      <div className="relative h-64 md:h-96">
        <img 
          src={event.banner} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        <Container className="absolute bottom-0 left-0 right-0">
          <div className="py-6 md:py-8 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{event.location}</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Event Details */}
          <div className="lg:w-2/3">
            <Card className="p-6 md:p-8 mb-6 md:mb-8 border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Event Description</h2>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </Card>

            {/* Ticket Options */}
            <Card className="p-6 md:p-8 border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Ticket Options</h2>
              <div className="space-y-6">
                {tickets.filter(ticket => ticket.status === 'active').map(ticket => (
                  <Card key={ticket.id} className="p-6 hover:border-indigo-300 transition border border-gray-200 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{ticket.title}</h3>
                        <p className="text-gray-600 mb-4">{ticket.description}</p>
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            <span className="text-lg md:text-xl font-bold text-indigo-600">IDR {ticket.price.toLocaleString()}</span>
                          </div>
                          {ticket.quota && (
                            <div className="flex items-center text-gray-700">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                              </svg>
                              <span>{ticket.quota} tickets available</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Link href={`/events/${event.slug}/register?ticket=${ticket.id}`}>
                        <Button variant="primary" className="whitespace-nowrap">
                          Buy Ticket
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <Card className="p-6 sticky top-6 md:top-8 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold mb-4">Event Details</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Location</h4>
                  <p className="text-gray-600">{event.location}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Date & Time</h4>
                  <p className="text-gray-600">{formatDate(event.start_date)} - {formatDate(event.end_date)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Status</h4>
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {event.status}
                  </span>
                </div>
                {event.link && (
                  <div>
                    <h4 className="font-semibold text-gray-700">External Link</h4>
                    <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}