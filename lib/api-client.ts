// lib/api-client.ts
// API Client for backend integration

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cmsmj.fathforce.com/api';

/** Helper: fetch + JSON + error handling */
const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    // agar selalu ambil data terbaru (Next.js)
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.NEXT_PUBLIC_API_KEY
        ? { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}` }
        : {}),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(url, config);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `API request failed ${res.status} ${res.statusText} (${url}) ${body}`
    );
  }
  return (await res.json()) as T;
};

/** Helper: ambil .data jika ada, kalau tidak ya kembalikan objeknya */
const pickData = <T = any>(json: any): T => {
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T;
  }
  return json as T;
};

/* =========================
   Event API
   ========================= */
export const eventApi = {
  // Get all events → return Array<Event>
  getAllEvents: async () => {
    const json = await apiRequest('/dashboard/events');
    return pickData(json); // <-- penting: array langsung
  },

  // Get event by slug → return Event
  getEventBySlug: async (slug: string) => {
    const json = await apiRequest(`/dashboard/events/${slug}`);
    return pickData(json);
  },

  // Get event by ID → return Event
  getEventById: async (id: number) => {
    const json = await apiRequest(`/dashboard/events/${id}`);
    return pickData(json);
  },

  // Search events → return Array<Event>
  searchEvents: async (query: string) => {
    const json = await apiRequest(
      `/dashboard/events/search?q=${encodeURIComponent(query)}`
    );
    return pickData(json);
  },
};

/* =========================
   Event Ticket API
   ========================= */
export const eventTicketApi = {
  // Get tickets for an event → return Array<EventTicket>
  getTicketsByEventId: async (eventId: number) => {
    const json = await apiRequest(`/dashboard/event-tickets/event/${eventId}`);
    return pickData(json);
  },

  // Get ticket by ID → return EventTicket
  getTicketById: async (id: number) => {
    const json = await apiRequest(`/dashboard/event-tickets/${id}`);
    return pickData(json);
  },
};

/* =========================
   Ticket Transaction API
   ========================= */
export const ticketTransactionApi = {
  // Create a new ticket transaction → return TicketTransaction
  createTransaction: async (data: any) => {
    const json = await apiRequest('/dashboard/ticket-transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return pickData(json);
  },

  // Get transaction by UUID → return TicketTransaction
  getTransactionByUuid: async (uuid: string) => {
    const json = await apiRequest(`/dashboard/ticket-transactions/${uuid}`);
    return pickData(json);
  },

  // Update transaction status → return TicketTransaction / result
  updateTransactionStatus: async (uuid: string, status: string) => {
    const json = await apiRequest(`/dashboard/ticket-transactions/${uuid}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return pickData(json);
  },
};

/* =========================
   Admin API
   ========================= */
export const adminApi = {
  // Admin login → return User / token
  login: async (email: string, password: string) => {
    const json = await apiRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return pickData(json);
  },

  // Get events for check-in → return Array<Event>
  getEventsForCheckIn: async () => {
    const json = await apiRequest('/admin/events/check-in');
    return pickData(json);
  },

  // Check-in a ticket → return result
  checkInTicket: async (uuid: string, adminId: number) => {
    const json = await apiRequest('/admin/check-in', {
      method: 'POST',
      body: JSON.stringify({ uuid, admin_id: adminId }),
    });
    return pickData(json);
  },
};
