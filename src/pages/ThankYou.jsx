import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { trackStandard } from '../utils/tracking.js';
import { SITE } from '../config/site.js';

export default function ThankYou() {
  const { state } = useLocation();
  const eventId = state?.eventId;
  useEffect(() => {
    // Fire Lead once per confirmed submission. Guard survives refresh; skipped for bots (eventId null).
    if (!eventId) return;
    const k = `lead_fired_${eventId}`;
    try { if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); } catch {}
    trackStandard('Lead', eventId);
  }, [eventId]);
  if (!state) return <Navigate to="/" replace />; // direct visits don't count as conversions
  return (
    <>
      <Header />
      <main className="thanks">
        <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="26" fill="none" stroke="var(--gold)" strokeWidth="3" /><path d="M17 29l8 8 14-16" fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <h1>You're Pre-Qualified for Up to {SITE.maxBenefit}/Month!*</h1>
        <p className="lead">We will provide an email with your results now!</p>
        <p className="footnote">*Not available to California residents<br />*Maximum possible benefit per SSA. Individual amounts vary.</p>
      </main>
      <Footer />
    </>
  );
}
