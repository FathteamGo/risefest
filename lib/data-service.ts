// lib/data-service.ts
// ✅ Unified data-access layer: real API vs dummy (auto switch)

import { events, eventTickets, ticketTransactions, admins } from './dummy-data';
import { eventApi, eventTicketApi, ticketTransactionApi, adminApi } from './api-client';
import type { Event, EventTicket, TicketTransaction, User } from '@/types';

const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';

type AnyObj = Record<string, any>;
const unwrap = (r: AnyObj) => r?.data ?? r?.result ?? r;

/* =========================
   Event Service
   ========================= */
export const eventService = {
  async getAllEvents(): Promise<Event[]> {
    if (USE_REAL_API) return await eventApi.getAllEvents();
    return events;
  },
  async getEventBySlug(slug: string): Promise<Event | undefined> {
    if (USE_REAL_API) return await eventApi.getEventBySlug(slug);
    return events.find((e) => e.slug === slug);
  },
  async searchEvents(query: string): Promise<Event[]> {
    if (USE_REAL_API) return await eventApi.searchEvents(query);
    const q = query.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
    );
  },
};

/* =========================
   Event Ticket Service
   ========================= */
export const eventTicketService = {
  async getTicketsByEventId(eventId: number): Promise<EventTicket[]> {
    if (USE_REAL_API) return await eventTicketApi.getTicketsByEventId(eventId);
    return eventTickets.filter((t) => t.event_id === eventId);
  },
  async getTicketById(id: number): Promise<EventTicket | undefined> {
    if (USE_REAL_API) return await eventTicketApi.getTicketById(id);
    return eventTickets.find((t) => t.id === id);
  },
};

/* =========================
   Ticket Transaction Service
   ========================= */
export const ticketTransactionService = {
  async createTransaction(data: AnyObj): Promise<AnyObj> {
    if (USE_REAL_API) {
      const res = await ticketTransactionApi.createTransaction(data);
      return unwrap(res);
    }

    // dummy
    const nowIso = new Date().toISOString();
    const id = (globalThis as any).crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    const newTx: AnyObj = {
      id,
      event_id: data.event_id,
      event_ticket_id: data.event_ticket_id,
      ticket_holder_name: data.ticket_holder_name,
      ticket_holder_phone: data.ticket_holder_phone,
      ticket_holder_email: data.ticket_holder_email,
      buyer_name: data.buyer_name,
      buyer_phone: data.buyer_phone,
      buyer_email: data.buyer_email,
      buyer_gender: data.buyer_gender ?? null,
      buyer_city: data.buyer_city ?? null,
      payment_method: data.payment_method,
      payment_status: 'pending',
      status: 'pending',
      total_amount: data.total_amount,
      created_at: nowIso,
      updated_at: nowIso,
    };

    if (['gopay', 'qris'].includes(String(data.payment_method))) {
      return {
        transaction: newTx,
        snap_token: `dummy-snap-${id}`,
        payment_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/ticket/${id}`,
      };
    }
    if (String(data.payment_method).startsWith('va_')) {
      const bank = String(data.payment_method).replace('va_', '').toUpperCase();
      return {
        transaction: newTx,
        va_number: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        va_bank: bank,
      };
    }
    return { transaction: newTx };
  },

  async getTransactionByUuid(uuid: string): Promise<TicketTransaction | undefined> {
    if (USE_REAL_API) {
      const res = await ticketTransactionApi.getTransactionByUuid(uuid);
      return unwrap(res);
    }
    return ticketTransactions.find((t) => t.id === uuid) as TicketTransaction | undefined;
  },

  // 🔹 supaya pemanggilan .getTransaction tidak error
  async getTransaction(id: string): Promise<TicketTransaction | undefined> {
    if (USE_REAL_API) {
      const res = await ticketTransactionApi.getTransaction(id);
      return unwrap(res);
    }
    return ticketTransactions.find((t) => t.id === id) as TicketTransaction | undefined;
  },

  // opsional: update status/payment_status dsb (backend PATCH /status)
  async updateTransactionStatus(uuid: string, body: AnyObj): Promise<any> {
    if (USE_REAL_API) {
      const res = await ticketTransactionApi.updateTransactionStatus(uuid, body);
      return unwrap(res);
    }
    const t = ticketTransactions.find((x) => x.id === uuid) as AnyObj | undefined;
    if (t) Object.assign(t, body);
    return t;
  },
};

/* =========================
   Admin Service
   ========================= */
export const adminService = {
  async login(email: string, password: string): Promise<User | null> {
    if (USE_REAL_API) return await adminApi.login(email, password);
    const found = admins.find((u) => u.email === email);
    return found || null;
  },

  async getEventsForCheckIn(): Promise<Event[]> {
    if (USE_REAL_API) return await adminApi.getEventsForCheckIn();
    const now = new Date().toISOString();
    return events.filter((e) => e.status === 'active' && e.start_date <= now && e.end_date >= now);
  },

  async checkInTicket(uuid: string, adminId: number): Promise<boolean> {
    if (USE_REAL_API) {
      await adminApi.checkInTicket(uuid, adminId);
      return true;
    }
    const t = ticketTransactions.find((x) => x.id === uuid);
    return !!t;
  },
};
