import React, { useState } from 'react';
import { createWhopFinalInvoice, WhopInvoiceResult } from '../lib/whop-invoices';
import { FileText, CreditCard, Send, ArrowRight, DollarSign, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface InvoicesFlowDemoProps {
  depositData: {
    planId: string;
    amount: number;
    paymentId: string;
    setupIntentId: string;
    paymentMethodSummary: string;
    customerEmail: string;
    customerName: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WhopInvoicesFlowDemo: React.FC<InvoicesFlowDemoProps> = ({
  depositData,
  isOpen,
  onClose,
}) => {
  const [autoCharge, setAutoCharge] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<WhopInvoiceResult | null>(null);

  if (!isOpen) return null;

  const customerName = depositData?.customerName || 'Marcus Vance';
  const customerEmail = depositData?.customerEmail || 'marcus.homeowner@example.com';
  const setupIntentId = depositData?.setupIntentId || 'sint_94k20f9241a';
  const paymentMethod = depositData?.paymentMethodSummary || 'Apple Pay / Visa •••• 4242';

  const defaultLineItems = [
    { label: 'Owens Corning Duration Architectural Shingles (28 Squares)', unit_price: 3800, quantity: 1 },
    { label: 'Synthetic Underlayment, Valley Ice/Water Shield, & Drip Edge', unit_price: 700, quantity: 1 },
    { label: 'Chimney Flashing Sealant & Ridge Vent System', unit_price: 500, quantity: 1 },
    { label: 'Initial Project Deposit Credited (Receipt #' + (depositData?.paymentId ? depositData.paymentId.substring(0, 10) : 'pay_482910') + ')', unit_price: -500, quantity: 1 },
  ];

  const handleCreateInvoice = async () => {
    setIsSubmitting(true);
    const result = await createWhopFinalInvoice({
      accountId: 'biz_apexroofing_demo',
      customerName,
      emailAddress: customerEmail,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      lineItems: defaultLineItems,
      storedPaymentMethodId: autoCharge ? 'pm_stored_card_4242' : undefined,
      autoCharge,
      jobReferenceId: 'JOB-ROOF-2026-9812',
    });

    setGeneratedInvoice(result);
    setIsSubmitting(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="invoices-modal-card" onClick={e => e.stopPropagation()}>
        {/* Modal Top Bar */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="contractor-pill">
              Whop Invoices API Demo
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Step 3: Deposit → Job Completion → Final Balance</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Introduction */}
        <div className="invoices-flow-intro">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText style={{ width: 20, height: 20, color: '#f59e0b' }} />
            Whop Invoices API: Final Balance Settlement
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '0.35rem', lineHeight: 1.5 }}>
            Roofing jobs range from $5,000 to $25,000+. When the $500 deposit was paid, Whop's <code>SetupIntent</code> securely stored the homeowner's payment method. Now that the roof installation has passed inspection, bill the remaining balance via the Whop Invoices API.
          </p>
        </div>

        {/* Deposit Verification Card */}
        <div className="deposit-verified-badge">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>
              ✓
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10b981' }}>
                Deposit Received & Card-On-File Active
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff', marginTop: '0.15rem' }}>
                {customerName} • {customerEmail}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                SetupIntent: <code style={{ color: '#fcd34d' }}>{setupIntentId}</code> • Method: <span>{paymentMethod}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Deposit Paid</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981', fontFamily: 'monospace' }}>-$500.00</span>
          </div>
        </div>

        {/* Itemized Final Invoice Breakdown */}
        <div className="invoice-breakdown-card">
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '0.75rem' }}>
            Itemized Job Completion Statement
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
            {defaultLineItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: item.unit_price < 0 ? '#10b981' : '#e2e8f0', fontWeight: item.unit_price < 0 ? 700 : 500 }}>
                  {item.label}
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: item.unit_price < 0 ? '#10b981' : '#ffffff', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                  {item.unit_price < 0 ? `-$${Math.abs(item.unit_price)}.00` : `$${item.unit_price.toLocaleString()}.00`}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.875rem', marginTop: '0.5rem', fontSize: '0.9375rem', fontWeight: 800, color: '#ffffff' }}>
            <span>Remaining Final Job Balance Due:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'monospace' }}>$4,500.00</span>
          </div>
        </div>

        {/* Billing Method Selection */}
        <div className="billing-mode-selector">
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '0.75rem' }}>
            Select Whop Invoices Settlement Mode
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <label
              className={`mode-option-card ${autoCharge ? 'active' : ''}`}
              onClick={() => setAutoCharge(true)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <CreditCard style={{ width: 16, height: 16, color: '#10b981' }} />
                <span style={{ fontWeight: 800, fontSize: '0.875rem', color: '#ffffff' }}>1-Click Auto-Charge</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Immediately charge stored payment method (<code>{setupIntentId}</code>) through Whop Invoices API.
              </p>
            </label>

            <label
              className={`mode-option-card ${!autoCharge ? 'active' : ''}`}
              onClick={() => setAutoCharge(false)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Send style={{ width: 16, height: 16, color: '#38bdf8' }} />
                <span style={{ fontWeight: 800, fontSize: '0.875rem', color: '#ffffff' }}>Send Whop Invoice Email</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Sends a Whop invoice payment link with Klarna / Splitit financing options to the homeowner.
              </p>
            </label>
          </div>
        </div>

        {/* Execute Button */}
        {!generatedInvoice ? (
          <button
            type="button"
            className="invoice-execute-btn"
            disabled={isSubmitting}
            onClick={handleCreateInvoice}
          >
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <RefreshCw style={{ width: 18, height: 18 }} className="spinner" />
                <span>Calling Whop Invoices API (POST /api/v1/invoices)...</span>
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <DollarSign style={{ width: 18, height: 18 }} />
                <span>{autoCharge ? 'Auto-Charge Stored Card for $4,500.00' : 'Send $4,500.00 Whop Invoice'}</span>
                <ArrowRight style={{ width: 18, height: 18 }} />
              </span>
            )}
          </button>
        ) : (
          /* Success Receipt Card */
          <div className="invoice-receipt-result" style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '0.75rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <ShieldCheck style={{ width: 20, height: 20 }} />
              <span>
                {generatedInvoice.status === 'paid'
                  ? 'Invoice Paid & Auto-Charged Successfully via Whop API!'
                  : 'Whop Invoice Dispatched to Customer Email!'}
              </span>
            </div>
            <div style={{ background: '#090e1a', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1e293b', fontSize: '0.75rem', fontFamily: 'monospace', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
              <div>Invoice ID: <span style={{ color: '#fcd34d', fontWeight: 800 }}>{generatedInvoice.id}</span></div>
              <div>Invoice #: <span style={{ color: '#ffffff', fontWeight: 800 }}>{generatedInvoice.invoiceNumber}</span></div>
              <div>Total Settled: <span style={{ color: '#10b981', fontWeight: 800 }}>${generatedInvoice.totalDue.toLocaleString()}.00</span></div>
              <div>Status: <span style={{ textTransform: 'uppercase', color: '#10b981', fontWeight: 900 }}>{generatedInvoice.status}</span></div>
              <div>Payment Reference: <span style={{ color: '#38bdf8' }}>{generatedInvoice.chargedMethod || 'Whop Hosted Link'}</span></div>
              <div>Whop Portal: <a href={generatedInvoice.paymentUrl} target="_blank" rel="noreferrer" style={{ color: '#f59e0b', textDecoration: 'underline' }}>{generatedInvoice.paymentUrl}</a></div>
            </div>

            <button
              type="button"
              style={{ marginTop: '0.75rem', width: '100%', padding: '0.625rem', background: '#1e293b', border: 'none', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 700, borderRadius: '0.5rem', cursor: 'pointer' }}
              onClick={() => setGeneratedInvoice(null)}
            >
              Reset Invoice Simulator
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
