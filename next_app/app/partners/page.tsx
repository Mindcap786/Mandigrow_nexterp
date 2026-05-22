'use client';

import React, { useState, useEffect, useRef } from 'react';
import './partners.css';

import { callApiGet } from '@/lib/frappeClient';
import { LandingFooter } from '@/components/layout/LandingFooter';

export default function PartnersPage() {
  const [theme, setTheme] = useState('light');
  
  // Dynamic Settings
  const [partnerSettings, setPartnerSettings] = useState<any>({
    commission_percentage: 30,
    hero_title: "Build a business selling India's <em>Mandi Revolution</em>",
    hero_subtitle: "Join MandiGrow's Partner Network. Earn 30% recurring commission on every mandi you onboard — for the lifetime of the subscription."
  });

  // Calculator State
  const [mandisCount, setMandisCount] = useState(10);
  const [planType, setPlanType] = useState(1); // Default to middle plan
  const [plans, setPlans] = useState([
    { name: 'Starter', price: 1999 },
    { name: 'Professional', price: 3999 },
    { name: 'Enterprise', price: 7999 }
  ]);

  useEffect(() => {
    // Fetch dynamic settings from Frappe admin
    callApiGet('mandigrow.api.get_partner_settings')
      .then((data: any) => {
        if (data && Object.keys(data).length > 0) {
          setPartnerSettings({
            commission_percentage: data.commission_percentage || 30,
            hero_title: data.hero_title || "Build a business selling India's <em>Mandi Revolution</em>",
            hero_subtitle: data.hero_subtitle || "Join MandiGrow's Partner Network. Earn 30% recurring commission on every mandi you onboard — for the lifetime of the subscription."
          });
        }
      })
      .catch(console.error);

    // Fetch live plans for the calculator
    callApiGet('mandigrow.api.get_plans')
      .then((data: any) => {
        if (data && data.length > 0) {
          // Sort plans by price
          const sortedPlans = data.sort((a: any, b: any) => (a.price_monthly || 0) - (b.price_monthly || 0));
          const formattedPlans = sortedPlans.map((p: any) => ({
            name: p.display_name || p.plan_name || p.name,
            price: p.price_monthly || 0
          }));
          setPlans(formattedPlans);
          
          // Set planType to the middle plan if available
          if (formattedPlans.length >= 3) {
             setPlanType(Math.floor(formattedPlans.length / 2));
          } else if (formattedPlans.length > 0) {
             setPlanType(0);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Update HTML data-theme attribute directly for the partners.css to work
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partnerType, setPartnerType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  const faqs = [
    { q: "Do I need technical knowledge to become a partner?", a: "No technical knowledge required at all. MandiGrow handles all the setup and support for your clients. Your job is to introduce MandiGrow to mandi owners, show them the demo, and collect the sign-up. We handle everything after that." },
    { q: "What is the commission structure?", a: "You earn 30% of every monthly subscription fee your referred mandis pay — for as long as they are customers. If a mandi pays ₹4,000/month, you earn ₹1,200 every month. Agency partners also earn a one-time onboarding bonus per new client." },
    { q: "How much can I realistically earn per month?", a: "Freelancer partners with 10–15 active mandis typically earn ₹15,000–40,000/month. Agency partners with a team of 3–5 sales reps managing 30–60 mandis earn ₹50,000–2,00,000+/month. Use the calculator above for your specific scenario." },
    { q: "Is there an exclusive territory for agency partners?", a: "Yes. Agency partners can apply for district-level territory exclusivity. Once approved, no other MandiGrow partner will be allowed to sell in your territory. State-level exclusivity is available for State Distributor tier partners." },
    { q: "When and how do I receive my commission?", a: "Commissions are calculated on the 1st of every month and transferred within 5 working days via NEFT/UPI to your bank account. You can track all earnings in real time on your partner dashboard." },
    { q: "Can I offer MandiGrow under my own brand name?", a: "Yes — white-labeling is available for Agency and State Distributor partners. You can present MandiGrow as your own product with your logo and brand colors. This is ideal for software firms and CA firms who want to build their own SaaS brand." }
  ];

  // Scroll Reveal Observer
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = (i % 4) * 0.07 + 's';
      obs.observe(el);
    });
    
    return () => obs.disconnect();
  }, []);

  const openModal = (type: string) => {
    setIsModalOpen(true);
    setPartnerType(type);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const MODAL_TITLES: Record<string, string> = {
    freelancer: 'Apply as Freelancer Partner',
    agency:     'Apply as Agency / Firm Partner',
    state:      'Talk to Our Sales Team',
    '':         'Apply to Partner with MandiGrow',
  };

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/partner-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Submission failed');
      
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        closeModal();
        setIsSuccess(false);
      }, 2200);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="partners-page-wrapper">
        
<nav className="nav" role="navigation" aria-label="Main navigation">
  <div className="nav-inner">
    <a href="/" className="logo" aria-label="MandiGrow home">
      <svg className="logo-mark" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect width="36" height="36" rx="8" fill="#1a6b3a"/>
        <path d="M18 6 C18 6 10 10 10 18 C10 24 13.5 28 18 29 C22.5 28 26 24 26 18 C26 10 18 6 18 6Z" fill="white" opacity="0.9"/>
        <path d="M18 12 L18 29" stroke="#1a6b3a" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 16 C14 16 15.5 14 18 14 C20.5 14 22 16 22 16" stroke="#1a6b3a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M12 22 C12 22 14 19.5 18 19.5 C22 19.5 24 22 24 22" stroke="#1a6b3a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </svg>
      <span className="logo-text">Mandi<span>Grow</span></span>
    </a>
    <div className="nav-cta">
      
      <button aria-label="Toggle dark mode" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="theme-toggle" style={{width:"36px",height:"36px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"var(--radius-full)",color:"var(--color-text-muted)",border:"1px solid var(--color-border)"}}>
        {theme === 'dark' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        )}
      </button>


      <a href="#partner-tiers" className="btn btn-ghost">View Plans</a>
      <button className="btn btn-primary" onClick={() => openModal('')}>Apply Now</button>
    </div>
  </div>
</nav>


<section className="hero">
  <div className="container-narrow">
    <div className="hero-badge">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      Partner Program — Now Open All India
    </div>
    <h1 dangerouslySetInnerHTML={{ __html: partnerSettings.hero_title }}></h1>
    <p className="hero-sub">{partnerSettings.hero_subtitle}</p>
    <div className="hero-actions">
      <button className="btn btn-primary" onClick={() => openModal('')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        Become a Partner
      </button>
      <a href="#how-it-works" className="btn btn-ghost">See How It Works</a>
    </div>
    <div className="hero-stats">
      <div className="hero-stat">
        <span className="hero-stat-num">{partnerSettings.commission_percentage}%</span>
        <span className="hero-stat-label">Recurring Commission</span>
      </div>
      <div className="hero-stat">
        <span className="hero-stat-num">7,000+</span>
        <span className="hero-stat-label">APMCs Across India</span>
      </div>
      <div className="hero-stat">
        <span className="hero-stat-num">₹0</span>
        <span className="hero-stat-label">Cost to Join</span>
      </div>
    </div>
  </div>
</section>


<div className="commission-block">
  <div className="container-narrow" style={{ textAlign: 'center' }}>
    <div className="section-label">Your Earning Potential</div>
    <div className="commission-number"><sup>%</sup>{partnerSettings.commission_percentage}</div>
    <p className="commission-sub">Recurring commission on every subscription — monthly, forever. Onboard 10 mandis and you've built a passive income stream.</p>
    <div className="commission-pills">
      <span className="commission-pill">Monthly Payouts</span>
      <span className="commission-pill">Lifetime Recurring</span>
      <span className="commission-pill">No Cap on Earnings</span>
      <span className="commission-pill">Direct Bank Transfer</span>
    </div>
  </div>
</div>


<section className="section" id="how-it-works">
  <div className="container">
    <div className="reveal">
      <div className="section-label">How It Works</div>
      <h2 className="section-heading">Three steps to your <em>first commission</em></h2>
      <p className="section-sub">No technical knowledge needed. MandiGrow gives you everything — you focus on relationships and closures.</p>
    </div>
    <div className="steps-grid">
      <div className="step-card reveal">
        <span className="step-num">01</span>
        <svg className="step-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <h3>Apply &amp; Get Certified</h3>
        <p>Fill the partner form. We'll train you on MandiGrow in 2 hours via WhatsApp/call. You'll get a partner ID, demo account, and your own referral link.</p>
      </div>
      <div className="step-card reveal">
        <span className="step-num">02</span>
        <svg className="step-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.65 5 2 2 0 0 1 3.62 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        <h3>Pitch Mandis in Your Area</h3>
        <p>Visit APMCs, grain mandis, and traders in your city or district. We provide pitch decks, brochures in Telugu/Hindi, and demo videos. You show, they sign.</p>
      </div>
      <div className="step-card reveal">
        <span className="step-num">03</span>
        <svg className="step-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
        <h3>Earn Every Month</h3>
        <p>As long as the mandi keeps their MandiGrow subscription, you earn {partnerSettings.commission_percentage}% of the monthly fee — directly credited to your bank. No limits, no expiry.</p>
      </div>
      <div className="step-card reveal">
        <span className="step-num">04</span>
        <svg className="step-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        <h3>Scale Your Network</h3>
        <p>Build a team. Refer sub-partners and earn a bonus on their closures too. Top partners in our network earn ₹50,000+/month without ever writing a single line of code.</p>
      </div>
    </div>
  </div>
</section>


<section className="section tiers-section" id="partner-tiers">
  <div className="container">
    <div className="reveal">
      <div className="section-label">Partner Tiers</div>
      <h2 className="section-heading">Choose your path — <em>freelancer or agency</em></h2>
      <p className="section-sub">Start as a solo freelancer and grow into a full MandiGrow Agency. Both paths earn 30% recurring commission.</p>
    </div>
    <div className="tiers-grid">
      
      <div className="tier-card reveal">
        <div className="tier-badge">Freelancer Partner</div>
        <div className="tier-name">Solo Earner</div>
        <p className="tier-desc">Perfect for individuals — sales reps, ex-bankers, agricultural extension workers, CA students, and anyone with a network in mandis.</p>
        <div className="tier-earning">
          <div className="tier-earning-label">Monthly Earning Potential</div>
          <div className="tier-earning-amount">₹15,000 – ₹40,000</div>
        </div>
        <ul className="tier-features" role="list">
          <li>
            <svg className="tier-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            {partnerSettings.commission_percentage}% recurring commission on every plan
          </li>
          <li>
            <svg className="tier-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Personal referral link + dashboard
          </li>
          <li>
            <svg className="tier-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            WhatsApp + Zoom sales support
          </li>
          <li>
            <svg className="tier-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Brochures in Telugu, Hindi, English
          </li>
          <li>
            <svg className="tier-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Monthly payout via NEFT/UPI
          </li>
        </ul>
        <div className="tier-cta">
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => openModal('freelancer')}>Apply as Freelancer</button>
        </div>
      </div>

      
      <div className="tier-card featured reveal">
        <div className="tier-badge">Agency Partner ★ Recommended</div>
        <div className="tier-name">Agency / Firm</div>
        <p className="tier-desc">For software firms, CA firms, agricultural consultants, and entrepreneurs who want to build a MandiGrow reseller business across a district or state.</p>
        <div className="tier-earning">
          <div className="tier-earning-label">Monthly Earning Potential</div>
          <div className="tier-earning-amount">₹50,000 – ₹2,00,000+</div>
        </div>
        <ul className="tier-features" role="list">
          <li>
            <svg className="tier-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            {partnerSettings.commission_percentage}% recurring + onboarding bonus per client
          </li>
          <li>
            <svg className="tier-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Exclusive territory rights (district/state)
          </li>
          <li>
            <svg className="tier-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            White-label option with your branding
          </li>
          <li>
            <svg className="tier-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Dedicated account manager from MandiGrow
          </li>
          <li>
            <svg className="tier-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Priority technical support (2hr SLA)
          </li>
          <li>
            <svg className="tier-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Co-marketing support &amp; joint demos
          </li>
          <li>
            <svg className="tier-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Listed on MandiGrow.com as certified agency
          </li>
        </ul>
        <div className="tier-cta">
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => openModal('agency')}>Apply as Agency</button>
        </div>
      </div>

      
      <div className="tier-card reveal">
        <div className="tier-badge">State Distributor</div>
        <div className="tier-name">State Partner</div>
        <p className="tier-desc">Exclusive state-level distribution rights. Build and manage your own network of sub-partners. Designed for established agri-tech businesses.</p>
        <div className="tier-earning">
          <div className="tier-earning-label">Monthly Earning Potential</div>
          <div className="tier-earning-amount">₹2,00,000 – ₹10,00,000</div>
        </div>
        <ul className="tier-features" role="list">
          <li>
            <svg className="tier-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Full state exclusivity &amp; territory lock
          </li>
          <li>
            <svg className="tier-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Recruit and manage sub-partners
          </li>
          <li>
            <svg className="tier-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Revenue share on entire state network
          </li>
          <li>
            <svg className="tier-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Custom pricing authority for state
          </li>
          <li>
            <svg className="tier-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Board-level relationship with MandiGrow
          </li>
        </ul>
        <div className="tier-cta">
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => openModal('state')}>Talk to Our Sales Team</button>
        </div>
      </div>
    </div>
  </div>
</section>


<section className="section calc-section">
  <div className="container-narrow">
    <div className="reveal" style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
      <div className="section-label">Earnings Calculator</div>
      <h2 className="section-heading">See what you'll <em>actually earn</em></h2>
    </div>
    
    <div className="calc-card reveal">
      <h3 className="calc-title">Monthly Commission Calculator</h3>
      <div className="calc-row">
        <div className="calc-field">
          <label htmlFor="mandis-count">Mandis Onboarded</label>
          <input type="range" id="mandis-count" min="1" max="50" value={mandisCount} onChange={(e) => setMandisCount(parseInt(e.target.value))} />
          <span className="range-val" id="mandis-val">{mandisCount} Mandis</span>
        </div>
        <div className="calc-field">
          <label htmlFor="plan-type">Average Plan</label>
          <input type="range" id="plan-type" min="0" max="2" value={planType} onChange={(e) => setPlanType(parseInt(e.target.value))} />
          <span className="range-val" id="plan-val">{plans[planType].name} — ₹{plans[planType].price.toLocaleString('en-IN')}/mo</span>
        </div>
      </div>
      <div className="calc-divider"></div>
      <div className="calc-result">
        <div className="calc-result-item">
          <div className="calc-result-label">Client Revenue</div>
          <div className="calc-result-val" id="calc-total">₹{(mandisCount * plans[planType].price).toLocaleString('en-IN')}</div>
        </div>
        <div className="calc-result-item highlight">
          <div className="calc-result-label">Your Monthly Earn</div>
          <div className="calc-result-val" id="calc-commission">₹{Math.round(mandisCount * plans[planType].price * (partnerSettings.commission_percentage / 100)).toLocaleString('en-IN')}</div>
        </div>
        <div className="calc-result-item">
          <div className="calc-result-label">Your Annual Earn</div>
          <div className="calc-result-val" id="calc-annual">₹{Math.round(mandisCount * plans[planType].price * (partnerSettings.commission_percentage / 100) * 12).toLocaleString('en-IN')}</div>
        </div>
      </div>
    </div>

  </div>
</section>


<section className="section">
  <div className="container">
    <div className="reveal">
      <div className="section-label">Partner Benefits</div>
      <h2 className="section-heading">Everything you need to <em>close deals</em></h2>
      <p className="section-sub">MandiGrow handles product, support, and billing. You handle relationships. We've set this up so a non-technical person can start selling Day 1.</p>
    </div>
    <div className="benefits-grid">
      <div className="benefit-card reveal">
        <svg className="benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
        <h3>Sales Pitch Kits</h3>
        <p>Ready-to-use pitch decks, WhatsApp scripts, and brochures in Telugu, Hindi, and English. No preparation needed — just show up and present.</p>
      </div>
      <div className="benefit-card reveal">
        <svg className="benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <h3>Exclusive Territory</h3>
        <p>Agency partners get district/state territory protection — no other MandiGrow partner can poach your clients. Your mandis stay yours.</p>
      </div>
      <div className="benefit-card reveal">
        <svg className="benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <h3>Free Demo Access</h3>
        <p>Full MandiGrow demo account to showcase live to mandi owners. Walk them through commission slips, ledger, and daybook in real time.</p>
      </div>
      <div className="benefit-card reveal">
        <svg className="benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <h3>Real-Time Dashboard</h3>
        <p>Track your referred mandis, subscription status, earned commissions, and pending payouts — all in one partner portal.</p>
      </div>
      <div className="benefit-card reveal">
        <svg className="benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <h3>Training &amp; Onboarding</h3>
        <p>2-hour onboarding call with Shauddin personally. Ongoing WhatsApp group for partner Q&amp;A, product updates, and closing support.</p>
      </div>
      <div className="benefit-card reveal">
        <svg className="benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        <h3>Monthly Payouts</h3>
        <p>Commissions calculated on the 1st of every month and transferred within 5 business days via NEFT/UPI. No delays, no minimum threshold.</p>
      </div>
    </div>
  </div>
</section>


<section className="section testimonials-section">
  <div className="container">
    <div className="reveal" style={{ textAlign: 'center' }}>
      <div className="section-label">Partner Stories</div>
      <h2 className="section-heading">What our partners <em>are saying</em></h2>
    </div>
    <div className="testimonials-grid">
      <div className="testimonial-card reveal">
        <p className="testimonial-quote">"I onboarded 8 mandis in Guntur district in 3 months. MandiGrow gave me all the pitch material in Telugu. The mandi owners signed the same day I demo'd the commission slip feature."</p>
        <div className="testimonial-meta">
          <div className="testimonial-avatar" aria-hidden="true">R</div>
          <div>
            <div className="testimonial-name">Ravi Kumar</div>
            <div className="testimonial-role">Freelancer Partner · Guntur, AP</div>
          </div>
          <span className="testimonial-earnings">₹24,000/mo</span>
        </div>
      </div>
      <div className="testimonial-card reveal">
        <p className="testimonial-quote">"As a CA firm, we already handled accounts for 15 mandis. Offering them MandiGrow was natural. We earn recurring commission from existing clients — no extra effort needed."</p>
        <div className="testimonial-meta">
          <div className="testimonial-avatar" aria-hidden="true">S</div>
          <div>
            <div className="testimonial-name">Sunita Agarwal &amp; Co.</div>
            <div className="testimonial-role">Agency Partner · Nagpur, MH</div>
          </div>
          <span className="testimonial-earnings">₹71,000/mo</span>
        </div>
      </div>
      <div className="testimonial-card reveal">
        <p className="testimonial-quote">"I was working in an IT company earning ₹35k. Now I run my own MandiGrow agency with 4 staff. Last month we earned ₹1.1L from commissions alone. Best decision of my life."</p>
        <div className="testimonial-meta">
          <div className="testimonial-avatar" aria-hidden="true">M</div>
          <div>
            <div className="testimonial-name">Mohammed Rafi</div>
            <div className="testimonial-role">Agency Partner · Hyderabad, TS</div>
          </div>
          <span className="testimonial-earnings">₹1,10,000/mo</span>
        </div>
      </div>
    </div>
  </div>
</section>


<section className="section">
  <div className="container-narrow">
    <div className="reveal" style={{ textAlign: 'center' }}>
      <div className="section-label">Questions</div>
      <h2 className="section-heading">Frequently asked by <em>future partners</em></h2>
    </div>
    
    <div className="faq-list reveal">
      {faqs.map((faq, idx) => (
        <div key={idx} className={`faq-item ${openFaq === idx ? 'open' : ''}`}>
          <button className="faq-question" aria-expanded={openFaq === idx} onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
            {faq.q}
            <svg className="faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div className="faq-answer">{faq.a}</div>
        </div>
      ))}
    </div>

  </div>
</section>


<section className="final-cta">
  <div className="container-narrow">
    <div className="section-label">Join the Network</div>
    <h2>India has 7,000+ APMCs.<br /><em>Most don't use any software yet.</em></h2>
    <p>You are early. The market is wide open. The mandis that adopt MandiGrow today will stay for 10 years. Your commission is recurring — forever.</p>
    <button className="btn btn-primary" onClick={() => openModal('')}>
      Apply to Become a Partner
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </button>
    <p className="final-cta-note">Free to join · No investment required · Training provided · Payout every month</p>
  </div>
</section>


<LandingFooter />



<div className={`modal-overlay ${isModalOpen ? 'open' : ''}`} id="apply-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
  <div className="modal">
    <div className="modal-header">
      <h2 className="modal-title" id="modal-title">{MODAL_TITLES[partnerType] ?? 'Apply to Partner with MandiGrow'}</h2>
      <button className="modal-close" onClick={closeModal} aria-label="Close modal">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <form id="partner-form" onSubmit={submitForm}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="f-name">Full Name</label>
          <input type="text" id="f-name" name="name" placeholder="Ravi Kumar" required />
        </div>
        <div className="form-group">
          <label htmlFor="f-phone">WhatsApp Number</label>
          <input type="tel" id="f-phone" name="phone" placeholder="+91 9876543210" required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="f-email">Email Address</label>
          <input type="email" id="f-email" name="email" placeholder="yourname@gmail.com" required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="f-city">City / District</label>
          <input type="text" id="f-city" name="city" placeholder="Guntur, Andhra Pradesh" required />
        </div>
        <div className="form-group">
          <label htmlFor="f-type">Partner Type</label>
          <select id="f-type" name="partner_type" value={partnerType} onChange={(e) => setPartnerType(e.target.value)} required>
            <option value="">Select type...</option>
            <option value="freelancer">Freelancer</option>
            <option value="agency">Agency / Firm</option>
            <option value="state">State Distributor</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="f-background">Your Background</label>
        <textarea id="f-background" name="background" placeholder="E.g. I'm a software freelancer in Vijayawada, I already know 20+ mandi owners in Krishna district..." rows={3}></textarea>
      </div>
      <button type="submit" className="form-submit" disabled={isSubmitting} style={{ background: isSuccess ? 'var(--color-gold)' : undefined }}>
        {isSubmitting ? 'Sending...' : isSuccess
          ? '✓ Application Received — Our Sales Team Will Contact You!'
          : partnerType === 'state' ? 'Send Request to Sales Team →' : 'Submit Application →'}
      </button>
      <p className="form-note">
        {partnerType === 'state'
          ? 'Our sales team will reach you on WhatsApp within 24 hours to discuss State Distributor partnership.'
          : "We'll call you on WhatsApp within 24 hours to discuss partnership details."}
      </p>
    </form>
  </div>
</div>

      </div>
    </>
  );
}
