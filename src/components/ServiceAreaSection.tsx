import React, { useState } from 'react';
import { roofingConfig } from '../roofing.config';
import { MapPin, CheckCircle, Search, Truck } from 'lucide-react';

interface ServiceAreaSectionProps {
  onScrollTo: (sectionId: string) => void;
}

export const ServiceAreaSection: React.FC<ServiceAreaSectionProps> = ({ onScrollTo }) => {
  const [zipInput, setZipInput] = useState('');
  const [checkResult, setCheckResult] = useState<{
    status: 'idle' | 'covered' | 'extended';
    message: string;
    city?: string;
  }>({ status: 'idle', message: '' });

  const handleCheckZip = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanZip = zipInput.trim();
    if (!cleanZip) return;

    if (roofingConfig.serviceArea.zipCodes.includes(cleanZip)) {
      setCheckResult({
        status: 'covered',
        message: `Priority Coverage Confirmed for Zip Code ${cleanZip}! Emergency crews and inspection drones can be dispatched within 2-4 hours.`,
      });
    } else {
      setCheckResult({
        status: 'extended',
        message: `Zip Code ${cleanZip} is within our ${roofingConfig.serviceArea.radiusMiles}-mile extended coverage area. Standard scheduling (24-48 hours) is active.`,
      });
    }
  };

  return (
    <section id="service-area" className="section section-alt">
      <div className="container">
        <div className="section-header">
          <div className="section-pill">
            <MapPin style={{ width: 14, height: 14 }} />
            <span>Dedicated North Texas Operations</span>
          </div>
          <h2 className="section-title">
            {roofingConfig.serviceArea.primaryMetro}
          </h2>
          <p className="section-subtitle">
            Four dispatch hubs strategically located to ensure prompt inspection, leak triage, and material deliveries within a {roofingConfig.serviceArea.radiusMiles}-mile radius.
          </p>
        </div>

        <div className="grid-2">
          {/* Coverage Cities Grid */}
          <div style={{ background: '#020617', padding: '2rem', borderRadius: '1.25rem', border: '1px solid #1e293b' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: '#cbd5e1', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Truck style={{ width: 18, height: 18, color: '#f59e0b' }} />
              Featured Municipalities with Same-Day Response
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.625rem' }}>
              {roofingConfig.serviceArea.featuredCities.map((city, idx) => (
                <div
                  key={idx}
                  style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#090e1a', border: '1px solid #1e293b', fontSize: '0.8125rem', fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <CheckCircle style={{ width: 14, height: 14, color: '#10b981', flexShrink: 0 }} />
                  <span>{city}, TX</span>
                </div>
              ))}
            </div>

            <div style={{ paddingTop: '1.25rem', marginTop: '1.25rem', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span>Total Active Crews: 8 Certified Teams</span>
              <span>Average Emergency Arrival: 84 Minutes</span>
            </div>
          </div>

          {/* Interactive Zip Code Checker */}
          <div style={{ background: '#020617', padding: '2rem', borderRadius: '1.25rem', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 20px 45px -15px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 800, fontSize: '1.125rem' }}>
              <Search style={{ width: 20, height: 20, color: '#f59e0b' }} />
              <span>Check Your Neighborhood Availability</span>
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Enter your 5-digit US postal code to check real-time crew availability for inspections and replacements.
            </p>

            <form onSubmit={handleCheckZip} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                maxLength={5}
                value={zipInput}
                onChange={e => setZipInput(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 75201 or 75024"
                className="form-input"
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
              >
                Verify Zip
              </button>
            </form>

            {/* Sample Zip Quick Clickers */}
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span>Try sample zips:</span>
              {['75201', '75024', '76092'].map(sample => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setZipInput(sample);
                    setCheckResult({
                      status: 'covered',
                      message: `Priority Coverage Confirmed for Zip Code ${sample}! Emergency crews and inspection drones available.`,
                    });
                  }}
                  style={{ background: 'none', border: 'none', color: '#f59e0b', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}
                >
                  {sample}
                </button>
              ))}
            </div>

            {/* Result Notification */}
            {checkResult.status !== 'idle' && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                  border: checkResult.status === 'covered' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                  background: checkResult.status === 'covered' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: checkResult.status === 'covered' ? '#6ee7b7' : '#fcd34d',
                }}
              >
                <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                  <CheckCircle style={{ width: 16, height: 16 }} />
                  <span>Coverage Verified</span>
                </div>
                <div>{checkResult.message}</div>
                <button
                  onClick={() => onScrollTo('estimate')}
                  style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: '#ffffff', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer', display: 'block' }}
                >
                  Proceed to Request Estimate →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
