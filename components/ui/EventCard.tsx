import { Event } from '@/types';
import Link from 'next/link';
import Card from './Card';

export default function EventCard({ event }: { event: Event }) {
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

  return (
    <Card className="h-full flex flex-col card-hover">
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-lg">
        <img 
          src={event.thumbnail} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold">
          {event.status}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold mb-1 line-clamp-1">{event.title}</h3>
        <p className="text-secondary text-sm mb-3 line-clamp-2 flex-grow">{event.description}</p>
        <div className="space-y-1 mb-3">
          <div className="flex items-center text-secondary text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{event.location}</span>
          </div>
          <div className="flex items-center text-secondary text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
          </div>
        </div>
        <Link 
          href={`/events/${event.slug}`}
          className="block w-full text-center bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300 text-sm font-medium mt-auto"
        >
          View Details
        </Link>
      </div>
    </Card>
  );
}

// Export the component with a named export as well for consistency
export { EventCard };