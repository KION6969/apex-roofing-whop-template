/**
 * Reference implementation: POST /api/lead
 *
 * The site fires `whop.track('lead', …)` in the browser, so a lead is recorded on
 * Whop Websites even without this route. Deploy this only if you also want the
 * lead in your own system / want to send it from a server (for example when the
 * buyer blocks the pixel).
 *
 * Point VITE_LEAD_ENDPOINT at this route.
 *
 * Environment variables (server-side only — never expose these to the browser):
 *   WHOP_API_KEY      API key with the `event:create` permission
 *   WHOP_ACCOUNT_ID   biz_…
 *   WHOP_API_ORIGIN   https://api.whop.com/api/v1  (sandbox: https://sandbox-api.whop.com/api/v1)
 *
 * Whop docs: https://docs.whop.com/developer/ads/events-api
 *
 * Framework-agnostic: `handleLeadRequest` takes a parsed body and returns
 * `{ status, body }`. Wrap it in Express, Hono, Next route handlers, Cloudflare
 * Workers, etc.
 */

export interface LeadRequestBody {
  account_id?: string;
  event_id: string;
  event_name: 'lead';
  event_time: string;
  action_source: 'website';
  url?: string;
  user: {
    anonymous_id?: string; // `_wuid` cookie from the Whop pixel
    email: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    external_id?: string;
  };
  lead: {
    name: string;
    email: string;
    phone: string;
    address: string;
    zipCode: string;
    serviceRequested: string;
    roofAgeYears?: string;
    isInsuranceClaim: boolean;
    notes?: string;
  };
}

const API_ORIGIN = process.env.WHOP_API_ORIGIN ?? 'https://api.whop.com/api/v1';

export async function handleLeadRequest(body: LeadRequestBody) {
  const apiKey = process.env.WHOP_API_KEY;
  const accountId = process.env.WHOP_ACCOUNT_ID ?? body.account_id;

  if (!apiKey) return { status: 500, body: { error: 'WHOP_API_KEY is not set' } };
  if (!accountId) return { status: 400, body: { error: 'account_id is required' } };

  // Whop's Events API accepts the same event shape the pixel sends. `event_id`
  // makes the call idempotent: replaying the same submission will not duplicate
  // the lead.
  const payload = {
    account_id: accountId,
    event_id: body.event_id,
    event_name: 'lead',
    event_time: body.event_time,
    action_source: body.action_source,
    url: body.url,
    user: {
      anonymous_id: body.user.anonymous_id,
      email: body.user.email,
      phone: body.user.phone,
      first_name: body.user.first_name,
      last_name: body.user.last_name,
    },
    metadata: {
      external_id: body.user.external_id,
      service_type: body.lead.serviceRequested,
      service_address: body.lead.address,
      zip_code: body.lead.zipCode,
      roof_age_years: body.lead.roofAgeYears ?? 'unknown',
      insurance_claim: body.lead.isInsuranceClaim ? 'yes' : 'no',
      notes: body.lead.notes ?? '',
      lead_source: 'website_estimate_form',
    },
  };

  const response = await fetch(`${API_ORIGIN}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  if (!response.ok) {
    console.error('[lead-endpoint] Whop rejected the event', response.status, text);
    return {
      status: 502,
      body: { error: 'Whop Events API rejected the lead', upstream_status: response.status, detail: text },
    };
  }

  return {
    status: 200,
    body: { ok: true, event_id: body.event_id, upstream_status: response.status },
  };
}

/* --------------------------------------------------------------------------- */
/* Example adapters                                                            */
/* --------------------------------------------------------------------------- */

// Express
// import express from 'express';
// const app = express();
// app.use(express.json());
// app.post('/api/lead', async (req, res) => {
//   const result = await handleLeadRequest(req.body);
//   res.status(result.status).json(result.body);
// });

// Next.js App Router (app/api/lead/route.ts)
// export async function POST(request: Request) {
//   const result = await handleLeadRequest(await request.json());
//   return Response.json(result.body, { status: result.status });
// }
