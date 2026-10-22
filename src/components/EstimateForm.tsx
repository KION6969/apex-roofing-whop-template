import React, { useState } from 'react';
import { roofingConfig } from '../roofing.config';
import { submitWhopLead, type WhopLeadResult } from '../lib/whop-leads';
import { trackEstimateRequested } from '../lib/whop-tracking';
import { Send, CheckCircle2, ShieldCheck, RefreshCw, FileText, Phone, Mail, MapPin, Radio } from 'lucide-react';

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

    // Custom pixel event #1 — visible in the stream inspector and in Whop.
    trackEstimateRequested({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      service: formData.service,
      zipCode: formData.zipCode,
    });

    // Standard `lead` event + optional server-side copy.
    const result = await submitWhopLead({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      zipCode: formData.zipCode,
      serviceRequested: formData.service,
      roofAgeYears: formData.roofAge,
      isInsuranceClaim: formData.isInsuranceClaim,
      notes: formData.notes,
    });

    setLeadResult(result);
    setIsSubmitting(false);
  };

  return (
    <section id="estimate" className="section section-alt">
      <div className="container">
        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="section-pill">
              <FileText style={{ width: 14, height: 14 }} />
              <span>Whop lead event + optional API forward</span>
            </div>

            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 0 }}>
              Request Your Free Comprehensive Estimate
            </h2>

            <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6 }}>
              Every submission fires a standard <code>whop.track(&#39;lead&#39;, …)</code> event, so the request
              appears in your Whop dashboard under Events and People. Set{' '}
              <code>VITE_LEAD_ENDPOINT</code> to also forward the same lead to your own server with a
              server-held Whop API key.
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

          {/* Right column: form */}
          <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: '1.25rem', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)' }}>
            {!leadResult ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-row-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="lead-name">Property Owner Full Name *</label>
                    <input
                      id="lead-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      placeholder="Marcus Vance"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="lead-email">Email Address *</label>
                    <input
                      id="lead-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      placeholder="marcus@example.com"
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="lead-phone">Phone Number *</label>
                    <input
                      id="lead-phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="form-input"
                      placeholder="(214) 555-0182"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="lead-zip">Postal Zip Code *</label>
                    <input
                      id="lead-zip"
                      type="text"
                      required
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={formData.zipCode}
                      onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                      className="form-input"
                      placeholder="75201"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="lead-address">Street Address</label>
                  <input
                    id="lead-address"
                    type="text"
                    autoComplete="street-address"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="form-input"
                    placeholder="e.g. 742 Evergreen Ridge Rd"
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="lead-service">Primary Service Needed</label>
                    <select
                      id="lead-service"
                      value={formData.service}
                      onChange={e => setFormData({ ...formData, service: e.target.value })}
                      className="form-select"
                    >
                      {roofingConfig.services.map(service => (
                        <option key={service.id} value={service.title}>{service.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="lead-roof-age">Estimated Roof Age</label>
                    <select
                      id="lead-roof-age"
                      value={formData.roofAge}
                      onChange={e => setFormData({ ...formData, roofAge: e.target.value })}
                      className="form-select"
                    >
                      <option value="0-5 years">0-5 years (Newer)</option>
                      <option value="6-10 years">6-10 years (Mid-life)</option>
                      <option value="11-15 years">11-15 years (Wear starting)</option>
                      <option value="16-20+ years">16-20+ years (Replacement ready)</option>
                      <option value="Unknown">I don&apos;t know</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="lead-notes">Project Details / Storm Damage Notes</label>
                  <textarea
                    id="lead-notes"
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
                      <span>Recording lead…</span>
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Send style={{ width: 18, height: 18 }} />
                      <span>Submit Estimate Request</span>
                    </span>
                  )}
                </button>

                <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <span>Fires</span>
                  <code style={{ color: '#f59e0b', fontWeight: 800 }}>whop.track(&#39;lead&#39;)</code>
                  <span>and</span>
                  <code style={{ color: '#f59e0b', fontWeight: 800 }}>estimate_requested</code>
                </div>
              </form>
            ) : (
              /* Success receipt */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <CheckCircle2 style={{ width: 28, height: 28 }} />
                </div>

                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>Lead recorded</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    {leadResult.message}
                  </p>
                </div>

                <div style={{ background: '#090e1a', border: '1px solid #1e293b', borderRadius: '0.75rem', padding: '1rem', fontSize: '0.75rem', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span>
                      Pixel:{' '}
                      <strong style={{ color: leadResult.pixelEvent.delivery === 'pixel' ? '#10b981' : '#fcd34d' }}>
                        {leadResult.pixelEvent.delivery}
                      </strong>
                    </span>
                    <span>
                      Mode: <strong style={{ color: '#fcd34d' }}>{leadResult.mode}</strong>
                    </span>
                  </div>
                  <div>Lead ID: <span style={{ color: '#f59e0b', fontWeight: 800 }}>{leadResult.leadId}</span></div>
                  <div>Event ID: <span style={{ color: '#cbd5e1' }}>{leadResult.eventId}</span></div>
                  <div>Account: <span style={{ color: '#cbd5e1' }}>{leadResult.accountId}</span></div>
                  <div>Time: <span style={{ color: '#94a3b8' }}>{leadResult.createdAt}</span></div>

                  {leadResult.endpointError && (
                    <div style={{ color: '#fda4af' }}>Endpoint: {leadResult.endpointError}</div>
                  )}

                  <div style={{ paddingTop: '0.35rem' }}>
                    <span style={{ color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                      Pixel payload sent to Whop:
                    </span>
                    <pre style={{ background: '#020617', padding: '0.5rem', borderRadius: '0.375rem', color: '#cbd5e1', overflowX: 'auto' }}>
                      {JSON.stringify({ name: leadResult.pixelEvent.name, ...leadResult.pixelEvent.data }, null, 2)}
                    </pre>
                  </div>
                </div>

                <a
                  href="https://whop.com/dashboard/events"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-block"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Radio style={{ width: 16, height: 16 }} />
                  Verify in Whop Dashboard → Events
                </a>

                <button
                  onClick={() => setLeadResult(null)}
                  className="btn btn-secondary btn-block"
                >
                  Submit another request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
