import { FUNNEL_NAME } from '../config/quizQuestions.js';
import { SITE } from '../config/site.js';
import { getTracking } from '../utils/tracking.js';

const URL = import.meta.env.VITE_LEAD_WEBHOOK_URL;
const KEY = import.meta.env.VITE_MAKE_API_KEY;


const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export class SubmitError extends Error {
  constructor(msg, { retryable = true } = {}) { super(msg); this.retryable = retryable; }
}

export const CONSENT_TEXT = 'By submitting this form, you agree to our Terms and Privacy Policy, and to be contacted about your request. Consent is not a condition of purchasing any service.';

// leadId is generated once per form session and sent as an Idempotency-Key, so automatic
// and manual retries can never create duplicate leads downstream.
export function buildPayload({ contact, answers, leadId }) {
  const now = new Date().toISOString();
  return {
    lead: { firstName: contact.firstName.trim(), lastName: contact.lastName.trim(), email: contact.email.trim().toLowerCase(), phone: contact.e164 },
    surveyAnswers: answers,
    tracking: getTracking(),
    consent: { privacyAccepted: true, termsAccepted: true, termsUrl: SITE.termsUrl, privacyUrl: SITE.privacyUrl, consentText: CONSENT_TEXT, consentAt: now },
    metadata: { leadId, eventId: `lead-${leadId}`, funnelName: FUNNEL_NAME, submittedAt: now, sourceUrl: location.href },
  };
}

export async function submitLead(payload, { retries = 2, timeoutMs = 10000 } = {}) {
  if (!URL) {
    if (import.meta.env.DEV) { console.warn('[leadService] No webhook configured: MOCK success. Payload:', payload); await sleep(700); return { ok: true, mock: true }; }
    throw new SubmitError('Submissions are not configured yet. Please try again later.', { retryable: false });
  }
  let last;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(URL, {
        method: 'POST', signal: ctrl.signal,
        headers: { 'X-Make-ApiKey': KEY, 'Content-Type': 'application/json', 'Idempotency-Key': payload.metadata.leadId,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) return { ok: true }; // only a 2xx counts as "stored"
      if (res.status >= 400 && res.status < 500 && res.status !== 429) // will not succeed on retry
        throw new SubmitError(res.status === 422 ? 'Some details look invalid. Please check them and try again.' : 'We could not submit your request. Please try again.', { retryable: false });
      last = new Error(`HTTP ${res.status}`);
    } catch (e) {
      if (e instanceof SubmitError) throw e;
      last = e;
    } finally { clearTimeout(timer); }
    if (attempt < retries) await sleep(600 * 2 ** attempt);
  }
  throw new SubmitError(last?.name === 'AbortError'
    ? 'The request timed out. Your answers are saved. Check your connection and try again.'
    : 'We could not reach our server. Your answers are saved. Please try again.');
}
