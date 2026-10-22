/**
 * Whop Pixel / custom event helper.
 *
 * On Whop Websites (whop.site) and whop.app hosting the pixel is already
 * installed: `window.whop.track(name, data)` is available and every call lands
 * in Dashboard â†’ Events. Locally there is no pixel, so a tiny shim in
 * `index.html` logs the calls and this module keeps retrying until the real
 * pixel appears (it normally does within a second of load).
 *
 * Nothing here fakes an event: the delivery field on every record says whether
 * Whop actually accepted it (`pixel`), it is still waiting (`queued`), or it
 * never left the browser (`local-shim`).
 */

import { whopRuntime, isRealAccountId } from './whop-runtime';

export type PixelDelivery = 'pixel' | 'queued' | 'local-shim';

export interface TrackedPixelEvent {
  id: string;
  name: string;
  data: Record<string, unknown>;
  timestamp: string;
  delivery: PixelDelivery;
}

interface WhopPixel {
  track?: (eventName: string, eventData?: Record<string, unknown>) => void;
  setScope?: (accountId: string) => void;
  q?: unknown[];
}

declare global {
  interface Window {
    whop?: WhopPixel;
    __whopPixelEvents?: TrackedPixelEvent[];
  }
}

const MAX_HISTORY = 25;
const pixelEventHistory: TrackedPixelEvent[] = [];
const listeners = new Set<(events: TrackedPixelEvent[]) => void>();

let scopeApplied = false;
let flushAttempts = 0;
let flushTimer: ReturnType<typeof setInterval> | null = null;

function notifyListeners() {
  const snapshot = [...pixelEventHistory];
  listeners.forEach(fn => fn(snapshot));
}

function readPixel(): WhopPixel | undefined {
  if (typeof window === 'undefined') return undefined;
  const pixel = window.whop;
  if (!pixel || typeof pixel.track !== 'function') return undefined;
  return pixel;
}

function applyScope(pixel: WhopPixel) {
  if (scopeApplied) return;
  if (!isRealAccountId(whopRuntime.accountId)) return;
  if (typeof pixel.setScope === 'function') {
    try {
      pixel.setScope(whopRuntime.accountId);
      scopeApplied = true;
      // The pixel snippet sends the first page view itself; send it once the
      // scope exists so the visit is attributed to the right business.
      pixel.track?.('page', { path: window.location.pathname });
    } catch (error) {
      console.warn('[whop.track] setScope failed', error);
    }
  }
}

function flushQueue() {
  const pixel = readPixel();
  if (!pixel) {
    if (flushAttempts++ > 20 && flushTimer) {
      clearInterval(flushTimer);
      flushTimer = null;
    }
    return;
  }

  applyScope(pixel);

  let flushed = false;
  for (const event of pixelEventHistory) {
    if (event.delivery !== 'queued') continue;
    try {
      pixel.track?.(event.name, event.data);
      event.delivery = 'pixel';
      flushed = true;
    } catch (error) {
      console.warn('[whop.track] delivery failed', event.name, error);
    }
  }

  if (flushed) {
    notifyListeners();
  }

  if (!pixelEventHistory.some(event => event.delivery === 'queued') && flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}

function queueForPixel() {
  if (flushTimer) return;
  flushAttempts = 0;
  flushTimer = setInterval(flushQueue, 500);
}

export function subscribeToPixelEvents(callback: (events: TrackedPixelEvent[]) => void) {
  listeners.add(callback);
  callback([...pixelEventHistory]);
  return () => {
    listeners.delete(callback);
  };
}

export function getPixelHistory(): TrackedPixelEvent[] {
  return [...pixelEventHistory];
}

/** True once at least one event was actually delivered to the Whop pixel. */
export function isPixelLive(): boolean {
  return pixelEventHistory.some(event => event.delivery === 'pixel');
}

function newEventId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `evt_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }
  return `evt_${Math.random().toString(36).slice(2, 14)}`;
}

/**
 * Fire one Whop pixel event. Safe to call before the pixel has loaded â€” the
 * call is queued and replayed once window.whop is the real pixel.
 */
export function fireWhopPixel(
  eventName: string,
  eventData: Record<string, unknown> = {},
): TrackedPixelEvent {
  const pixel = readPixel();

  const event: TrackedPixelEvent = {
    id: newEventId(),
    name: eventName,
    data: eventData,
    timestamp: new Date().toLocaleTimeString(),
    delivery: pixel ? 'pixel' : 'queued',
  };

  if (pixel) {
    applyScope(pixel);
    try {
      pixel.track?.(eventName, eventData);
    } catch (error) {
      event.delivery = 'queued';
      console.warn('[whop.track] delivery failed', eventName, error);
    }
  }

  pixelEventHistory.unshift(event);
  if (pixelEventHistory.length > MAX_HISTORY) pixelEventHistory.pop();

  if (typeof window !== 'undefined') {
    window.__whopPixelEvents = pixelEventHistory;
  }

  notifyListeners();

  if (event.delivery === 'queued') queueForPixel();

  if (!pixel) {
    console.info(`[whop.track] queued "${eventName}" until the Whop pixel loads`, eventData);
  }

  return event;
}

/* -------------------------------------------------------------------------- */
/* The five custom events the site fires                                      */
/* -------------------------------------------------------------------------- */

/** Fired when a service card is opened. */
export function trackServiceViewed(serviceId: string, title: string, category: string) {
  return fireWhopPixel('service_viewed', {
    service_id: serviceId,
    service_title: title,
    category,
  });
}

/** Fired the moment a checkout modal opens. */
export function trackDepositStarted(planId: string, planName: string, amount: number) {
  return fireWhopPixel('deposit_started', {
    plan_id: planId,
    plan_name: planName,
    value: amount,
    currency: 'USD',
  });
}

/** Fired when the estimate form is submitted. */
export function trackEstimateRequested(
  leadData: {
    name: string;
    email: string;
    phone: string;
    service: string;
    zipCode: string;
  },
  eventId?: string,
) {
  return fireWhopPixel('estimate_requested', {
    // Keep this distinct from the `lead` event's id: Whop dedupes on event_id,
    // and both events describe the same submission.
    event_id: eventId ? `${eventId}_estimate` : undefined,
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    postal_code: leadData.zipCode,
    service_type: leadData.service,
    currency: 'USD',
  });
}

/**
 * Fired after a checkout completes. Deliberately **not** named `purchase`:
 * Whop already records its own checkouts, and the docs warn against sending
 * `purchase` for a sale Whop processed (it would double count).
 */
export function trackCheckoutCompleted(input: {
  planId: string;
  planName: string;
  amount: number;
  paymentId: string;
  sessionId: string;
}) {
  return fireWhopPixel('checkout_completed', {
    plan_id: input.planId,
    plan_name: input.planName,
    value: input.amount,
    currency: 'USD',
    payment_id: input.paymentId,
    checkout_session_id: input.sessionId,
  });
}

/** Fired when a final-balance invoice draft is generated. */
export function trackInvoiceRequested(input: {
  invoiceNumber: string;
  totalDue: number;
  jobReference: string;
}) {
  return fireWhopPixel('invoice_requested', {
    invoice_number: input.invoiceNumber,
    value: input.totalDue,
    currency: 'USD',
    job_reference: input.jobReference,
  });
}
