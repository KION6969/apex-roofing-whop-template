import React, { useState } from 'react';
import { roofingConfig } from '../roofing.config';
import { submitWhopLead, WhopLeadResult } from '../lib/whop-leads';
import { trackEstimateRequested } from '../lib/whop-tracking';
import { Send, CheckCircle2, ShieldCheck, RefreshCw, FileText, Phone, Mail, MapPin } from 'lucide-react';

export const EstimateForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: 'Marcus Vance',
    email: 'marcus.homeowner@example.com',
    phone: '(214) 555-0182',
    address: '742 Evergreen Ridge Rd',
    zipCode: '75201',
    service: 'Full Roof Replacement',
    roofAge: '11-15 years',
    isInsuranceClaim: true,
    notes: 'Wind lifted several shingles on the west slope during last week thunderstorm.',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadResult, setLeadResult] = useState<WhopLeadResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Fire required custom Whop pixel event
    trackEstimateRequested({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      service: formData.service,
      zipCode: formData.zipCode,
    });

    // 2. Wire directly to Whop Leads API: POST /api/v1/leads
    const result = await submitWhopLead(
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        zipCode: formData.zipCode,
        serviceRequested: formData.service,
        roofAgeYears: formData.roofAge,
        isInsuranceClaim: formData.isInsuranceClaim,
        notes: formData.notes,
      },
      roofingConfig.whop.accountId
    );

    setLeadResult(result);
    setIsSubmitting(false);
  };

  return (
    <section id="estimate" className="section section-alt">
      <div className="container">
        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          {/* Left Column: Contact info & value guarantees */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="section-pill">
              <FileText style={{ width: 14, height: 14 }} />
              <span>Whop Leads API Connected</span>
            </div>

            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 0 }}>
              Request Your Free Comprehensive Estimate
            </h2>

            <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6 }}>
              Every request is automatically routed into our business account via the <strong>Whop Leads API</strong>. Our senior field estimator will review your aerial pitch and satellite measurements, then deliver an itemized PDF quote within 24 hours.
            </p>

            <div style={{ padding: '1.5rem', borderRadius: '1rem', background: '#020617', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#ffffff' }}>
                <ShieldCheck style={{ width: 18, height: 18, color: '#10b981' }} />
                <span>Our 4-Point Estimate Guarantee:</span>
              </div>
              <ul style={{ paddingLeft: '1.25rem', color: '#94a3b8', lineHeight: 1.6 }}>
                <li>No aggressive in-home sales pitches — transparent pricing upfront</li>
                <li>Full satellite EagleView square-footage measurement</li>
                <li>Good / Better / Best shingle options with 0% APR financing terms</li>
                <li>Insurance adjuster line-item negotiation support</li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Phone style={{ width: 16, height: 16, color: '#f59e0b' }} />
                <span>Direct Line: {roofingConfig.company.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail style={{ width: 16, height: 16, color: '#f59e0b' }} />
                <span>Estimating Desk: {roofingConfig.company.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MapPin style={{ width: 16, height: 16, color: '#f59e0b' }} />
                <span>{roofingConfig.company.officeAddress}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Form itself */}
          <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: '1.25rem', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)' }}>
            {!leadResult ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Property Owner Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      placeholder="Marcus Vance"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      placeholder="marcus@example.com"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="form-input"
                      placeholder="(214) 555-0182"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Postal Zip Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.zipCode}
                      onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                      className="form-input"
                      placeholder="75201"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="form-input"
                    placeholder="e.g. 742 Evergreen Ridge Rd"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Primary Service Needed</label>
                    <select
                      value={formData.service}
                      onChange={e => setFormData({ ...formData, service: e.target.value })}
                      className="form-select"
                    >
                      <option value="Full Roof Replacement">Full Roof Replacement</option>
                      <option value="Emergency Leak Repair">Emergency Leak Repair</option>
                      <option value="Drone Inspection & Certification">Drone Inspection & Certification</option>
                      <option value="Gutters & Flashing">Gutters & Flashing</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Estimated Roof Age</label>
                    <select
                      value={formData.roofAge}
                      onChange={e => setFormData({ ...formData, roofAge: e.target.value })}
                      className="form-select"
                    >
                      <option value="0-5 years">0-5 years (Newer)</option>
                      <option value="6-10 years">6-10 years (Mid-life)</option>
                      <option value="11-15 years">11-15 years (Wear starting)</option>
                      <option value="16-20+ years">16-20+ years (Replacement ready)</option>
                      <option value="Unknown">I don't know</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Project Details / Storm Damage Notes</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="form-textarea"
                    placeholder="Describe any active leaks, interior water stains, or recent hail storm details..."
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.25rem' }}>
                  <input
                    type="checkbox"
                    id="claimCheck"
                    checked={formData.isInsuranceClaim}
                    onChange={e => setFormData({ ...formData, isInsuranceClaim: e.target.checked })}
                    style={{ accentColor: '#f59e0b', width: 16, height: 16 }}
                  />
                  <label htmlFor="claimCheck" style={{ fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer' }}>
                    I have an open insurance claim or want help with insurance adjuster review
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-block btn-lg"
                  style={{ marginTop: '0.5rem' }}
                >
                  {isSubmitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <RefreshCw style={{ width: 18, height: 18 }} className="spinner" />
                      <span>Routing to Whop Leads API (POST /api/v1/leads)...</span>
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Send style={{ width: 18, height: 18 }} />
                      <span>Submit Estimate Request (Triggers Whop Leads API)</span>
                    </span>
                  )}
                </button>

                <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <span>Fires Whop custom pixel:</span>
                  <code style={{ color: '#f59e0b', fontWeight: 800 }}>estimate_requested</code>
                </div>
              </form>
            ) : (
              /* Success Receipt Card */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <CheckCircle2 style={{ width: 28, height: 28 }} />
                </div>

                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>Lead Successfully Captured on Whop!</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    Your estimate request has landed directly in our Whop account dashboard via the Whop Leads API.
                  </p>
                </div>

                {/* Whop API Payload Inspector */}
                <div style={{ background: '#090e1a', border: '1px solid #1e293b', borderRadius: '0.75rem', padding: '1rem', fontSize: '0.75rem', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
                    <span>API Status: <strong style={{ color: '#10b981' }}>201 CREATED</strong></span>
                    <span>Mode: <strong style={{ color: '#fcd34d' }}>{leadResult.mode}</strong></span>
                  </div>
                  <div>Lead ID: <span style={{ color: '#f59e0b', fontWeight: 800 }}>{leadResult.leadId}</span></div>
                  <div>Target Business: <span style={{ color: '#cbd5e1' }}>{leadResult.accountId}</span></div>
                  <div>Timestamp: <span style={{ color: '#94a3b8' }}>{leadResult.createdAt}</span></div>
                  <div style={{ paddingTop: '0.35rem' }}>
                    <span style={{ color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Captured Metadata:</span>
                    <pre style={{ background: '#020617', padding: '0.5rem', borderRadius: '0.375rem', color: '#cbd5e1', overflowX: 'auto' }}>
                      {JSON.stringify(leadResult.rawPayload.metadata, null, 2)}
                    </pre>
                  </div>
                </div>

                <button
                  onClick={() => setLeadResult(null)}
                  className="btn btn-secondary btn-block"
                >
                  Submit Another Quote Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
