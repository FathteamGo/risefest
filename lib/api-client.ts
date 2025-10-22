// lib/api-client.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

/** Helper: fetch + JSON + error handling */
const apiRequest = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(process.env.NEXT_PUBLIC_API_KEY
        ? { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}` }
        : {}),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(url, config);
  if (!res.ok) {
    let bodyText = '';
    try {
      bodyText = await res.text();
    } catch {}
    throw new Error(`API request failed ${res.status} ${res.statusText} (${url}) ${bodyText}`);
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
  getAllEvents: async () => {
    const json = await apiRequest('/dashboard/events');
    return pickData(json);
  },
  getEventBySlug: async (slug: string) => {
    const json = await apiRequest(`/dashboard/events/slug/${slug}`);
    return pickData(json);
  },
  getEventById: async (id: number) => {
    const json = await apiRequest(`/dashboard/events/${id}`);
    return pickData(json);
  },
  searchEvents: async (query: string) => {
    const json = await apiRequest(`/dashboard/events/search?q=${encodeURIComponent(query)}`);
    return pickData(json);
  },
};

/* =========================
   Event Ticket API
   ========================= */
export const eventTicketApi = {
  getTicketsByEventId: async (eventId: number) => {
    const json = await apiRequest(`/dashboard/event-tickets/event/${eventId}`);
    return pickData(json);
  },
  getTicketById: async (id: number) => {
    const json = await apiRequest(`/dashboard/event-tickets/${id}`);
    return pickData(json);
  },
};

/* =========================
   Ticket Transaction API
   ========================= */
export const ticketTransactionApi = {
  createTransaction: async (data: any) => {
    const json = await apiRequest('/dashboard/ticket-transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return pickData(json);
  },

  // 🔹 Tambahan agar tidak error TS: getTransaction (by id/uuid sama endpoint)
  getTransaction: async (id: string) => {
    const json = await apiRequest(`/dashboard/ticket-transactions/${id}`);
    return pickData(json);
  },

  getTransactionByUuid: async (uuid: string) => {
    const json = await apiRequest(`/dashboard/ticket-transactions/${uuid}`);
    return pickData(json);
  },

  updateTransactionStatus: async (uuid: string, body: any) => {
    const json = await apiRequest(`/dashboard/ticket-transactions/${uuid}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return pickData(json);
  },
};

/* =========================
   Admin API
   ========================= */
export const adminApi = {
  login: async (email: string, password: string) => {
    const json = await apiRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return pickData(json);
  },
  getEventsForCheckIn: async () => {
    const json = await apiRequest('/admin/events/check-in');
    return pickData(json);
  },
  checkInTicket: async (uuid: string, adminId: number) => {
    const json = await apiRequest('/admin/check-in', {
      method: 'POST',
      body: JSON.stringify({ uuid, admin_id: adminId }),
    });
    return pickData(json);
  },
};
