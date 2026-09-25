import { SITE } from '../config/site.js';
const DIALS = [['+1', 'US/CA +1'], ['+44', 'UK +44'], ['+61', 'AU +61'], ['+91', 'IN +91']];
const digits = (v) => v.replace(/\D/g, '');

export function validateContact(c, consent) {
  const e = {};
  if (!c.firstName.trim()) e.firstName = 'Enter your first name.';
  if (!c.lastName.trim()) e.lastName = 'Enter your last name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email.trim())) e.email = 'Enter a valid email, like name@example.com.';
  const d = digits(c.phone);
  if (c.dial === '+1' ? d.length !== 10 : d.length < 6 || d.length > 12) e.phone = 'Enter a valid phone number.';
  if (!consent) e.consent = 'Please agree to the Terms and Privacy Policy to continue.';
  return e;
}
export const toE164 = (c) => c.dial + digits(c.phone);

function Field({ id, label, error, ...p }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...p} />
      {error && <p className="err" id={`${id}-err`}>{error}</p>}
    </div>
  );
}

export default function ContactStep({ contact, setContact, consent, setConsent, errors }) {
  const on = (k) => (e) => setContact({ ...contact, [k]: e.target.value });
  return (
    <>
      <div className="row">
        <Field id="firstName" label="First name" autoComplete="given-name" value={contact.firstName} onChange={on('firstName')} error={errors.firstName} />
        <Field id="lastName" label="Last name" autoComplete="family-name" value={contact.lastName} onChange={on('lastName')} error={errors.lastName} />
      </div>
      <Field id="email" label="Email" type="email" autoComplete="email" inputMode="email" value={contact.email} onChange={on('email')} error={errors.email} />
      <div className="field">
        <label htmlFor="phone">Phone</label>
        <div className="phone">
          <select aria-label="Country code" value={contact.dial} onChange={on('dial')}>{DIALS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <input id="phone" name="phone" type="tel" autoComplete="tel-national" inputMode="tel" value={contact.phone} onChange={on('phone')}
            aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-err' : undefined} />
        </div>
        {errors.phone && <p className="err" id="phone-err">{errors.phone}</p>}
      </div>
      {/* Honeypot: hidden from people, tempting to bots. */}
      <div className="hp" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={contact.website} onChange={on('website')} /></label></div>
      <label className="check consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'consent-err' : undefined} />
        <span>By submitting this form, you agree to our <a href={SITE.termsUrl} target="_blank" rel="noreferrer">Terms</a> and <a href={SITE.privacyUrl} target="_blank" rel="noreferrer">Privacy Policy</a>, and to be contacted about your request. Consent is not a condition of purchasing any service.</span>
      </label>
      {errors.consent && <p className="err" id="consent-err">{errors.consent}</p>}
    </>
  );
}
