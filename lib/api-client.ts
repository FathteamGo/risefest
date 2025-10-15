// API Client for backend integration
// This module provides functions to interact with the backend API
// It follows the same structure as dummy-data.ts but with actual API calls

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

// Helper function to handle API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request error for ${url}:`, error);
    throw error;
  }
};

// Event API functions
export const eventApi = {
  // Get all events
  getAllEvents: async () => {
    return apiRequest('/events');
  },

  // Get event by slug
  getEventBySlug: async (slug: string) => {
    return apiRequest(`/events/slug/${slug}`);
  },

  // Get event by ID
  getEventById: async (id: number) => {
    return apiRequest(`/events/${id}`);
  },

  // Search events
  searchEvents: async (query: string) => {
    return apiRequest(`/events/search?q=${encodeURIComponent(query)}`);
  },
};

// Event Ticket API functions
export const eventTicketApi = {
  // Get tickets for an event
  getTicketsByEventId: async (eventId: number) => {
    return apiRequest(`/event-tickets/event/${eventId}`);
  },

  // Get ticket by ID
  getTicketById: async (id: number) => {
    return apiRequest(`/event-tickets/${id}`);
  },
};

// Ticket Transaction API functions
export const ticketTransactionApi = {
  // Create a new ticket transaction
  createTransaction: async (data: any) => {
    return apiRequest('/ticket-transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get transaction by UUID
  getTransactionByUuid: async (uuid: string) => {
    return apiRequest(`/ticket-transactions/${uuid}`);
  },

  // Update transaction status
  updateTransactionStatus: async (uuid: string, status: string) => {
    return apiRequest(`/ticket-transactions/${uuid}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// Admin API functions
export const adminApi = {
  // Admin login
  login: async (email: string, password: string) => {
    return apiRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Get events for check-in (currently active events)
  getEventsForCheckIn: async () => {
    return apiRequest('/admin/events/check-in');
  },

  // Check-in a ticket
  checkInTicket: async (uuid: string, adminId: number) => {
    return apiRequest('/admin/check-in', {
      method: 'POST',
      body: JSON.stringify({ uuid, admin_id: adminId }),
    });
  },
};