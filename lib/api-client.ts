const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cmsmj.fathforce.com/api';

type AnyObj = Record<string, any>;

async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(process.env.NEXT_PUBLIC_API_KEY ? { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers,
  });

  if (!res.ok) {
    let body = '';
    try {
      body = await res.text();
    } catch {}
    throw new Error(`API ${res.status} ${res.statusText} ${url} ${body}`);
  }

  return (await res.json()) as T;
}

const pickData = <T = any>(json: AnyObj): T => {
  if (json && typeof json === 'object' && 'data' in json) return json.data as T;
  return json as T;
};

/* =========================
   Event API
   ========================= */
export const eventApi = {
  async getAllEvents() {
    const json = await apiRequest('/dashboard/events');
    return pickData(json);
  },
  async getEventBySlug(slug: string) {
    const json = await apiRequest(`/dashboard/events/slug/${slug}`);
    return pickData(json);
  },
  async getEventById(id: number) {
    const json = await apiRequest(`/dashboard/events/${id}`);
    return pickData(json);
  },
  async searchEvents(query: string) {
    const json = await apiRequest(`/dashboard/events/search?q=${encodeURIComponent(query)}`);
    return pickData(json);
  },
};

/* =========================
   Event Ticket API
   ========================= */
export const eventTicketApi = {
  async getTicketsByEventId(eventId: number) {
    const json = await apiRequest(`/dashboard/event-tickets/event/${eventId}`);
    return pickData(json);
  },
  async getTicketById(id: number) {
    const json = await apiRequest(`/dashboard/event-tickets/${id}`);
    return pickData(json);
  },
};

/* =========================
   Ticket Transaction API
   ========================= */
export const ticketTransactionApi = {
  async createTransaction(data: AnyObj) {
    const json = await apiRequest('/dashboard/ticket-transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return pickData(json);
  },
  async getTransaction(idOrUuid: string) {
    const json = await apiRequest(`/dashboard/ticket-transactions/${idOrUuid}`);
    return pickData(json);
  },
  async getTransactionByUuid(uuid: string) {
    const json = await apiRequest(`/dashboard/ticket-transactions/${uuid}`);
    return pickData(json);
  },
  async updateTransactionStatus(uuid: string, body: AnyObj) {
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
  async login(email: string, password: string) {
    const json = await apiRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return pickData(json);
  },
  async getEventsForCheckIn() {
    const json = await apiRequest('/admin/events/check-in');
    return pickData(json);
  },
  async checkInTicket(uuid: string, adminId: number) {
    const json = await apiRequest('/admin/check-in', {
      method: 'POST',
      body: JSON.stringify({ uuid, admin_id: adminId }),
    });
    return pickData(json);
  },
};

/* =========================
   Payment Helpers (Midtrans confirm)
   ========================= */
export const paymentApi = {
  async confirmMidtrans(orderId: string) {
    const json = await apiRequest('/dashboard/payment/midtrans/confirm', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
    return pickData(json);
  },
};
