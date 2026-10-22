import React from 'react';
import { roofingConfig } from '../roofing.config';
import { Award, Star, CheckCircle2, ShieldCheck, Quote } from 'lucide-react';

export const TrustReviewsSection: React.FC = () => {
  return (
    <section id="reviews" className="section section-dark">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="section-pill">
            <Award style={{ width: 14, height: 14 }} />
            <span>Verified Track Record & Certifications</span>
          </div>
          <h2 className="section-title">
            Trusted by Over 4,800 Homeowners
          </h2>
          <p className="section-subtitle">
            We don't take shortcuts on flashing, ventilation, or fasteners. Here's what Texas homeowners say about our crews and seamless Whop Payments experience.
          </p>
        </div>

        {/* Certifications Badges Bar */}
        <div className="grid-4" style={{ marginBottom: '4rem' }}>
          {roofingConfig.certifications.map((cert, idx) => (
            <div
              key={idx}
              style={{ padding: '1.5rem', borderRadius: '1rem', background: '#090e1a', border: '1px solid #1e293b', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <ShieldCheck style={{ width: 22, height: 22 }} />
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>{cert.name}</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{cert.badgeText}</p>
            </div>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid-3">
          {roofingConfig.reviews.map(rev => (
            <div
              key={rev.id}
              style={{ padding: '1.75rem', borderRadius: '1.25rem', background: '#090e1a', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}
            >
              <Quote style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, color: '#1e293b', pointerEvents: 'none' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', color: '#f59e0b' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} style={{ width: 16, height: 16, fill: '#f59e0b' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 800, color: '#94a3b8', background: '#020617', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', border: '1px solid #1e293b' }}>
                    {rev.projectType}
                  </span>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{rev.comment}"
                </p>
              </div>

              <div style={{ paddingTop: '1rem', marginTop: '1.25rem', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#ffffff' }}>{rev.author}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{rev.location}</span>
                </div>

                {rev.verifiedWhopCustomer && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '0.2rem 0.5rem', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                    <CheckCircle2 style={{ width: 12, height: 12 }} />
                    <span>Whop Verified</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
