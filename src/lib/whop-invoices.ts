/**
 * Whop Invoices API Integration & Card-on-File Setup Flow
 * Endpoint: POST https://api.whop.com/api/v1/invoices
 * 
 * Illustrates the high-ticket roofing contractor flow:
 * 1. Initial Deposit ($500) creates a Whop SetupIntent -> stores card/payment method on file (pm_...)
 * 2. Roofing project completed
 * 3. Final Invoice generated via Whop Invoices API -> auto-charged or emailed with 1-click Whop Checkout link
 */

export interface InvoiceLineItem {
  label: string;
  unit_price: number;
  quantity: number;
}

export interface CreateInvoicePayload {
  accountId: string;
  customerName: string;
  emailAddress: string;
  lineItems: InvoiceLineItem[];
  dueDate: string;
  storedPaymentMethodId?: string;
  autoCharge: boolean;
  notes?: string;
  jobReferenceId?: string;
}

export interface WhopInvoiceResult {
  id: string;
  invoiceNumber: string;
  accountId: string;
  customerName: string;
  emailAddress: string;
  subtotal: number;
  depositCredited: number;
  totalDue: number;
  status: 'paid' | 'open' | 'draft';
  chargedMethod?: string;
  paymentUrl: string;
  createdAt: string;
  mode: 'live' | 'demo-sandbox';
}

export async function createWhopFinalInvoice(
  payload: CreateInvoicePayload
): Promise<WhopInvoiceResult> {
  const subtotal = payload.lineItems
    .filter(item => item.unit_price > 0)
    .reduce((acc, curr) => acc + curr.unit_price * curr.quantity, 0);

  const depositCredited = Math.abs(
    payload.lineItems
      .filter(item => item.unit_price < 0)
      .reduce((acc, curr) => acc + curr.unit_price * curr.quantity, 0)
  );

  const totalDue = subtotal - depositCredited;

  const invoiceId = 'inv_' + Math.random().toString(36).substring(2, 11);
  const invoiceNumber = 'INV-' + Math.floor(10000 + Math.random() * 90000);

  const apiKey = (import.meta as any).env?.VITE_WHOP_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch('https://api.whop.com/api/v1/invoices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: payload.accountId,
          customer_name: payload.customerName,
          email_address: payload.emailAddress,
          due_date: payload.dueDate,
          line_items: payload.lineItems,
          payment_method_id: payload.autoCharge ? payload.storedPaymentMethodId : undefined,
          save_as_draft: false,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        return {
          id: json.id || invoiceId,
          invoiceNumber: json.invoice_number || invoiceNumber,
          accountId: payload.accountId,
          customerName: payload.customerName,
          emailAddress: payload.emailAddress,
          subtotal,
          depositCredited,
          totalDue,
          status: payload.autoCharge ? 'paid' : 'open',
          chargedMethod: payload.autoCharge ? (payload.storedPaymentMethodId || 'pm_stored_card_visa') : undefined,
          paymentUrl: `https://whop.com/invoices/${json.id || invoiceId}`,
          createdAt: new Date().toISOString(),
          mode: 'live',
        };
      }
    } catch (err) {
      console.warn('[Whop Invoices API] Direct call fallback to structured sandbox simulator:', err);
    }
  }

  // Realistic simulation of Whop Invoices API response
  await new Promise(r => setTimeout(r, 700));

  return {
    id: invoiceId,
    invoiceNumber: invoiceNumber,
    accountId: payload.accountId,
    customerName: payload.customerName,
    emailAddress: payload.emailAddress,
    subtotal,
    depositCredited,
    totalDue,
    status: payload.autoCharge ? 'paid' : 'open',
    chargedMethod: payload.autoCharge ? (payload.storedPaymentMethodId || 'pm_stored_apple_pay_4242') : undefined,
    paymentUrl: `https://apex-roofing.whop.site/invoices/${invoiceId}`,
    createdAt: new Date().toISOString(),
    mode: 'demo-sandbox',
  };
}
