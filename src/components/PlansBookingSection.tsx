import React from 'react';
import { roofingConfig, RoofingPlan } from '../roofing.config';
import { ShieldCheck, Check, Zap, Lock, ChevronRight } from 'lucide-react';

interface PlansBookingSectionProps {
  onOpenCheckout: (plan: RoofingPlan) => void;
  onOpenInvoicesDemo: () => void;
}

export const PlansBookingSection: React.FC<PlansBookingSectionProps> = ({
  onOpenCheckout,
  onOpenInvoicesDemo,
}) => {
  const depositPlan = roofingConfig.plans.find(plan => plan.type === 'deposit');

  return (
    <section id="plans" className="section section-alt">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-pill emerald">
            <ShieldCheck style={{ width: 14, height: 14 }} />
            <span>Transparent Whop pricing — pay on the page</span>
          </div>
          <h2 className="section-title">
            Fixed Roofing Plans & Project Deposits
          </h2>
          <p className="section-subtitle">
            No high-pressure sales reps. Lock in your crew, book certified drone diagnostic scans, or order flat-rate storm tune-ups directly online. Powered by Whop Elements with Apple Pay, Google Pay, and Klarna 0% APR.
          </p>
        </div>

        {/* 3 Real Plans Grid */}
        <div className="grid-3">
          {roofingConfig.plans.map(plan => {
            const isDeposit = plan.type === 'deposit';

            return (
              <div
                key={plan.id}
                className={`plan-card ${plan.popular ? 'popular' : ''}`}
              >
                {/* Popular Badge Ribbon */}
                {plan.badge && (
                  <div className="popular-ribbon">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <span className="plan-type-label">
                    {isDeposit ? 'Project deposit + final invoice' : 'One-time service plan'}
                  </span>
                  <h3 className="plan-name">{plan.name}</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5 }}>{plan.tagline}</p>

                  <div className="plan-price-row">
                    <span className="plan-price">${plan.price}</span>
                    <span className="plan-period">
                      {isDeposit ? 'initial deposit' : 'flat fee'}
                    </span>
                  </div>

                  {isDeposit && plan.depositTerms && (
                    <div className="plan-deposit-notice">
                      <strong>Deposit flow:</strong> Pay ${plan.price} today. The remaining balance (~
                      ${plan.depositTerms.finalInvoiceEstimated.toLocaleString()}) is invoiced through Whop after your
                      final walkthrough.
                    </div>
                  )}

                  <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
                    What is included:
                  </div>

                  <ul className="plan-features-list">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="plan-feature-item">
                        <Check style={{ width: 16, height: 16, color: '#10b981', flexShrink: 0, marginTop: '0.15rem' }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card CTA & Whop Elements trigger */}
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    onClick={() => onOpenCheckout(plan)}
                    className={`btn btn-block ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    <Zap style={{ width: 18, height: 18, fill: plan.popular ? 'currentColor' : 'none' }} />
                    <span>Select & Pay ${plan.price} via Whop</span>
                    <ChevronRight style={{ width: 16, height: 16 }} />
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <Lock style={{ width: 12, height: 12, color: '#10b981' }} />
                    <span>Whop Elements Checkout • Apple Pay / Klarna</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* High Ticket Architecture Demonstration Explainer */}
        <div style={{ marginTop: '3.5rem', padding: '2rem', borderRadius: '1.25rem', background: '#020617', border: '1px solid rgba(245, 158, 11, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap', boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)' }}>
          <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: '#f59e0b', color: '#020617', fontWeight: 900, fontSize: '0.6875rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', textTransform: 'uppercase' }}>
                End-To-End Architecture
              </span>
              <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '1rem' }}>
                How Whop Nails the High-Ticket Contractor Flow
              </span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Whop&apos;s <strong>Checkout element</strong> takes the{' '}
              <strong>${depositPlan?.price ?? 500} deposit</strong> directly on this page — card, Apple Pay / Google Pay,
              and Klarna where your account enables them. When the roof is finished, the contractor creates the final{' '}
              <strong>${(depositPlan?.depositTerms?.finalInvoiceEstimated ?? 4500).toLocaleString()} invoice</strong> in
              Whop and the homeowner pays it the same way. This screen builds the itemized statement and deep-links to
              Whop, so there is no custom card form anywhere on the site.
            </p>
          </div>

          <button
            onClick={onOpenInvoicesDemo}
            className="btn btn-secondary"
            style={{ borderColor: 'rgba(245, 158, 11, 0.5)', color: '#fcd34d' }}
          >
            <span>Open final balance invoice</span>
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </section>
  );
};
