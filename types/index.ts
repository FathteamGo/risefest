// Type definitions based on the database structure from BRD

export type EventStatus = 'active' | 'inactive' | 'completed';

export type TicketStatus = 'active' | 'inactive' | 'sold_out';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';

export type TicketTransactionStatus = 'pending' | 'paid' | 'used' | 'cancelled';

export type UserRole = 'admin' | 'superadmin';

export type UserStatus = 'active' | 'inactive';

export type Gender = 'male' | 'female';

export interface Event {
  id: number;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  banner: string;
  location: string;
  link: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  status: EventStatus;
  is_featured: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface EventTicket {
  id: number;
  event_id: number;
  title: string;
  description: string;
  price: number;
  quota?: number;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  status: TicketStatus;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface TicketTransaction {
  id: string; // UUID
  event_id: number;
  event_ticket_id: number;
  ticket_holder_name: string;
  ticket_holder_phone: string;
  ticket_holder_email: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string;
  buyer_gender: Gender;
  buyer_city: string;
  payment_method: string;
  payment_status: PaymentStatus;
  status: TicketTransactionStatus;
  midtrans_order_id?: string;
  midtrans_transaction_id?: string;
  total_amount: number;
  checked_in_at?: string; // ISO date string
  checked_in_by?: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}