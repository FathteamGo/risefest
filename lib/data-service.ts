// Data Service Layer
// This module provides a unified interface for accessing data
// It can switch between dummy data and real API based on environment

import { events, eventTickets, ticketTransactions, admins } from './dummy-data';
import { 
  eventApi, 
  eventTicketApi, 
  ticketTransactionApi, 
  adminApi 
} from './api-client';
import { 
  Event, 
  EventTicket, 
  TicketTransaction, 
  User 
} from '@/types';

// Check if we should use the real API
const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';

// Event Service
export const eventService = {
  // Get all events
  getAllEvents: async (): Promise<Event[]> => {
    if (USE_REAL_API) {
      return await eventApi.getAllEvents();
    }
    return events;
  },

  // Get event by slug
  getEventBySlug: async (slug: string): Promise<Event | undefined> => {
    if (USE_REAL_API) {
      return await eventApi.getEventBySlug(slug);
    }
    return events.find(event => event.slug === slug);
  },

  // Search events
  searchEvents: async (query: string): Promise<Event[]> => {
    if (USE_REAL_API) {
      return await eventApi.searchEvents(query);
    }
    const lowerQuery = query.toLowerCase();
    return events.filter(event => 
      event.title.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery) ||
      event.location.toLowerCase().includes(lowerQuery)
    );
  },
};

// Event Ticket Service
export const eventTicketService = {
  // Get tickets for an event
  getTicketsByEventId: async (eventId: number): Promise<EventTicket[]> => {
    if (USE_REAL_API) {
      return await eventTicketApi.getTicketsByEventId(eventId);
    }
    return eventTickets.filter(ticket => ticket.event_id === eventId);
  },

  // Get ticket by ID
  getTicketById: async (id: number): Promise<EventTicket | undefined> => {
    if (USE_REAL_API) {
      return await eventTicketApi.getTicketById(id);
    }
    return eventTickets.find(ticket => ticket.id === id);
  },
};

// Ticket Transaction Service
export const ticketTransactionService = {
  // Create a new ticket transaction
  createTransaction: async (data: any): Promise<TicketTransaction> => {
    if (USE_REAL_API) {
      return await ticketTransactionApi.createTransaction(data);
    }
    // Mock implementation for dummy data
    const newTransaction: any = {
      id: Math.random().toString(36).substring(2, 15),
      event_id: data.event_id,
      event_ticket_id: data.event_ticket_id,
      ticket_holder_name: data.ticket_holder_name,
      ticket_holder_phone: data.ticket_holder_phone,
      ticket_holder_email: data.ticket_holder_email,
      buyer_name: data.buyer_name,
      buyer_phone: data.buyer_phone,
      buyer_email: data.buyer_email,
      buyer_gender: data.buyer_gender,
      buyer_city: data.buyer_city,
      payment_method: data.payment_method,
      payment_status: 'pending',
      status: 'pending',
      total_amount: data.total_amount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // In a real implementation, we would save this to the database
    // For dummy data, we just return the new transaction
    return newTransaction as TicketTransaction;
  },

  // Get transaction by UUID
  getTransactionByUuid: async (uuid: string): Promise<TicketTransaction | undefined> => {
    if (USE_REAL_API) {
      return await ticketTransactionApi.getTransactionByUuid(uuid);
    }
    const transaction = ticketTransactions.find(transaction => transaction.id === uuid);
    return transaction as TicketTransaction | undefined;
  },
};

// Admin Service
export const adminService = {
  // Admin login
  login: async (email: string, password: string): Promise<User | null> => {
    if (USE_REAL_API) {
      return await adminApi.login(email, password);
    }
    const admin = admins.find(user => user.email === email);
    // In a real implementation, we would verify the password hash
    // For dummy data, we just check if the user exists
    return admin || null;
  },

  // Get events for check-in
  getEventsForCheckIn: async (): Promise<Event[]> => {
    if (USE_REAL_API) {
      return await adminApi.getEventsForCheckIn();
    }
    // Return active events that are currently happening
    const now = new Date().toISOString();
    return events.filter(event => 
      event.status === 'active' && 
      event.start_date <= now && 
      event.end_date >= now
    );
  },

  // Check-in a ticket
  checkInTicket: async (uuid: string, adminId: number): Promise<boolean> => {
    if (USE_REAL_API) {
      await adminApi.checkInTicket(uuid, adminId);
      return true;
    }
    // Mock implementation for dummy data
    const transaction = ticketTransactions.find(t => t.id === uuid);
    if (transaction) {
      // In a real implementation, we would update the transaction in the database
      // For dummy data, we just return true to indicate success
      return true;
    }
    return false;
  },
};