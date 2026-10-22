import React, { useState } from 'react';
import { roofingConfig, RoofingPlan } from '../roofing.config';
import { Calculator, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

interface FinancingSectionProps {
  onOpenCheckout: (plan: RoofingPlan) => void;
  onScrollTo: (sectionId: string) => void;
}

export const FinancingSection: React.FC<FinancingSectionProps> = ({
  onOpenCheckout,
  onScrollTo,
}) => {
  const [projectTotal, setProjectTotal] = useState<number>(8500);
  const [loanTerm, setLoanTerm] = useState<number>(36); // months

  const monthlyPayment = Math.round(projectTotal / loanTerm);
  const fourPayAmount = (projectTotal / 4).toFixed(2);

  const depositPlan = roofingConfig.plans.find(p => p.type === 'deposit') || roofingConfig.plans[1];

  return (
    <section id="financing" className="section section-dark">
      <div className="container">
        <div className="grid-2">
          {/* Left Column: Financing Benefits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="section-pill pink">
              <Sparkles style={{ width: 14, height: 14 }} />
              <span>Whop Native Buy Now, Pay Later (BNPL)</span>
            </div>

            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 0 }}>
              {roofingConfig.financing.heading}
            </h2>

            <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6 }}>
              Don't compromise on your home's protective envelope due to out-of-pocket budget constraints. With Whop Payments, flexible financing options from <strong>Klarna, Splitit, and Afterpay</strong> surface automatically in checkout.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {roofingConfig.financing.highlights.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: '#f1f5f9' }}>
                  <CheckCircle2 style={{ width: 18, height: 18, color: '#10b981', flexShrink: 0, marginTop: '0.15rem' }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Supported Financing Providers Logos / Pills */}
            <div style={{ paddingTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 800, display: 'block', marginBottom: '0.5rem' }}>
                Available Natively Inside Whop Checkout:
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {roofingConfig.financing.providers.map((p, i) => (
                  <span
                    key={i}
                    style={{ background: '#090e1a', border: '1px solid #1e293b', padding: '0.4rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ paddingTop: '0.75rem' }}>
              <button
                onClick={() => onOpenCheckout(depositPlan)}
                className="btn btn-primary btn-lg"
              >
                <span>Lock In $500 Deposit With 0% Financing</span>
                <ArrowRight style={{ width: 18, height: 18 }} />
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Financing Calculator */}
          <div style={{ background: '#090e1a', border: '1px solid #334155', borderRadius: '1.25rem', padding: '2rem', boxShadow: '0 20px 45px -15px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '0.625rem', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calculator style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ffffff' }}>Roofing Payment Estimator</h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Powered by Whop Flexible Payments</p>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '0.3rem 0.65rem', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                No Hard Credit Pull
              </span>
            </div>

            {/* Slider Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  <span style={{ color: '#cbd5e1' }}>Estimated Project Total:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'monospace' }}>
                    ${projectTotal.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="25000"
                  step="500"
                  value={projectTotal}
                  onChange={e => setProjectTotal(Number(e.target.value))}
                  style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', outline: 'none', cursor: 'pointer', accentColor: '#f59e0b' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                  <span>$2,000 (Repairs)</span>
                  <span>$10,000 (Avg Roof)</span>
                  <span>$25,000+ (Tile/Metal)</span>
                </div>
              </div>

              {/* Term Selector */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                  Payment Schedule:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { term: 4, label: 'Pay in 4 (Klarna)' },
                    { term: 18, label: '18 Mos (0% APR)' },
                    { term: 36, label: '36 Mos (Low APR)' },
                  ].map(opt => (
                    <button
                      key={opt.term}
                      type="button"
                      onClick={() => setLoanTerm(opt.term)}
                      style={{
                        padding: '0.625rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: loanTerm === opt.term ? '#f59e0b' : '#020617',
                        color: loanTerm === opt.term ? '#020617' : '#cbd5e1',
                        border: loanTerm === opt.term ? '1px solid #f59e0b' : '1px solid #1e293b',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated Output Result Box */}
              <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
                    {loanTerm === 4 ? '4 Equal Bi-Weekly Payments:' : `Estimated Monthly (${loanTerm} Mos):`}
                  </span>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace' }}>
                    ${loanTerm === 4 ? fourPayAmount : monthlyPayment}
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#94a3b8' }}>/{loanTerm === 4 ? 'installment' : 'mo'}</span>
                  </span>
                </div>

                <button
                  onClick={() => onScrollTo('estimate')}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#f59e0b' }}
                >
                  Get Exact Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
