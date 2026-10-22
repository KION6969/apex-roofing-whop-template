import React from 'react';
import { roofingConfig } from '../roofing.config';
import { Shield, Phone, Mail, MapPin, Lock } from 'lucide-react';

interface FooterProps {
  onScrollTo: (sectionId: string) => void;
  onOpenInvoicesDemo: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollTo, onOpenInvoicesDemo }) => {
  return (
    <footer style={{ background: '#020617', borderTop: '1px solid #1e293b', color: '#94a3b8', fontSize: '0.8125rem' }}>
      <div className="container" style={{ padding: '4rem 1.5rem 2.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem' }}>
          {/* Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '0.625rem', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#020617' }}>
                <Shield style={{ width: 22, height: 22 }} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                {roofingConfig.company.name}
              </span>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.8125rem', lineHeight: 1.6, maxWidth: '420px' }}>
              Certified GAF Master Elite® contractor specializing in residential and commercial storm restoration. All payments and financing processed through Whop Payments with full encryption and fraud protection.
            </p>

            <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: '#090e1a', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', maxWidth: '380px' }}>
              <div>State License: <strong style={{ color: '#ffffff' }}>{roofingConfig.company.licenseNumber}</strong></div>
              <div>Commercial Insurance: <strong style={{ color: '#ffffff' }}>{roofingConfig.company.insuredAmount}</strong></div>
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff', letterSpacing: '0.05em' }}>Navigation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={() => onScrollTo('hero')} className="nav-link" style={{ textAlign: 'left', padding: 0 }}>Home Overview</button>
              <button onClick={() => onScrollTo('services')} className="nav-link" style={{ textAlign: 'left', padding: 0 }}>Roofing Services</button>
              <button onClick={() => onScrollTo('plans')} className="nav-link" style={{ textAlign: 'left', padding: 0 }}>Fixed Pricing & Deposits</button>
              <button onClick={() => onScrollTo('financing')} className="nav-link" style={{ textAlign: 'left', padding: 0 }}>0% APR Financing (Klarna)</button>
              <button onClick={() => onScrollTo('service-area')} className="nav-link" style={{ textAlign: 'left', padding: 0 }}>Service Area Radius</button>
              <button onClick={() => onScrollTo('reviews')} className="nav-link" style={{ textAlign: 'left', padding: 0 }}>Client Reviews</button>
            </div>
          </div>

          {/* Whop Integration Tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff', letterSpacing: '0.05em' }}>Whop Architecture</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
              <span style={{ color: '#10b981', fontWeight: 600 }}>• Whop Checkout element (Payment Element + BrandingElement)</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>• Express Checkout (Apple Pay / Google Pay)</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>• Whop Pixel — 5 custom events</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>• Lead events + optional API forward</span>
              <button
                onClick={onOpenInvoicesDemo}
                style={{ background: 'none', border: 'none', color: '#f59e0b', fontWeight: 800, textAlign: 'left', cursor: 'pointer', padding: 0, marginTop: '0.25rem' }}
              >
                → Final balance invoice
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff', letterSpacing: '0.05em' }}>Direct Dispatch</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone style={{ width: 14, height: 14, color: '#f59e0b' }} />
                <a href={`tel:${roofingConfig.company.phone}`} style={{ color: '#cbd5e1', textDecoration: 'none' }}>
                  {roofingConfig.company.phone}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone style={{ width: 14, height: 14, color: '#f43f5e' }} />
                <a href={`tel:${roofingConfig.company.emergencyHotline}`} style={{ color: '#fb7185', fontWeight: 800, textDecoration: 'none' }}>
                  {roofingConfig.company.emergencyHotline} (24/7)
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail style={{ width: 14, height: 14, color: '#f59e0b' }} />
                <span>{roofingConfig.company.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', paddingTop: '0.25rem' }}>
                <MapPin style={{ width: 14, height: 14, color: '#f59e0b', flexShrink: 0, marginTop: '0.15rem' }} />
                <span>{roofingConfig.company.officeAddress}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Mandatory Powered by Whop */}
        <div style={{ marginTop: '3.5rem', paddingTop: '1.75rem', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem' }}>
          <div style={{ color: '#64748b' }}>
            © {new Date().getFullYear()} {roofingConfig.company.name}. All Rights Reserved. Built as a production-ready template for Whop Websites.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8' }}>
              <Lock style={{ width: 12, height: 12, color: '#10b981' }} />
              Whop 256-Bit Encrypted Payments
            </span>
            <div className="whop-logo-pill">
              <span>Powered by</span>
              <span style={{ color: '#ff6423', fontWeight: 900 }}>whop</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
