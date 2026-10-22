/**
 * Final-balance invoice helper.
 *
 * Whop's public API does not expose invoice creation, so this template does the
 * honest thing instead of pretending:
 *
 *   • It builds the itemized final statement — labour, materials, and the
 *     deposit credit — from the same config that drives the site.
 *   • If `VITE_INVOICE_ENDPOINT` is set, it POSTs that payload to your own
 *     same-origin route, which can create the invoice through Whop with a
 *     server-held key and return `{ id, invoice_number, hosted_url }`.
 *   • Otherwise it returns a draft plus a deep link to the Whop dashboard,
 *     where invoices are created and emailed to the customer.
 *
 * No fake "paid" state is ever produced.
 */

import { whopRuntime } from './whop-runtime';

export interface InvoiceLineItem {
  label: string;
  unitPrice: number;
  quantity: number;
}

export interface CreateInvoicePayload {
  customerName: string;
  emailAddress: string;
  lineItems: InvoiceLineItem[];
  dueDate: string;
  notes?: string;
  jobReferenceId?: string;
}

export interface WhopInvoiceResult {
  invoiceNumber: string;
  customerName: string;
  emailAddress: string;
  subtotal: number;
  depositCredited: number;
  totalDue: number;
  /** `draft` = not yet created in Whop; `open` = created, awaiting payment. */
  status: 'draft' | 'open';
  mode: 'dashboard' | 'endpoint';
  lineItems: InvoiceLineItem[];
  dueDate: string;
  jobReferenceId: string;
  dashboardUrl: string;
  createdAt: string;
  /** Set only by the endpoint mode. */
  remoteId?: string;
  hostedUrl?: string;
  endpointStatus?: number;
  endpointError?: string;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function buildInvoiceNumber(jobReferenceId: string): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = jobReferenceId.replace(/\D/g, '').slice(-4) || String(Date.now()).slice(-4);
  return `INV-${stamp}-${suffix}`;
}

function dashboardLink(): string {
  const base = whopRuntime.invoiceDashboardUrl || 'https://whop.com/dashboard/';
  return base.endsWith('/') ? `${base}invoices` : `${base}/invoices`;
}

export async function createWhopFinalInvoice(
  payload: CreateInvoicePayload,
): Promise<WhopInvoiceResult> {
  const subtotal = round(
    payload.lineItems
      .filter(item => item.unitPrice > 0)
      .reduce((total, item) => total + item.unitPrice * item.quantity, 0),
  );

  const depositCredited = round(
    Math.abs(
      payload.lineItems
        .filter(item => item.unitPrice < 0)
        .reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    ),
  );

  const totalDue = round(subtotal - depositCredited);
  const jobReferenceId = payload.jobReferenceId || 'JOB-UNASSIGNED';
  const invoiceNumber = buildInvoiceNumber(jobReferenceId);

  const base: WhopInvoiceResult = {
    invoiceNumber,
    customerName: payload.customerName,
    emailAddress: payload.emailAddress,
    subtotal,
    depositCredited,
    totalDue,
    status: 'draft',
    mode: 'dashboard',
    lineItems: payload.lineItems,
    dueDate: payload.dueDate,
    jobReferenceId,
    dashboardUrl: dashboardLink(),
    createdAt: new Date().toISOString(),
  };

  if (!whopRuntime.invoiceEndpoint) return base;

  try {
    const response = await fetch(whopRuntime.invoiceEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account_id: whopRuntime.accountId,
        customer_name: payload.customerName,
        email_address: payload.emailAddress,
        due_date: payload.dueDate,
        line_items: payload.lineItems.map(item => ({
          label: item.label,
          unit_price: item.unitPrice,
          quantity: item.quantity,
        })),
        notes: payload.notes,
        metadata: { job_reference: jobReferenceId },
      }),
    });

    if (!response.ok) {
      return {
        ...base,
        endpointStatus: response.status,
        endpointError: `Invoice endpoint returned HTTP ${response.status}`,
      };
    }

    const json = (await response.json()) as {
      id?: string;
      invoice_number?: string;
      hosted_url?: string;
    };

    return {
      ...base,
      invoiceNumber: json.invoice_number || invoiceNumber,
      status: 'open',
      mode: 'endpoint',
      remoteId: json.id,
      hostedUrl: json.hosted_url,
      endpointStatus: response.status,
    };
  } catch (error) {
    return {
      ...base,
      endpointError: error instanceof Error ? error.message : 'Invoice endpoint unreachable',
    };
  }
}
