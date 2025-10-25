'use client';

import { ENV } from '@/lib/env';

// Type definitions for better TypeScript support
type EventNames =
  | 'page_view'
  | 'view_item'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'search'
  | 'click'
  | 'view_event_details'
  | 'register_event'
  | 'generate_lead';

interface EventParams {
  [key: string]: string | number | boolean | undefined;
  currency?: string;
  value?: number;
  transaction_id?: string;
  content_name?: string;
}

/**
 * Track Google Analytics events
 */
export const trackGAEvent = (eventName: EventNames, params?: EventParams) => {
  const gaId = ENV.PUBLIC_GOOGLE_ANALYTICS_ID;
  
  if (typeof window !== 'undefined' && gaId && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

/**
 * Track Facebook Pixel events
 */
export const trackFBEvent = (eventName: string, params?: any) => {
  const fbPixelId = ENV.PUBLIC_FACEBOOK_PIXEL_ID;
  
  if (typeof window !== 'undefined' && fbPixelId && window.fbq) {
    window.fbq('track', eventName, params);
  }
};

/**
 * Track custom events for both GA and FB
 */
export const trackEvent = (eventName: EventNames, params?: EventParams) => {
  // Track in Google Analytics
  trackGAEvent(eventName, params);
  
  // Map GA event names to Facebook Pixel standard events
  const fbEventMap: Record<EventNames, string> = {
    page_view: 'PageView',
    view_item: 'ViewContent',
    add_to_cart: 'AddToCart',
    begin_checkout: 'InitiateCheckout',
    purchase: 'Purchase',
    search: 'Search',
    click: 'Lead',
    view_event_details: 'ViewContent',
    register_event: 'Lead',
    generate_lead: 'Lead',
  };
  
  // Track in Facebook Pixel
  trackFBEvent(fbEventMap[eventName], params);
};

/**
 * Track page view
 */
export const trackPageView = (path: string) => {
  trackGAEvent('page_view', { page_path: path });
  trackFBEvent('PageView');
};

/**
 * Track event registration
 */
export const trackEventRegistration = (eventId: string, eventName: string, value?: number) => {
  const params: EventParams = {
    currency: 'IDR',
    value: value || 0,
    content_name: eventName
  };
  
  trackEvent('register_event', params);
  
  // Also track specifically for Facebook Pixel
  trackFBEvent('Lead', {
    content_name: eventName,
    content_ids: [eventId],
    currency: 'IDR',
    value: value || 0,
  });
};

/**
 * Track purchase completion
 */
export const trackPurchase = (transactionId: string, value: number, currency = 'IDR') => {
  const params: EventParams = {
    transaction_id: transactionId,
    currency,
    value,
  };
  
  trackEvent('purchase', params);
  
  // Also track specifically for Facebook Pixel
  trackFBEvent('Purchase', {
    currency,
    value,
  });
};