import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizQuestions as Q } from '../config/quizQuestions.js';
import ContactStep, { validateContact, toE164 } from './ContactStep.jsx';
import { buildPayload, submitLead, SubmitError } from '../services/leadService.js';
import { newId, trackCustom } from '../utils/tracking.js';

const SKEY = 'funnel_progress_v1'; // survey answers + step only. Contact details are never persisted.
const load = () => { try { return JSON.parse(sessionStorage.getItem(SKEY)) || {}; } catch { return {}; } };
const CONTACT0 = { firstName: '', lastName: '', email: '', dial: '+1', phone: '', website: '' };

export default function QuizForm() {
  const nav = useNavigate();
  const saved = useRef(load()).current;
  const [step, setStep] = useState(Math.min(saved.step || 0, Q.length));
  const [answers, setAnswers] = useState(saved.answers || {});
  const [contact, setContact] = useState(CONTACT0);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [submitError, setSubmitError] = useState('');
  const leadId = useRef(newId()).current;   // stable across retries -> idempotent
  const lock = useRef(false);                // sync guard: state updates are async, double-clicks are not
  const started = useRef(false);
  const headRef = useRef(null);
  const last = step === Q.length;
  const q = Q[step];
  const label = last ? 'Final step' : `Question ${step + 1} of ${Q.length}`;

  useEffect(() => { try { sessionStorage.setItem(SKEY, JSON.stringify({ step, answers })); } catch {} }, [step, answers]);
  useEffect(() => { if (step > 0 || saved.step) headRef.current?.focus({ preventScroll: true }); }, [step]);

  const choose = (v) => {
    setAnswers((a) => ({ ...a, [q.id]: v })); setErrors({});
    if (!started.current) { started.current = true; trackCustom('QuizStart'); }
  };
  const next = () => {
    if (!answers[q.id]) return setErrors({ answer: 'Choose an option to continue.' });
    setErrors({}); setStep(step + 1);
  };
  const back = () => { setErrors({}); setSubmitError(''); setStep(step - 1); };

  async function submit() {
    if (lock.current) return;
    const errs = validateContact(contact, consent);
    setErrors(errs);
    if (Object.keys(errs).length) { setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0); return; }
    if (contact.website) return nav('/thank-you', { replace: true, state: { eventId: null } }); // bot: fake success, send nothing
    lock.current = true; setStatus('submitting'); setSubmitError('');
    try {
      const payload = buildPayload({ contact: { ...contact, e164: toE164(contact) }, answers, leadId });
      await submitLead(payload);
      try { sessionStorage.removeItem(SKEY); } catch {}
      nav('/thank-you', { replace: true, state: { eventId: payload.metadata.eventId } });
    } catch (e) {
      setSubmitError(e instanceof SubmitError ? e.message : 'Something went wrong. Please try again.');
      setStatus('error'); lock.current = false;
    }
  }

  const busy = status === 'submitting';
  return (
    <form className="card" noValidate onSubmit={(e) => { e.preventDefault(); last ? submit() : next(); }} aria-busy={busy}>
      <p className="kicker">Let's see if we may be able to help you</p>
      <div className="progress-meta">{label}</div>
      <div className="bar" role="progressbar" aria-label="Survey progress" aria-valuemin={0} aria-valuemax={Q.length + 1} aria-valuenow={step + 1} aria-valuetext={label}>
        <span style={{ width: `${((step + 1) / (Q.length + 1)) * 100}%` }} />
      </div>

      <div className="step" key={step}>
        {!last ? (
          <fieldset>
            <legend tabIndex={-1} ref={headRef}>{q.title}</legend>
            {q.help && <p className="help">{q.help}</p>}
            <div className="options">
              {q.options.map((o) => (
                <label className="option" key={o}>
                  <input type="radio" name={q.id} value={o} checked={answers[q.id] === o} onChange={() => choose(o)} aria-invalid={!!errors.answer} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
            {errors.answer && <p className="err" role="alert">{errors.answer}</p>}
          </fieldset>
        ) : (
          <>
            <h2 tabIndex={-1} ref={headRef}>You're ready for the next step</h2>
            <p className="help">Enter your contact details so we can process your request and share information about next steps.</p>
            <ContactStep {...{ contact, setContact, consent, setConsent, errors }} />
            {submitError && <p className="err banner" role="alert">{submitError}</p>}
          </>
        )}
      </div>

      <div className="nav">
        {step > 0 && <button type="button" className="btn ghost" onClick={back} disabled={busy}>Back</button>}
        <button type="submit" className="btn" disabled={busy}>
          {busy ? 'Sending…' : last ? (status === 'error' ? 'Try again' : 'Submit my request') : 'Next'}
        </button>
      </div>
    </form>
  );
}
