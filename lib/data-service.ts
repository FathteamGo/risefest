import {
  eventApi,
  eventTicketApi,
  ticketTransactionApi,
  adminApi,
  paymentApi,
  referralApi,
} from './api-client';
import type {
  Event,
  EventTicket,
  TicketTransaction,
  User,
  Referral,
} from '@/types';

type AnyObj = Record<string, any>;
const unwrap = (r: AnyObj) => r?.data ?? r?.result ?? r;

/* Event Service */
export const eventService = {
  async getAllEvents(): Promise<Event[]> {
    return await eventApi.getAllEvents();
  },
  async getEventBySlug(slug: string): Promise<Event> {
    return await eventApi.getEventBySlug(slug);
  },
  async getEventById(id: number): Promise<Event> {
    return await eventApi.getEventById(id);
  },
  async searchEvents(query: string): Promise<Event[]> {
    return await eventApi.searchEvents(query);
  },
};

/* Referral Service */
export const referralService = {
  async list(): Promise<Referral[]> {
    const r = await referralApi.getAll();
    return Array.isArray(r) ? r : [];
  },
};

/* Event Ticket Service */
export const eventTicketService = {
  async getTicketsByEventId(eventId: number): Promise<EventTicket[]> {
    return await eventTicketApi.getTicketsByEventId(eventId);
  },
  async getTicketById(id: number): Promise<EventTicket> {
    return await eventTicketApi.getTicketById(id);
  },
};

/* Ticket Transaction Service */
export const ticketTransactionService = {
  async createTransaction(data: AnyObj) {
    const res = await ticketTransactionApi.createTransaction(data);
    return unwrap(res);
  },
  async getByIdOrUuid(idOrUuid: string): Promise<TicketTransaction> {
    const res = await ticketTransactionApi.getTransaction(idOrUuid);
    return unwrap(res);
  },
  async getTransaction(id: string): Promise<TicketTransaction> {
    return this.getByIdOrUuid(id);
  },
  async getTransactionByUuid(uuid: string): Promise<TicketTransaction> {
    return this.getByIdOrUuid(uuid);
  },
  async updateStatus(uuid: string, body: AnyObj) {
    const res = await ticketTransactionApi.updateTransactionStatus(
      uuid,
      body,
    );
    return unwrap(res);
  },
  async updateTransactionStatus(uuid: string, body: AnyObj) {
    return this.updateStatus(uuid, body);
  },
  async confirmMidtrans(orderId: string) {
    const res = await paymentApi.confirmMidtrans(orderId);
    return unwrap(res);
  },
};

/* Admin Service */
export const adminService = {
  async login(email: string, password: string) {
    return await adminApi.login(email, password);
  },
  async getEventsForCheckIn() {
    return await adminApi.getEventsForCheckIn();
  },
  async checkInTicket(uuid: string, adminId: number) {
    await adminApi.checkInTicket(uuid, adminId);
    return true;
  },
};
