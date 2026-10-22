import React, { useState } from 'react';
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
import { WhopCheckoutModal } from './components/WhopCheckoutModal';
import { WhopInvoicesFlowDemo } from './components/WhopInvoicesFlowDemo';
import { LivePixelDebugger } from './components/LivePixelDebugger';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<RoofingPlan | null>(null);
  const [isInvoicesDemoOpen, setIsInvoicesDemoOpen] = useState(false);
  const [lastDepositReceipt, setLastDepositReceipt] = useState<{
    planId: string;
    amount: number;
    paymentId: string;
    setupIntentId: string;
    paymentMethodSummary: string;
    customerEmail: string;
    customerName: string;
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const handleScrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePaymentSuccess = (receipt: {
    planId: string;
    amount: number;
    paymentId: string;
    setupIntentId: string;
    paymentMethodSummary: string;
    customerEmail: string;
    customerName: string;
  }) => {
    setLastDepositReceipt(receipt);
    setSelectedPlanForCheckout(null);

    // Show toast
    setNotification(
      `Payment of $${receipt.amount}.00 received via Whop Payments! Ref: ${receipt.paymentId}`
    );
    setTimeout(() => setNotification(null), 7000);

    // If it was a deposit, prompt opening the Invoices Demo
    if (receipt.amount === 500) {
      setTimeout(() => {
        setIsInvoicesDemoOpen(true);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Banner */}
      {notification && (
        <div className="fixed top-24 right-4 z-50 bg-emerald-500 text-slate-950 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Primary Navigation */}
      <Navbar
        onOpenCheckout={plan => setSelectedPlanForCheckout(plan)}
        onOpenInvoicesDemo={() => setIsInvoicesDemoOpen(true)}
        onScrollTo={handleScrollTo}
      />

      {/* Main Sections */}
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

      {/* Footer */}
      <Footer
        onScrollTo={handleScrollTo}
        onOpenInvoicesDemo={() => setIsInvoicesDemoOpen(true)}
      />

      {/* Modals & Live Tools */}
      <WhopCheckoutModal
        isOpen={!!selectedPlanForCheckout}
        plan={selectedPlanForCheckout}
        onClose={() => setSelectedPlanForCheckout(null)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <WhopInvoicesFlowDemo
        isOpen={isInvoicesDemoOpen}
        depositData={lastDepositReceipt}
        onClose={() => setIsInvoicesDemoOpen(false)}
      />

      {/* Floating Whop Pixel Event Stream Inspector */}
      <LivePixelDebugger />
    </div>
  );
};
