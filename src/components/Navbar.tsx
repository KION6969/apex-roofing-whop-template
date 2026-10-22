import React, { useState } from 'react';
import { roofingConfig, RoofingPlan } from '../roofing.config';
import { Phone, Shield, Calendar, Clock, Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onOpenCheckout: (plan: RoofingPlan) => void;
  onOpenInvoicesDemo: () => void;
  onScrollTo: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCheckout,
  onOpenInvoicesDemo,
  onScrollTo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const inspectionPlan = roofingConfig.plans.find(p => p.type === 'inspection') || roofingConfig.plans[0];

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onScrollTo(sectionId);
  };

  return (
    <header className="main-navbar">
      {/* Top Emergency / Contractor Bar */}
      <div className="top-emergency-bar">
        <div className="top-bar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock style={{ width: 14, height: 14 }} />
              24/7 Storm Response Dispatch: <a href={`tel:${roofingConfig.company.emergencyHotline}`} style={{ color: '#020617', textDecoration: 'underline', fontWeight: 900 }}>{roofingConfig.company.emergencyHotline}</a>
            </span>
            <span style={{ opacity: 0.6 }}>|</span>
            <span>License #{roofingConfig.company.licenseNumber} • Fully Insured</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={onOpenInvoicesDemo}
              style={{ background: '#020617', color: '#fcd34d', padding: '0.2rem 0.6rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <span>Demo: Deposit → Final Invoice Flow</span>
              <ArrowUpRight style={{ width: 12, height: 12 }} />
            </button>
            <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
              Whop 0% APR Financing Available
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="navbar-inner">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => handleNavClick('hero')}>
          <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#020617', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
            <Shield style={{ width: 24, height: 24, color: '#020617' }} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff', display: 'block', lineHeight: 1.1 }}>
              {roofingConfig.company.name.split(' ')[0]}{' '}
              <span style={{ color: '#f59e0b' }}>{roofingConfig.company.name.split(' ')[1]}</span>
            </span>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: 700, display: 'block' }}>
              Roofing & Architectural Systems
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="nav-links">
          <button onClick={() => handleNavClick('services')} className="nav-link">
            Services
          </button>
          <button onClick={() => handleNavClick('plans')} className="nav-link">
            Fixed Plans & Pricing
          </button>
          <button onClick={() => handleNavClick('financing')} className="nav-link">
            0% APR Financing
          </button>
          <button onClick={() => handleNavClick('service-area')} className="nav-link">
            Service Area
          </button>
          <button onClick={() => handleNavClick('reviews')} className="nav-link">
            Reviews
          </button>
        </nav>

        {/* Action CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a
            href={`tel:${roofingConfig.company.phone}`}
            className="btn btn-secondary btn-sm"
          >
            <Phone style={{ width: 14, height: 14, color: '#f59e0b' }} />
            <span>{roofingConfig.company.phone}</span>
          </a>

          <button
            onClick={() => onOpenCheckout(inspectionPlan)}
            className="btn btn-primary btn-sm"
          >
            <Calendar style={{ width: 16, height: 16 }} />
            <span>Book Drone Inspection ($149)</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '0.5rem' }}
            aria-label="Toggle mobile menu"
            className="mobile-hamburger-btn"
          >
            {mobileMenuOpen ? <X style={{ width: 24, height: 24 }} /> : <Menu style={{ width: 24, height: 24 }} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ background: '#090e1a', borderBottom: '1px solid #1e293b', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button onClick={() => handleNavClick('services')} className="nav-link" style={{ textAlign: 'left', padding: '0.5rem 0' }}>Services</button>
          <button onClick={() => handleNavClick('plans')} className="nav-link" style={{ textAlign: 'left', padding: '0.5rem 0' }}>Fixed Plans & Deposits</button>
          <button onClick={() => handleNavClick('financing')} className="nav-link" style={{ textAlign: 'left', padding: '0.5rem 0' }}>0% APR Financing</button>
          <button onClick={() => handleNavClick('service-area')} className="nav-link" style={{ textAlign: 'left', padding: '0.5rem 0' }}>Service Area & Zip Codes</button>
          <button onClick={() => handleNavClick('reviews')} className="nav-link" style={{ textAlign: 'left', padding: '0.5rem 0' }}>Verified Reviews</button>
          <button onClick={() => handleNavClick('estimate')} className="nav-link" style={{ textAlign: 'left', padding: '0.5rem 0', color: '#f59e0b', fontWeight: 800 }}>Request Free Estimate</button>
          
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCheckout(inspectionPlan);
            }}
            className="btn btn-primary btn-block"
            style={{ marginTop: '0.5rem' }}
          >
            Book Drone Inspection ($149 via Whop)
          </button>
        </div>
      )}
    </header>
  );
};
