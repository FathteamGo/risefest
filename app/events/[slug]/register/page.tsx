'use client'

import { events, eventTickets } from '@/@/lib/dummy-data';
import { Event, EventTicket } from '@/@/types';
import Link from 'next/link';
import { useState } from 'react';
import Container from '@/@/components/ui/Container';
import Card from '@/@/components/ui/Card';
import Button from '@/@/components/ui/Button';
import Input from '@/@/components/ui/Input';

export default async function TicketRegistrationPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: { ticket?: string } }) {
  // Await the params to fix the dynamic route issue
  const { slug } = await params;
  
  // Find the event by slug
  const event = events.find((e: Event) => e.slug === slug);
  
  // Find the ticket by ID
  const ticketId = searchParams.ticket ? parseInt(searchParams.ticket, 10) : null;
  const ticket = ticketId ? eventTickets.find((t: EventTicket) => t.id === ticketId) : null;
  
  // If event or ticket not found, show error
  if (!event || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <Container>
          <Card className="p-8 text-center max-w-md mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Event or Ticket Not Found</h1>
            <p className="text-gray-600 mb-6">The event or ticket you're looking for doesn't exist or has been removed.</p>
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

  // Client component for the form
  return <RegistrationForm event={event} ticket={ticket} />;
}

function RegistrationForm({ event, ticket }: { event: Event, ticket: EventTicket }) {
  const [ticketHolders, setTicketHolders] = useState([
    { name: '', email: '', phone: '' }
  ]);
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Add new ticket holder
  const addTicketHolder = () => {
    setTicketHolders([
      ...ticketHolders,
      { name: '', email: '', phone: '' }
    ]);
  };

  // Update ticket holder info
  const updateTicketHolder = (index: number, field: string, value: string) => {
    const newTicketHolders = [...ticketHolders];
    newTicketHolders[index] = { ...newTicketHolders[index], [field]: value };
    setTicketHolders(newTicketHolders);
  };

  // Update buyer info
  const updateBuyerInfo = (field: string, value: string) => {
    setBuyerInfo({ ...buyerInfo, [field]: value });
  };

  // Remove ticket holder
  const removeTicketHolder = (index: number) => {
    if (ticketHolders.length > 1) {
      const newTicketHolders = [...ticketHolders];
      newTicketHolders.splice(index, 1);
      setTicketHolders(newTicketHolders);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to the backend
    console.log('Form submitted:', { buyerInfo, ticketHolders });
    alert('Registration submitted! In a real application, this would proceed to payment.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href={`/events/${event.slug}`} className="text-indigo-600 hover:text-indigo-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Event
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="p-6 md:p-8 border border-gray-200 shadow-sm">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Register for {event.title}</h1>
                <p className="text-gray-600 mb-6">Fill in the details below to complete your registration</p>

                <form onSubmit={handleSubmit}>
                  {/* Buyer Information */}
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Buyer Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Full Name *"
                        type="text"
                        value={buyerInfo.name}
                        onChange={(e) => updateBuyerInfo('name', e.target.value)}
                        required
                      />
                      <Input
                        label="Email Address *"
                        type="email"
                        value={buyerInfo.email}
                        onChange={(e) => updateBuyerInfo('email', e.target.value)}
                        required
                      />
                      <Input
                        label="Phone Number *"
                        type="tel"
                        value={buyerInfo.phone}
                        onChange={(e) => updateBuyerInfo('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Ticket Holder Information */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Ticket Holder Information</h2>
                      <Button type="button" variant="secondary" size="sm" onClick={addTicketHolder}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Another Holder
                      </Button>
                    </div>
                    
                    {ticketHolders.map((holder, index) => (
                      <Card key={index} className="p-4 md:p-6 mb-4 md:mb-6 bg-gray-50 border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold">Ticket Holder {index + 1}</h3>
                          {ticketHolders.length > 1 && (
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              onClick={() => removeTicketHolder(index)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            label="Full Name *"
                            type="text"
                            value={holder.name}
                            onChange={(e) => updateTicketHolder(index, 'name', e.target.value)}
                            required
                          />
                          <Input
                            label="Email Address *"
                            type="email"
                            value={holder.email}
                            onChange={(e) => updateTicketHolder(index, 'email', e.target.value)}
                            required
                          />
                          <Input
                            label="Phone Number *"
                            type="tel"
                            value={holder.phone}
                            onChange={(e) => updateTicketHolder(index, 'phone', e.target.value)}
                            required
                          />
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      className="font-bold px-6 py-2 md:px-8 md:py-3"
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-6 md:top-8 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>IDR {ticket.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admin Fee</span>
                    <span>IDR 5,000</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 pt-2 font-bold">
                    <span>Total</span>
                    <span className="text-indigo-600">IDR {(ticket.price + 5000).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-bold mb-2">Event Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>Start: {new Date(event.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>End: {new Date(event.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}