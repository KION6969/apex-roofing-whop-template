import React from 'react';
import { roofingConfig, RoofingPlan } from '../roofing.config';
import { ShieldCheck, Calendar, ArrowRight, Star, Award, CheckCircle, Zap } from 'lucide-react';

interface HeroProps {
  onOpenCheckout: (plan: RoofingPlan) => void;
  onScrollTo: (sectionId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCheckout, onScrollTo }) => {
  const depositPlan = roofingConfig.plans.find(p => p.type === 'deposit') || roofingConfig.plans[1];
  const inspectionPlan = roofingConfig.plans.find(p => p.type === 'inspection') || roofingConfig.plans[0];

  return (
    <section id="hero" className="section section-hero">
      <div className="container">
        <div className="grid-hero">
          {/* Left Column: Copy & Actions */}
          <div className="hero-content">
            <div className="section-pill">
              <Award style={{ width: 16, height: 16, color: '#f59e0b' }} />
              <span>GAF Master Elite® Certified • Top 2% in North America</span>
            </div>

            <h1 className="hero-title">
              Built to Withstand Storms.{' '}
              <span className="hero-highlight">
                Backed by 50-Year
              </span>{' '}
              Protection.
            </h1>

            <p className="hero-desc">
              Serving the {roofingConfig.serviceArea.primaryMetro}. From emergency storm mitigation and 4K drone diagnostics to full architectural shingle replacements. Lock your crew date online with Whop Payments and enjoy 0% APR financing up to 18 months.
            </p>

            <div className="hero-check-grid">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle style={{ width: 16, height: 16, color: '#f59e0b', flexShrink: 0 }} />
                <span>50-Year Non-Prorated Warranty</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle style={{ width: 16, height: 16, color: '#f59e0b', flexShrink: 0 }} />
                <span>2-4 Hr Emergency Storm Response</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle style={{ width: 16, height: 16, color: '#f59e0b', flexShrink: 0 }} />
                <span>Whop Checkout — deposit + final invoice</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle style={{ width: 16, height: 16, color: '#f59e0b', flexShrink: 0 }} />
                <span>Klarna / Splitit / Afterpay at Checkout</span>
              </div>
            </div>

            <div className="hero-btn-group">
              <button
                onClick={() => onOpenCheckout(depositPlan)}
                className="btn btn-primary btn-lg"
              >
                <Zap style={{ width: 20, height: 20, fill: 'currentColor' }} />
                <span>Lock In Project Deposit ($500)</span>
                <ArrowRight style={{ width: 18, height: 18 }} />
              </button>

              <button
                onClick={() => onOpenCheckout(inspectionPlan)}
                className="btn btn-secondary btn-lg"
              >
                <Calendar style={{ width: 20, height: 20, color: '#f59e0b' }} />
                <span>21-Pt Inspection ($149)</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #1e293b', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', color: '#f59e0b' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} style={{ width: 16, height: 16, fill: '#f59e0b' }} />
                  ))}
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>4.96/5.0</span>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({roofingConfig.company.reviewCount} Reviews)</span>
              </div>

              <div style={{ height: 16, width: 1, backgroundColor: '#334155' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                <ShieldCheck style={{ width: 16, height: 16, color: '#10b981' }} />
                <span>Whop Payments Verified Merchant</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="hero-card-frame">
            <div className="hero-card-inner">
              <div className="hero-img-box">
                <img
                  src="https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1000&q=80"
                  alt="Architectural Shingle Roofing"
                />
                <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ background: 'rgba(2,6,23,0.85)', padding: '0.3rem 0.6rem', borderRadius: '0.375rem', fontSize: '0.6875rem', fontWeight: 700, border: '1px solid #334155' }}>
                    Owens Corning Duration® Class 4
                  </span>
                  <span style={{ background: '#10b981', color: '#020617', padding: '0.3rem 0.6rem', borderRadius: '0.375rem', fontSize: '0.6875rem', fontWeight: 900 }}>
                    50-Yr Warranty
                  </span>
                </div>
              </div>

              <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 800 }}>
                  <span style={{ color: '#94a3b8' }}>Whop High-Ticket Flow</span>
                  <span style={{ color: '#f59e0b' }}>Deposit → Job → Invoice</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#090e1a', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #1e293b' }}>
                    <span style={{ color: '#cbd5e1' }}>1. Project Deposit</span>
                    <strong style={{ color: '#10b981', fontFamily: 'monospace' }}>${depositPlan.price}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#090e1a', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #1e293b' }}>
                    <span style={{ color: '#cbd5e1' }}>2. Tear-Off & Shingle Install</span>
                    <span style={{ color: '#94a3b8' }}>1-2 Days On-Site</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#090e1a', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #1e293b' }}>
                    <span style={{ color: '#cbd5e1' }}>3. Final Balance Invoice</span>
                    <strong style={{ color: '#f59e0b', fontFamily: 'monospace' }}>
                      ${(depositPlan.depositTerms?.finalInvoiceEstimated ?? 0).toLocaleString()} (Whop)
                    </strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onScrollTo('estimate')}
                className="btn btn-secondary btn-block btn-sm"
              >
                <span>Need an exact measurement first? Request Free Estimate</span>
                <ArrowRight style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
