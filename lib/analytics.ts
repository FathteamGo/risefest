'use client';

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
  page_path?: string;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    __GA_ID?: string;
    __FB_PIXEL_ID?: string;
  }
}

const getGaId = () =>
  (typeof window !== 'undefined' && window.__GA_ID) || '';

export const trackGAEvent = (eventName: EventNames, params?: EventParams) => {
  const gaId = getGaId();
  if (
    typeof window !== 'undefined' &&
    gaId &&
    typeof window.gtag === 'function'
  ) {
    window.gtag('event', eventName, params || {});
  }
};

export const trackFBEvent = (eventName: string, params?: any) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, params || {});
  }
};

export const trackEvent = (eventName: EventNames, params?: EventParams) => {
  trackGAEvent(eventName, params);

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

  trackFBEvent(fbEventMap[eventName], params);
};

export const trackPageView = (path: string) => {
  trackGAEvent('page_view', { page_path: path });
  trackFBEvent('PageView', { page_path: path });
};

export const trackEventRegistration = (
  eventId: string,
  eventName: string,
  value?: number,
) => {
  const params: EventParams = {
    currency: 'IDR',
    value: value || 0,
    content_name: eventName,
  };

  trackEvent('register_event', params);

  trackFBEvent('Lead', {
    content_name: eventName,
    content_ids: [eventId],
    currency: 'IDR',
    value: value || 0,
  });
};

export const trackPurchase = (
  transactionId: string,
  value: number,
  currency = 'IDR',
) => {
  const params: EventParams = {
    transaction_id: transactionId,
    currency,
    value,
  };

  trackEvent('purchase', params);

  trackFBEvent('Purchase', {
    currency,
    value,
    transaction_id: transactionId,
  });
};
