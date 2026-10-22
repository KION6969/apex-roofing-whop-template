/**
 * Whop Tracking & Pixel Event Helper
 * Uses window.whop.track to dispatch custom pixel events.
 * Also keeps an in-memory event stream for the live inspector widget on demo sites.
 */

export interface TrackedPixelEvent {
  id: string;
  name: string;
  data: Record<string, any>;
  timestamp: string;
}

const pixelEventHistory: TrackedPixelEvent[] = [];
const listeners: ((events: TrackedPixelEvent[]) => void)[] = [];

function notifyListeners() {
  listeners.forEach(fn => fn([...pixelEventHistory]));
}

export function subscribeToPixelEvents(callback: (events: TrackedPixelEvent[]) => void) {
  listeners.push(callback);
  callback([...pixelEventHistory]);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export function getPixelHistory(): TrackedPixelEvent[] {
  return [...pixelEventHistory];
}

declare global {
  interface Window {
    whop?: {
      track?: (eventName: string, eventData?: Record<string, any>) => void;
      [key: string]: any;
    };
  }
}

/**
 * Fires a Whop Pixel event via window.whop.track
 */
export function fireWhopPixel(eventName: string, eventData: Record<string, any> = {}) {
  const event: TrackedPixelEvent = {
    id: 'evt_' + Math.random().toString(36).substring(2, 9),
    name: eventName,
    data: eventData,
    timestamp: new Date().toLocaleTimeString(),
  };

  pixelEventHistory.unshift(event);
  if (pixelEventHistory.length > 20) pixelEventHistory.pop();
  notifyListeners();

  // Call the official Whop Pixel if loaded on whop.app / whop.site
  if (typeof window !== 'undefined' && window.whop && typeof window.whop.track === 'function') {
    window.whop.track(eventName, eventData);
  } else {
    console.log(
      `%c[whop.track]%c ${eventName}`,
      'background: #ff6423; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
      'color: #ea580c; font-weight: bold;',
      eventData
    );
  }
}

/**
 * Custom Required Event: service_viewed
 */
export function trackServiceViewed(serviceId: string, title: string, category: string) {
  fireWhopPixel('service_viewed', {
    service_id: serviceId,
    service_title: title,
    category: category,
  });
}

/**
 * Custom Required Event: deposit_started
 */
export function trackDepositStarted(planId: string, planName: string, amount: number) {
  fireWhopPixel('deposit_started', {
    plan_id: planId,
    plan_name: planName,
    value: amount,
    currency: 'USD',
  });
}

/**
 * Custom Required Event: estimate_requested
 */
export function trackEstimateRequested(leadData: {
  name: string;
  email: string;
  phone: string;
  service: string;
  zipCode: string;
}) {
  fireWhopPixel('estimate_requested', {
    customer_name: leadData.name,
    customer_email: leadData.email,
    service_type: leadData.service,
    zip_code: leadData.zipCode,
    currency: 'USD',
  });
}
