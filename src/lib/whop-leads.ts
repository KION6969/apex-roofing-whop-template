/**
 * Estimate form → Whop lead.
 *
 * Whop has two documented ways to record a lead against a business:
 *
 *   1. `whop.track('lead', …)` from the browser — the pixel is already running
 *      on Whop-hosted sites, and the event shows up in Dashboard → Events and
 *      Dashboard → People. This is the path Whop recommends.
 *   2. `POST /api/v1/events` from a server with an `event:create` API key —
 *      same event name, same person, but the key stays server-side.
 *
 * This module does (1) always, and (2) only when `VITE_LEAD_ENDPOINT` points
 * at a same-origin route that holds the API key. The browser never sees a
 * Whop secret.
 */

import { fireWhopPixel, type TrackedPixelEvent } from './whop-tracking';
import { whopRuntime, isRealAccountId } from './whop-runtime';

export interface LeadSubmissionPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  zipCode: string;
  serviceRequested: string;
  roofAgeYears?: string;
  isInsuranceClaim: boolean;
  notes?: string;
}

export type LeadDelivery = 'whop-pixel' | 'whop-pixel+endpoint';

export interface WhopLeadResult {
  success: boolean;
  /** `lead_…` — also used as the Whop `event_id`, so retries collapse. */
  leadId: string;
  eventId: string;
  accountId: string;
  createdAt: string;
  /** Which delivery paths accepted the lead. */
  mode: LeadDelivery;
  message: string;
  /** The exact custom pixel event that was fired. */
  pixelEvent: TrackedPixelEvent;
  /** Present only when an endpoint was configured. */
  endpointStatus?: number;
  endpointError?: string;
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 14)}`;
}

/** The Whop visitor ID the pixel stores, used to attribute a server-side event. */
export function readWhopVisitorId(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|;\s*)_wuid=([^;]*)/);
  if (match) return decodeURIComponent(match[1]);
  try {
    return localStorage.getItem('_wuid') || undefined;
  } catch {
    return undefined;
  }
}

export async function submitWhopLead(payload: LeadSubmissionPayload): Promise<WhopLeadResult> {
  const eventId = createId('lead');
  const leadId = eventId;
  const createdAt = new Date().toISOString();
  const [firstName, ...rest] = payload.name.trim().split(/\s+/);

  // 1. Browser pixel event. Standard event name `lead`, so Whop treats it the
  //    same way it treats a lead from any other pixel on any other site.
  const pixelEvent = fireWhopPixel('lead', {
    event_id: eventId,
    value: 0,
    currency: 'usd',
    customer_name: payload.name,
    customer_email: payload.email,
    customer_phone: payload.phone,
    first_name: firstName,
    last_name: rest.join(' '),
    service_type: payload.serviceRequested,
    zip_code: payload.zipCode,
    insurance_claim: payload.isInsuranceClaim ? 'yes' : 'no',
    lead_source: 'website_estimate_form',
  });

  let endpointStatus: number | undefined;
  let endpointError: string | undefined;

  // 2. Optional server-side copy: keeps the API key off the page and gives the
  //    contractor a record even if the buyer blocks the pixel.
  if (whopRuntime.leadEndpoint) {
    try {
      const response = await fetch(whopRuntime.leadEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: whopRuntime.accountId,
          event_id: eventId,
          event_name: 'lead',
          event_time: createdAt,
          action_source: 'website',
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          user: {
            anonymous_id: readWhopVisitorId(),
            email: payload.email,
            phone: payload.phone,
            first_name: firstName,
            last_name: rest.join(' '),
            external_id: leadId,
          },
          lead: payload,
        }),
      });

      endpointStatus = response.status;
      if (!response.ok) {
        endpointError = `Endpoint returned HTTP ${response.status}`;
      }
    } catch (error) {
      endpointError = error instanceof Error ? error.message : 'Endpoint unreachable';
    }
  }

  const endpointAccepted = Boolean(whopRuntime.leadEndpoint) && !endpointError;
  const mode: LeadDelivery = endpointAccepted ? 'whop-pixel+endpoint' : 'whop-pixel';

  return {
    success: true,
    leadId,
    eventId,
    accountId: isRealAccountId(whopRuntime.accountId) ? whopRuntime.accountId : 'not-configured',
    createdAt,
    mode,
    message: endpointAccepted
      ? 'Lead recorded by the Whop pixel and forwarded to your server endpoint.'
      : 'Lead recorded as a Whop `lead` event. Open Dashboard → Events to see it.',
    pixelEvent,
    endpointStatus,
    endpointError,
  };
}
