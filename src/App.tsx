import React, { useEffect, useState } from 'react';
import { roofingConfig, RoofingPlan } from './roofing.config';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { PlansBookingSection } from './components/PlansBookingSection';
import { FinancingSection } from './components/FinancingSection';
import { ServiceAreaSection } from './components/ServiceAreaSection';
import { TrustReviewsSection } from './components/TrustReviewsSection';
import { EstimateForm } from './components/EstimateForm';
import { Footer } from './components/Footer';
import { WhopCheckoutModal, type CheckoutReceipt } from './components/WhopCheckoutModal';
import { WhopInvoicesFlowDemo } from './components/WhopInvoicesFlowDemo';
import { LivePixelDebugger } from './components/LivePixelDebugger';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface Toast {
  tone: 'success' | 'error';
  message: string;
}

export const App: React.FC = () => {
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<RoofingPlan | null>(null);
  const [isInvoicesDemoOpen, setIsInvoicesDemoOpen] = useState(false);
  const [lastDepositReceipt, setLastDepositReceipt] = useState<CheckoutReceipt | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (tone: Toast['tone'], message: string) => {
    setToast({ tone, message });
    window.setTimeout(() => setToast(null), 9000);
  };

  /**
   * Whop appends `payment` and `status` to the checkout return URL. Show the
   * outcome, then strip those parameters so a refresh does not replay it.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('whop_return')) return;

    const status = params.get('status');
    const paymentId = params.get('payment');

    if (status === 'succeeded') {
      showToast('success', `Payment ${paymentId ?? ''} confirmed by Whop.`);
    } else if (status === 'failed') {
      showToast('error', 'Whop reported the payment as failed. Nothing was charged.');
    } else if (status === 'canceled') {
      showToast('error', 'Checkout was canceled. Nothing was charged.');
    } else if (status) {
      showToast('success', `Payment is still processing (${status}). We will email you when it settles.`);
    }

    params.delete('whop_return');
    params.delete('status');
    params.delete('payment');
    params.delete('setup');
    const query = params.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  }, []);

  const handleScrollTo = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePaymentSuccess = (receipt: CheckoutReceipt) => {
    setLastDepositReceipt(receipt);
    setSelectedPlanForCheckout(null);

    showToast(
      'success',
      `Payment of $${receipt.amount.toLocaleString()} received via Whop. Ref: ${receipt.paymentId}`,
    );

    // A deposit is the start of the invoice flow — open it after the receipt.
    if (receipt.planType === 'deposit') {
      window.setTimeout(() => setIsInvoicesDemoOpen(true), 1400);
    }
  };

  return (
    <div className="min-h-screen app-shell">
      {/* Toast Banner */}
      {toast && (
        <div
          className={`app-toast ${toast.tone === 'error' ? 'app-toast-error' : ''}`}
          role="status"
          aria-live="polite"
        >
          {toast.tone === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <Navbar
        onOpenCheckout={plan => setSelectedPlanForCheckout(plan)}
        onOpenInvoicesDemo={() => setIsInvoicesDemoOpen(true)}
        onScrollTo={handleScrollTo}
      />

      <main className="flex-1">
        <Hero
          onOpenCheckout={plan => setSelectedPlanForCheckout(plan)}
          onScrollTo={handleScrollTo}
        />

        <ServicesSection
          onOpenCheckout={plan => setSelectedPlanForCheckout(plan)}
          onScrollTo={handleScrollTo}
        />

        <PlansBookingSection
          onOpenCheckout={plan => setSelectedPlanForCheckout(plan)}
          onOpenInvoicesDemo={() => setIsInvoicesDemoOpen(true)}
        />

        <FinancingSection
          onOpenCheckout={plan => setSelectedPlanForCheckout(plan)}
          onScrollTo={handleScrollTo}
        />

        <ServiceAreaSection onScrollTo={handleScrollTo} />

        <TrustReviewsSection />

        <EstimateForm />
      </main>

      <Footer
        onScrollTo={handleScrollTo}
        onOpenInvoicesDemo={() => setIsInvoicesDemoOpen(true)}
      />

      <WhopCheckoutModal
        isOpen={!!selectedPlanForCheckout}
        plan={selectedPlanForCheckout}
        onClose={() => setSelectedPlanForCheckout(null)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <WhopInvoicesFlowDemo
        isOpen={isInvoicesDemoOpen}
        depositReceipt={lastDepositReceipt}
        onClose={() => setIsInvoicesDemoOpen(false)}
      />

      <LivePixelDebugger />
    </div>
  );
};
