// lib/data-service.ts
// ✅ Unified data-access layer: real API vs dummy (auto switch)

import { events, eventTickets, ticketTransactions, admins } from './dummy-data';
import { eventApi, eventTicketApi, ticketTransactionApi, adminApi } from './api-client';
import type { Event, EventTicket, TicketTransaction, User } from '@/types';

const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';
type AnyObj = Record<string, any>;
const unwrap = (r: AnyObj) => r?.data ?? r?.result ?? r;

/**
 * Normalisasi objek transaksi:
 * - hapus semua key bernilai null (TS kamu pakai undefined utk optional)
 * - return dengan tipe yang kamu pakai sekarang
 */
function normalizeTx<T = any>(raw: any): T | undefined {
  if (!raw) return undefined;
  // deep clone ringan + drop nulls (1-level cukup untuk kasus ini)
  const t: AnyObj = { ...raw };
  Object.keys(t).forEach((k) => {
    if (t[k] === null) delete t[k];
  });
  return t as T;
}

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
  /* ── CREATE ─────────────────────────────── */
  async createTransaction(data: AnyObj): Promise<AnyObj> {
    if (USE_REAL_API) {
      const res = await ticketTransactionApi.createTransaction(data);
      // backend kamu biasanya bungkus {success,message,data:{...}}
      return unwrap(res);
    }

    // dummy mode
    const nowIso = new Date().toISOString();
    const id =
      (globalThis as any).crypto?.randomUUID?.() ??
      Math.random().toString(36).slice(2);

    // ⚠️ JANGAN set null. Biarkan field optional gak ada (undefined) biar cocok tipe TS kamu.
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
      ...(data.buyer_gender ? { buyer_gender: data.buyer_gender } : {}),
      ...(data.buyer_city ? { buyer_city: data.buyer_city } : {}),
      payment_method: data.payment_method,
      payment_status: 'pending',
      status: 'pending',
      total_amount: Number(data.total_amount || 0),
      created_at: nowIso,
      updated_at: nowIso,
      // checked_in_at: (jangan set null)
    };

    // simpan ke dummy store
    (ticketTransactions as AnyObj[]).push(newTx);

    // Simulasi snap / VA
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || 'https://risefest.fathforce.com';

    if (['gopay', 'qris'].includes(String(data.payment_method))) {
      return {
        transaction: normalizeTx<TicketTransaction>(newTx),
        snap_token: `dummy-snap-${id}`,
        payment_url: `${baseUrl}/ticket/${id}`,
      };
    }

    if (String(data.payment_method).startsWith('va_')) {
      const bank = String(data.payment_method).replace('va_', '').toUpperCase();
      const vaNumber = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      return {
        transaction: normalizeTx<TicketTransaction>(newTx),
        va_number: vaNumber,
        va_bank: bank,
      };
    }

    return { transaction: normalizeTx<TicketTransaction>(newTx) };
  },

  /* ── READ ─────────────────────────────── */
  async getById(uuid: string): Promise<TicketTransaction | undefined> {
    if (USE_REAL_API) {
      const res = await ticketTransactionApi.getTransactionByUuid(uuid);
      return normalizeTx<TicketTransaction>(unwrap(res));
    }
    const found = ticketTransactions.find((t) => t.id === uuid);
    return normalizeTx<TicketTransaction>(found);
  },

  async getTransaction(id: string): Promise<TicketTransaction | undefined> {
    return this.getById(id);
  },

  async getTransactionByUuid(uuid: string): Promise<TicketTransaction | undefined> {
    return this.getById(uuid);
  },

  /* ── UPDATE ─────────────────────────────── */
  async updateStatus(uuid: string, body: AnyObj): Promise<any> {
    if (USE_REAL_API) {
      const res = await ticketTransactionApi.updateTransactionStatus(uuid, body);
      return unwrap(res);
    }
    const t = ticketTransactions.find((x) => x.id === uuid) as AnyObj | undefined;
    if (t) {
      Object.assign(t, body, { updated_at: new Date().toISOString() });
      // drop nulls biar cocok tipe
      Object.keys(t).forEach((k) => t[k] === null && delete t[k]);
    }
    return normalizeTx<TicketTransaction>(t);
  },

  async updateTransactionStatus(uuid: string, body: AnyObj): Promise<any> {
    return this.updateStatus(uuid, body);
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
    return events.filter(
      (e) =>
        e.status === 'active' &&
        e.start_date <= now &&
        e.end_date >= now
    );
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
