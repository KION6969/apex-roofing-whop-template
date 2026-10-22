import React, { useState } from 'react';
import { roofingConfig, RoofingService, RoofingPlan } from '../roofing.config';
import { trackServiceViewed } from '../lib/whop-tracking';
import { Shield, Wrench, Check, ChevronRight, X, ArrowRight, Zap } from 'lucide-react';

interface ServicesSectionProps {
  onOpenCheckout: (plan: RoofingPlan) => void;
  onScrollTo: (sectionId: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onOpenCheckout,
  onScrollTo,
}) => {
  const [selectedService, setSelectedService] = useState<RoofingService | null>(null);

  const handleViewService = (service: RoofingService) => {
    setSelectedService(service);
    trackServiceViewed(service.id, service.title, service.category);
  };

  const handleBookFromService = (planId?: string) => {
    if (!planId) {
      onScrollTo('estimate');
      setSelectedService(null);
      return;
    }
    const plan = roofingConfig.plans.find(p => p.id === planId) || roofingConfig.plans[0];
    setSelectedService(null);
    onOpenCheckout(plan);
  };

  return (
    <section id="services" className="section section-dark">
      <div className="container">
        {/* Section Heading */}
        <div className="section-header">
          <div className="section-pill">
            <Wrench style={{ width: 14, height: 14 }} />
            <span>Commercial & Residential Roofing Services</span>
          </div>
          <h2 className="section-title">
            Storm-Tested Craftsmanship & Warranties
          </h2>
          <p className="section-subtitle">
            Every installation follows strict GAF & Owens Corning manufacturer specifications. Click any service below to explore specifications or book directly via Whop Payments.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid-4">
          {roofingConfig.services.map(service => (
            <div
              key={service.id}
              className="service-card"
              onClick={() => handleViewService(service)}
            >
              {/* Image Preview */}
              <div className="service-card-img">
                <img
                  src={service.image}
                  alt={service.title}
                  loading="lazy"
                />
                <span className="service-badge">{service.category}</span>
                <span className="service-price-tag">{service.startingPrice}</span>
              </div>

              {/* Content Body */}
              <div className="service-card-body">
                <div>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-desc" style={{ marginTop: '0.5rem' }}>{service.shortDesc}</p>
                </div>

                {/* Features Snippet */}
                <div style={{ borderTop: '1px solid #1e293b', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {service.features.slice(0, 2).map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                      <Check style={{ width: 14, height: 14, color: '#f59e0b', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Card Action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 800, color: '#f59e0b', paddingTop: '0.25rem' }}>
                  <span>View Details & Specs</span>
                  <ChevronRight style={{ width: 16, height: 16 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="modal-backdrop" onClick={() => setSelectedService(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="section-pill" style={{ marginBottom: 0 }}>{selectedService.category}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Fired <code>service_viewed</code> pixel event</span>
              </div>
              <button
                className="close-btn"
                onClick={() => setSelectedService(null)}
                aria-label="Close"
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ position: 'relative', height: 220, borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #1e293b' }}>
                <img
                  src={selectedService.image}
                  alt={selectedService.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>{selectedService.title}</h3>
                    <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.875rem' }}>{selectedService.startingPrice}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Full Scope of Work
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  {selectedService.fullDesc}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Standard Inclusions & Technical Specs
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {selectedService.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#020617', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #1e293b', fontSize: '0.75rem', color: '#f1f5f9' }}>
                      <Check style={{ width: 14, height: 14, color: '#10b981', flexShrink: 0 }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #1e293b', flexWrap: 'wrap' }}>
                {selectedService.recommendedPlanId && (
                  <button
                    onClick={() => handleBookFromService(selectedService.recommendedPlanId)}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    <Zap style={{ width: 18, height: 18 }} />
                    <span>Book Plan Directly via Whop</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedService(null);
                    onScrollTo('estimate');
                  }}
                  className="btn btn-secondary"
                >
                  <span>Request Custom Estimate</span>
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
