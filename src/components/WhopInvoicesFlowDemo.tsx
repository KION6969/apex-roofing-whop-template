import React, { useMemo, useState } from 'react';
import { roofingConfig } from '../roofing.config';
import { createWhopFinalInvoice, type WhopInvoiceResult } from '../lib/whop-invoices';
import { trackInvoiceRequested } from '../lib/whop-tracking';
import { whopRuntime } from '../lib/whop-runtime';
import type { CheckoutReceipt } from './WhopCheckoutModal';
import { FileText, Send, ArrowRight, DollarSign, RefreshCw, X, ExternalLink, Copy, Check } from 'lucide-react';

interface InvoicesFlowDemoProps {
  depositReceipt: CheckoutReceipt | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WhopInvoicesFlowDemo: React.FC<InvoicesFlowDemoProps> = ({
  depositReceipt,
  isOpen,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoice, setInvoice] = useState<WhopInvoiceResult | null>(null);
  const [copied, setCopied] = useState(false);

  const depositPlan = roofingConfig.plans.find(plan => plan.type === 'deposit');
  const depositAmount = depositPlan?.price ?? 500;
  const finalBalance = depositPlan?.depositTerms?.finalInvoiceEstimated ?? 4500;

  const lineItems = useMemo(() => {
    const subtotal = depositAmount + finalBalance;
    const materials = Math.round(subtotal * 0.72);
    const labour = Math.round(subtotal * 0.21);
    const disposal = subtotal - materials - labour;
    return [
      { label: 'Architectural shingles, underlayment & ice/water shield', unitPrice: materials, quantity: 1 },
      { label: 'Tear-off, deck repair & installation labour', unitPrice: labour, quantity: 1 },
      { label: 'Disposal, permits & final inspection', unitPrice: disposal, quantity: 1 },
      { label: `Project deposit credited (${depositReceipt?.paymentId ?? 'deposit'})`, unitPrice: -depositAmount, quantity: 1 },
    ];
  }, [depositAmount, depositReceipt?.paymentId, finalBalance]);

  const handleCreateInvoice = async () => {
    setIsSubmitting(true);

    const result = await createWhopFinalInvoice({
      customerName: 'Homeowner',
      emailAddress: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      lineItems,
      jobReferenceId: depositReceipt?.paymentId
        ? `JOB-${depositReceipt.paymentId.slice(4, 12).toUpperCase()}`
        : 'JOB-PREVIEW',
      notes: 'Final balance after completed installation and walkthrough inspection.',
    });

    trackInvoiceRequested({
      invoiceNumber: result.invoiceNumber,
      totalDue: result.totalDue,
      jobReference: result.jobReferenceId,
    });

    setInvoice(result);
    setIsSubmitting(false);
  };

  const copyStatement = async () => {
    if (!invoice) return;
    const text = [
      `Invoice ${invoice.invoiceNumber} — ${roofingConfig.company.name}`,
      ...invoice.lineItems.map(item => `${item.label}: $${item.unitPrice.toLocaleString()}`),
      `Total due: $${invoice.totalDue.toLocaleString()}`,
      `Due: ${new Date(invoice.dueDate).toLocaleDateString()}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.info(text);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="invoices-modal-card" onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Final balance invoice">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="contractor-pill">Final balance invoice</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Deposit → job completion → balance</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <div className="invoices-flow-intro">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText style={{ width: 20, height: 20, color: '#f59e0b' }} />
            Bill the remaining balance in Whop
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '0.35rem', lineHeight: 1.5 }}>
            {depositReceipt
              ? `Deposit ${depositReceipt.paymentId} is paid. Below is the itemized final statement with that deposit credited.`
              : 'Preview mode — no deposit has been paid in this session, so the reference below is a sample.'}{' '}
            Whop invoices are created and emailed from your Whop dashboard; this screen builds the exact statement
            and takes you there, or POSTs it to your own endpoint when{' '}
            <code>VITE_INVOICE_ENDPOINT</code> is configured.
          </p>
        </div>

        <div className="deposit-verified-badge">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: depositReceipt ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: depositReceipt ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
              {depositReceipt ? '✓' : 'i'}
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: depositReceipt ? '#10b981' : '#f59e0b' }}>
                {depositReceipt ? 'Deposit received' : 'Preview statement'}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                {depositReceipt
                  ? `Checkout ${depositReceipt.sessionId} • ${new Date(depositReceipt.completedAt).toLocaleString()}`
                  : 'Pay the $500 deposit from the plans section to attach a real receipt.'}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Deposit credited</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981', fontFamily: 'monospace' }}>
              -${depositAmount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="invoice-breakdown-card">
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '0.75rem' }}>
            Itemized job completion statement
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
            {lineItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.35rem 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: item.unitPrice < 0 ? '#10b981' : '#e2e8f0', fontWeight: item.unitPrice < 0 ? 700 : 500 }}>
                  {item.label}
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: item.unitPrice < 0 ? '#10b981' : '#ffffff', whiteSpace: 'nowrap' }}>
                  {item.unitPrice < 0 ? `-$${Math.abs(item.unitPrice).toLocaleString()}` : `$${item.unitPrice.toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.875rem', marginTop: '0.5rem', fontSize: '0.9375rem', fontWeight: 800, color: '#ffffff' }}>
            <span>Remaining balance due</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'monospace' }}>
              ${finalBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {!invoice ? (
          <button
            type="button"
            className="invoice-execute-btn"
            disabled={isSubmitting}
            onClick={handleCreateInvoice}
          >
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <RefreshCw style={{ width: 18, height: 18 }} className="spinner" />
                <span>Building invoice…</span>
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <DollarSign style={{ width: 18, height: 18 }} />
                <span>Generate ${finalBalance.toLocaleString()} invoice</span>
                <ArrowRight style={{ width: 18, height: 18 }} />
              </span>
            )}
          </button>
        ) : (
          <div className="invoice-receipt-result">
            <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: invoice.mode === 'endpoint' ? '#10b981' : '#fcd34d', fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <FileText style={{ width: 18, height: 18 }} />
                <span>
                  {invoice.mode === 'endpoint'
                    ? 'Invoice created through your endpoint'
                    : 'Draft ready — create it in Whop'}
                </span>
              </div>

              <div style={{ background: '#090e1a', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1e293b', fontSize: '0.75rem', fontFamily: 'monospace', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                <div>Invoice #: <span style={{ color: '#ffffff', fontWeight: 800 }}>{invoice.invoiceNumber}</span></div>
                <div>Reference: <span style={{ color: '#cbd5e1' }}>{invoice.jobReferenceId}</span></div>
                <div>Subtotal: <span style={{ color: '#cbd5e1' }}>${invoice.subtotal.toLocaleString()}</span></div>
                <div>Deposit credited: <span style={{ color: '#10b981' }}>-${invoice.depositCredited.toLocaleString()}</span></div>
                <div>Total due: <span style={{ color: '#f59e0b', fontWeight: 800 }}>${invoice.totalDue.toLocaleString()}</span></div>
                <div>Due date: <span style={{ color: '#cbd5e1' }}>{new Date(invoice.dueDate).toLocaleDateString()}</span></div>
                <div>Status: <span style={{ textTransform: 'uppercase', color: invoice.status === 'open' ? '#10b981' : '#fcd34d', fontWeight: 800 }}>{invoice.status}</span></div>
                {invoice.remoteId && <div>Whop ID: <span style={{ color: '#38bdf8' }}>{invoice.remoteId}</span></div>}
                {invoice.endpointError && <div style={{ color: '#fda4af' }}>Endpoint: {invoice.endpointError}</div>}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <a
                  href={invoice.hostedUrl || invoice.dashboardUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <ExternalLink style={{ width: 14, height: 14 }} />
                  Open in Whop
                </a>
                <button type="button" className="btn btn-secondary btn-sm" onClick={copyStatement} style={{ flex: 1, justifyContent: 'center' }}>
                  {copied ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
                  {copied ? 'Copied' : 'Copy statement'}
                </button>
              </div>

              <button
                type="button"
                style={{ marginTop: '0.75rem', width: '100%', padding: '0.625rem', background: '#1e293b', border: 'none', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 700, borderRadius: '0.5rem', cursor: 'pointer' }}
                onClick={() => setInvoice(null)}
              >
                Regenerate
              </button>
            </div>
          </div>
        )}

        <div className="invoice-flow-footer">
          <Send style={{ width: 14, height: 14 }} />
          <span>
            Whop account: <code>{whopRuntime.accountId}</code>
          </span>
        </div>
      </div>
    </div>
  );
};
