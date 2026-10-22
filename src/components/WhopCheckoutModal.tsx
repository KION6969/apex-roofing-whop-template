import React, { useState, useEffect } from 'react';
import { RoofingPlan } from '../roofing.config';
import { trackDepositStarted, fireWhopPixel } from '../lib/whop-tracking';
import { Shield, CheckCircle2, Lock, Smartphone, CreditCard, Sparkles, X, ChevronRight, Zap } from 'lucide-react';

interface WhopCheckoutModalProps {
  plan: RoofingPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (receipt: {
    planId: string;
    amount: number;
    paymentId: string;
    setupIntentId: string;
    paymentMethodSummary: string;
    customerEmail: string;
    customerName: string;
  }) => void;
}

export const WhopCheckoutModal: React.FC<WhopCheckoutModalProps> = ({
  plan,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [customerEmail, setCustomerEmail] = useState('marcus.homeowner@example.com');
  const [customerName, setCustomerName] = useState('Marcus Vance');
  const [selectedMethod, setSelectedMethod] = useState<'express' | 'card' | 'klarna'>('express');
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveCardOnFile, setSaveCardOnFile] = useState(true);
  const [whopElementsReady, setWhopElementsReady] = useState(false);

  useEffect(() => {
    if (isOpen && plan) {
      // Fire the required deposit_started pixel event
      trackDepositStarted(plan.id, plan.name, plan.price);

      // Attempt to initialize Whop Elements from CDN if available
      if (typeof window !== 'undefined' && (window as any).WhopElements) {
        setWhopElementsReady(true);
      }
    }
  }, [isOpen, plan]);

  if (!isOpen || !plan) return null;

  const isDeposit = plan.type === 'deposit';

  const handleSimulatedCheckout = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1200));

    const simulatedPaymentId = 'pay_' + Math.random().toString(36).substring(2, 12);
    const simulatedSetupIntentId = 'sint_' + Math.random().toString(36).substring(2, 12);
    const methodDesc = selectedMethod === 'express' ? 'Apple Pay (•••• 4242)' : selectedMethod === 'klarna' ? 'Klarna Pay in 4' : 'Visa Credit (•••• 4242)';

    // Fire conversion pixel event
    fireWhopPixel('purchase', {
      plan_id: plan.whopPlanId,
      value: plan.price,
      currency: 'USD',
      payment_id: simulatedPaymentId,
      setup_intent_id: simulatedSetupIntentId,
    });

    setIsProcessing(false);
    onPaymentSuccess({
      planId: plan.whopPlanId,
      amount: plan.price,
      paymentId: simulatedPaymentId,
      setupIntentId: simulatedSetupIntentId,
      paymentMethodSummary: methodDesc,
      customerEmail,
      customerName,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="checkout-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-branding">
            <span className="brand-pill">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              Whop Secure Payments
            </span>
            <span className="environment-badge">Sandbox / Live Ready</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Summary Banner */}
        <div className="order-summary-box">
          <div className="order-summary-main">
            <div>
              <span className="order-type-tag">
                {isDeposit ? 'PROJECT WORK DEPOSIT' : 'FIXED ROOFING SERVICE'}
              </span>
              <h3 className="order-title">{plan.name}</h3>
              <p className="order-tagline">{plan.tagline}</p>
            </div>
            <div className="order-price-wrap">
              <span className="order-currency">$</span>
              <span className="order-amount">{plan.price}</span>
              <span className="order-period">{isDeposit ? 'deposit' : 'total'}</span>
            </div>
          </div>

          {isDeposit && (
            <div className="deposit-callout">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong>Card-on-File Authorization:</strong> This $500 deposit secures your crew and reserves materials.
                A Whop <code>setup_intent</code> stores your payment method to seamlessly settle your final job balance ($4,500 typical) after project walkthrough.
              </div>
            </div>
          )}
        </div>

        {/* Customer Details Form */}
        <div className="customer-info-grid">
          <div>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="form-input"
              placeholder="e.g. Marcus Vance"
            />
          </div>
          <div>
            <label className="form-label">Email Receipt Address</label>
            <input
              type="email"
              value={customerEmail}
              onChange={e => setCustomerEmail(e.target.value)}
              className="form-input"
              placeholder="e.g. marcus@example.com"
            />
          </div>
        </div>

        {/* Whop Payment Elements Container */}
        <div className="whop-elements-container">
          <div className="elements-section-title">
            <span>Whop Payment Element & Express Checkout</span>
            <span className="pci-badge">PCI-DSS Level 1 Hosted</span>
          </div>

          {/* Express Checkout Element (Apple Pay / Google Pay) */}
          <div className="express-checkout-wrapper">
            <button
              type="button"
              className={`express-btn apple-pay ${selectedMethod === 'express' ? 'active-method' : ''}`}
              onClick={() => setSelectedMethod('express')}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Pay with Apple Pay / Google Pay
            </button>
            <div className="divider-or">
              <span>Or pay with financing or card</span>
            </div>
          </div>

          {/* Payment Method Selector (Including Whop BNPL: Klarna / Splitit / Afterpay) */}
          <div className="method-tiles-grid">
            <button
              type="button"
              className={`method-tile ${selectedMethod === 'klarna' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('klarna')}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span className="font-semibold text-sm">Klarna / Afterpay</span>
                </div>
                <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded">
                  4x ${(plan.price / 4).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-400 text-left mt-1">
                4 interest-free installments via Whop Payments. 0% APR.
              </p>
            </button>

            <button
              type="button"
              className={`method-tile ${selectedMethod === 'card' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('card')}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold text-sm">Credit / Debit Card</span>
                </div>
                <span className="text-xs text-slate-400">Visa, MC, Amex</span>
              </div>
              <p className="text-xs text-slate-400 text-left mt-1">
                Direct merchant checkout tokenized through Whop CDN frame.
              </p>
            </button>
          </div>

          {/* Card Input fields (PCI-isolated representation) */}
          {selectedMethod === 'card' && (
            <div className="hosted-card-fields">
              <div>
                <label className="form-label">Card Number</label>
                <div className="fake-card-input">
                  <span>4242 •••• •••• 4242</span>
                  <span className="test-badge">WHOP TEST CARD</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="form-label">Expiration</label>
                  <div className="fake-card-input"><span>12/28</span></div>
                </div>
                <div>
                  <label className="form-label">CVC</label>
                  <div className="fake-card-input"><span>•••</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Card-On-File Setup Intent Checkbox */}
          {isDeposit && (
            <label className="save-card-toggle">
              <input
                type="checkbox"
                checked={saveCardOnFile}
                onChange={e => setSaveCardOnFile(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span className="text-xs text-slate-300">
                Save payment method securely on file with Whop SetupIntent for the remaining project balance invoice upon final roof walkthrough.
              </span>
            </label>
          )}

          {/* Pay Button */}
          <button
            type="button"
            className="checkout-submit-btn"
            disabled={isProcessing}
            onClick={handleSimulatedCheckout}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner"></span>
                Processing via Whop Payments...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Pay ${plan.price}.00 {isDeposit ? 'Deposit' : 'Now'}
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </button>

          {/* Mandatory Whop BrandingElement */}
          <div className="branding-element-slot" id="payments-branding">
            <div className="branding-element-inner">
              <span className="powered-text">Powered by</span>
              <div className="whop-logo-pill">
                <span className="whop-w">W</span>
                <span className="whop-text">whop</span>
              </div>
              <span className="encrypted-text">• 256-bit Encrypted Checkout</span>
            </div>
          </div>
        </div>

        {/* Trust Guarantees */}
        <div className="modal-footer-guarantees">
          <div className="guarantee-item">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Refundable Deposit up to 72 hrs</span>
          </div>
          <div className="guarantee-item">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Inspection fee 100% credited to repairs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
