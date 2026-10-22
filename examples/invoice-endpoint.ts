/**
 * Reference implementation: POST /api/invoice
 *
 * The site builds the final-balance statement in the browser, then POSTs it here
 * if `VITE_INVOICE_ENDPOINT` is set. This route is where a real Whop invoice can
 * be created with a server-held key.
 *
 * ⚠️ Whop's public REST API does not currently document invoice creation, so
 * the endpoint path below is a placeholder that matches the invoice object the
 * dashboard produces. Confirm the path against your account's API reference
 * before relying on it, or have this route email the statement to your office
 * and create the invoice in Dashboard → Invoices (the default behavior of the
 * site when no endpoint is configured).
 *
 * Environment variables (server-side only):
 *   WHOP_API_KEY      API key with invoice write permission
 *   WHOP_ACCOUNT_ID   biz_…
 *   WHOP_API_ORIGIN   https://api.whop.com/api/v1
 */

export interface InvoiceRequestBody {
  account_id?: string;
  customer_name: string;
  email_address: string;
  due_date: string;
  line_items: Array<{ label: string; unit_price: number; quantity: number }>;
  notes?: string;
  metadata?: Record<string, string>;
}

const API_ORIGIN = process.env.WHOP_API_ORIGIN ?? 'https://api.whop.com/api/v1';

export async function handleInvoiceRequest(body: InvoiceRequestBody) {
  const apiKey = process.env.WHOP_API_KEY;
  const accountId = process.env.WHOP_ACCOUNT_ID ?? body.account_id;

  if (!apiKey) return { status: 500, body: { error: 'WHOP_API_KEY is not set' } };
  if (!accountId) return { status: 400, body: { error: 'account_id is required' } };
  if (!body.email_address) {
    return { status: 400, body: { error: 'email_address is required to send the invoice' } };
  }

  const response = await fetch(`${API_ORIGIN}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      account_id: accountId,
      customer_name: body.customer_name,
      email_address: body.email_address,
      due_date: body.due_date,
      line_items: body.line_items,
      notes: body.notes,
      metadata: body.metadata,
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    console.error('[invoice-endpoint] Whop rejected the invoice', response.status, text);
    return {
      status: 502,
      body: { error: 'Whop rejected the invoice', upstream_status: response.status, detail: text },
    };
  }

  const invoice = JSON.parse(text) as {
    id?: string;
    invoice_number?: string;
    hosted_url?: string;
  };

  // The browser expects exactly these three fields.
  return {
    status: 200,
    body: {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      hosted_url: invoice.hosted_url,
    },
  };
}

/* --------------------------------------------------------------------------- */
/* Example adapters                                                            */
/* --------------------------------------------------------------------------- */

// Express
// app.post('/api/invoice', async (req, res) => {
//   const result = await handleInvoiceRequest(req.body);
//   res.status(result.status).json(result.body);
// });

// Next.js App Router (app/api/invoice/route.ts)
// export async function POST(request: Request) {
//   const result = await handleInvoiceRequest(await request.json());
//   return Response.json(result.body, { status: result.status });
// }
