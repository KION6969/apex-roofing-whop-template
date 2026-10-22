import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Checkout,
  CheckoutElement,
  WhopElements,
  type CheckoutPaymentCompletion,
  type CheckoutSetupCompletion,
  type CheckoutWaitlistCompletion,
} from '@whop/elements-react';
import { roofingConfig, type RoofingPlan } from '../roofing.config';
import { trackDepositStarted, trackCheckoutCompleted } from '../lib/whop-tracking';
import {
  WHOP_ENV_KEYS,
  envKeyForPlan,
  environmentLabel,
  getWhopElements,
  isPlanConfigured,
  resolvePlanId,
  whopRuntime,
} from '../lib/whop-runtime';
import {
  Shield,
  CheckCircle2,
  Lock,
  CreditCard,
  Sparkles,
  X,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

export interface CheckoutReceipt {
  planId: string;
  planName: string;
  planType: RoofingPlan['type'];
  amount: number;
  paymentId: string;
  sessionId: string;
  completedAt: string;
}

interface WhopCheckoutModalProps {
  plan: RoofingPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (receipt: CheckoutReceipt) => void;
}

type Completion = CheckoutPaymentCompletion | CheckoutWaitlistCompletion | CheckoutSetupCompletion;

const CheckoutSkeleton: React.FC = () => (
  <div className="whop-checkout-skeleton" aria-live="polite" aria-busy="true">
    <div className="skeleton-line skeleton-line-lg" />
    <div className="skeleton-line" />
    <div className="skeleton-line skeleton-line-sm" />
    <div className="skeleton-line skeleton-line-lg" />
  </div>
);

export const WhopCheckoutModal: React.FC<WhopCheckoutModalProps> = ({
  plan,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryLoad, setRetryLoad] = useState<(() => void) | null>(null);
  const [copied, setCopied] = useState(false);

  const planId = plan ? resolvePlanId(plan) : '';
  const configured = plan ? isPlanConfigured(plan) : false;

  useEffect(() => {
    if (isOpen && plan) {
      if (planId) trackDepositStarted(planId, plan.name, plan.price);
      setLoadError(null);
    }
  }, [isOpen, plan, planId]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const returnUrl = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    if (window.location.protocol !== 'https:') return undefined;
    return `${window.location.origin}${window.location.pathname}?whop_return=1`;
  }, []);

  const metadata = useMemo(
    () => ({
      plan_id: planId,
      plan_type: plan?.type ?? '',
      plan_name: plan?.name ?? '',
      business: roofingConfig.company.tradeName,
      source: 'website_checkout',
    }),
    [plan, planId],
  );

  const handleComplete = useCallback(
    (completion: Completion) => {
      if (!plan || completion.result !== 'payment') return;

      trackCheckoutCompleted({
        planId,
        planName: plan.name,
        amount: plan.price,
        paymentId: completion.paymentId,
        sessionId: completion.sessionId,
      });

      onPaymentSuccess({
        planId,
        planName: plan.name,
        planType: plan.type,
        amount: plan.price,
        paymentId: completion.paymentId,
        sessionId: completion.sessionId,
        completedAt: new Date().toISOString(),
      });
    },
    [onPaymentSuccess, plan, planId],
  );

  const copyEnvTemplate = async () => {
    const template = [
      `${WHOP_ENV_KEYS.accountId}=${roofingConfig.whop.accountId}`,
      `${WHOP_ENV_KEYS.environment}=production`,
      `${WHOP_ENV_KEYS.inspectionPlanId}=plan_…`,
      `${WHOP_ENV_KEYS.depositPlanId}=plan_…`,
      `${WHOP_ENV_KEYS.flatRatePlanId}=plan_…`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(template);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.info('[Whop setup] Copy this into .env:\n' + template);
    }
  };

  if (!isOpen || !plan) return null;

  const isDeposit = plan.type === 'deposit';
  const depositTerms = plan.depositTerms;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="checkout-modal-card"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Checkout — ${plan.name}`}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-branding">
            <span className="brand-pill">
              <Shield className="w-3.5 h-3.5" />
              Whop Secure Payments
            </span>
            <span className={`environment-badge ${whopRuntime.environment === 'sandbox' ? 'is-sandbox' : ''}`}>
              {environmentLabel()}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close checkout">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order summary */}
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

          {isDeposit && depositTerms && (
            <div className="deposit-callout">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-xs">
                {depositTerms.termsText} Typical final invoice:{' '}
                <strong>${depositTerms.finalInvoiceEstimated.toLocaleString()}</strong>.
              </div>
            </div>
          )}
        </div>

        {/* Payment surface */}
        <div className="whop-elements-container">
          <div className="elements-section-title">
            <span>Payment method</span>
            <span className="pci-badge">PCI-DSS — hosted by Whop</span>
          </div>

          {!configured && <SetupRequiredPanel plan={plan} onCopy={copyEnvTemplate} copied={copied} />}

          {configured && (
            <>
              {whopRuntime.environment === 'sandbox' && (
                <div className="sandbox-note">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Sandbox mode. Pay with <code>4242 4242 4242 4242</code>, any future expiry, any CVC.
                    Sandbox supports cards only.
                  </span>
                </div>
              )}

              {loadError ? (
                <div className="whop-load-error" role="alert">
                  <AlertTriangle className="w-4 h-4" />
                  <div>
                    <strong>Whop Elements did not load.</strong>
                    <p>{loadError}</p>
                    {retryLoad && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setLoadError(null);
                          retryLoad();
                        }}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="whop-checkout-shell">
                  <WhopElements
                    elements={getWhopElements()}
                    environment={whopRuntime.environment}
                    onLoadError={(error, retry) => {
                      setLoadError(error.message || 'Network error');
                      setRetryLoad(() => retry);
                    }}
                  >
                    <Checkout
                      key={planId}
                      plan={planId}
                      metadata={metadata}
                      returnUrl={returnUrl}
                      onComplete={handleComplete}
                    >
                      <CheckoutElement fallback={<CheckoutSkeleton />} />
                    </Checkout>
                  </WhopElements>
                </div>
              )}

              <div className="whop-disclaimer">
                <CreditCard className="w-3.5 h-3.5" />
                <span>
                  Card details are entered inside Whop&apos;s hosted element and never touch this site. Apple Pay,
                  Google Pay, Klarna and other methods appear automatically when your Whop account enables them.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Trust row */}
        <div className="modal-footer-guarantees">
          <div className="guarantee-item">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isDeposit ? 'Deposit 100% refundable up to 72h before materials' : 'Backed by our workmanship warranty'}</span>
          </div>
          <div className="guarantee-item">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isDeposit ? 'Balance invoiced after final walkthrough' : 'No hidden fees at checkout'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Shown until the three plan IDs are filled in.                              */
/* -------------------------------------------------------------------------- */

const SetupRequiredPanel: React.FC<{
  plan: RoofingPlan;
  onCopy: () => void;
  copied: boolean;
}> = ({ plan, onCopy, copied }) => {
  const rows = roofingConfig.plans.map(item => ({
    name: item.name,
    envKey: envKeyForPlan(item),
    value: resolvePlanId(item),
    ok: isPlanConfigured(item),
  }));

  return (
    <div className="whop-config-panel">
      <div className="whop-config-heading">
        <AlertTriangle className="w-4 h-4" />
        <strong>This plan is not connected to Whop yet</strong>
      </div>
      <p>
        Checkout is disabled on purpose instead of being simulated. Add the plan ID below, rebuild, and this exact
        panel is replaced by Whop&apos;s real checkout element.
      </p>

      <div className="whop-config-code">
        <span>{envKeyForPlan(plan)}=</span>
        <span className="whop-config-placeholder">plan_…</span>
      </div>

      <ul className="whop-config-list">
        {rows.map(row => (
          <li key={row.envKey}>
            <span className={row.ok ? 'whop-config-ok' : 'whop-config-missing'}>
              {row.ok ? '●' : '○'}
            </span>
            <code>{row.envKey}</code>
            <span className={row.ok ? 'whop-config-ok' : 'whop-config-missing'}>
              {row.ok ? 'connected' : 'missing'}
            </span>
          </li>
        ))}
      </ul>

      <button type="button" className="btn btn-secondary btn-sm" onClick={onCopy}>
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied' : 'Copy .env template'}
      </button>

      <p className="whop-config-hint">
        Create the three plans in{' '}
        <a href="https://whop.com/dashboard/" target="_blank" rel="noreferrer">
          Whop Dashboard → Products
        </a>{' '}
        (inspection fee, project deposit, flat-rate service), then paste their <code>plan_…</code> IDs here.
      </p>
    </div>
  );
};
