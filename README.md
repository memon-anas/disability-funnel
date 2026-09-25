# Disability Quiz Funnel (React + Vite)

## Run
    npm install
    cp .env.example .env
    npm run dev   # try /?utm_source=facebook&utm_medium=paid&utm_campaign=test&fbclid=abc

Without `VITE_LEAD_WEBHOOK_URL`, dev mode MOCKS success (console warning). A production build without it fails loudly instead of pretending a lead was stored.

## Reliability decisions
- **Idempotency:** one `leadId` per form session -> `Idempotency-Key` header + `metadata.leadId`. Auto retries (2x, backoff, on network/5xx/429/timeout) and manual "Try again" can't double-create leads if the webhook dedupes on it (Airtable: upsert on Lead ID).
- **Thank-you only on 2xx.** 4xx (except 429) is non-retryable. Answers survive a failure; contact data is never persisted.
- **Double-submit:** synchronous `useRef` lock + disabled button. Honeypot silently drops naive bots.
- `/thank-you` without router state redirects home, so direct visits can't inflate conversions.

## Meta tracking quality
- UTMs + `fbclid` captured before first render, kept in sessionStorage; replaced only by a new campaign click. `firstVisitAt` preserved.
- `_fbp`/`_fbc` read at submit time (cookies appear after the pixel loads); `fbc` rebuilt from `fbclid` if the cookie is missing.
- **Browser + server dedup:** `Lead` pixel event fires once (refresh-guarded) with `eventID = lead-<leadId>`. Send the same value as `event_id` in your Conversions API call from n8n/Make (hashed email/phone, `fbp`, `fbc`, `client_user_agent`, `event_source_url`). Meta then counts one lead, not two.
- Fire CAPI only after the lead is stored, so Meta's optimization signal equals real leads.
- Custom `QuizStart` event gives a click-to-completion drop-off signal.

## Before production
1. Webhook must allow this origin via CORS (JSON + custom header triggers a preflight).
2. Airtable tables (Leads / Events / Funnel Config) live behind the webhook; the token never reaches the browser.
3. Terms/Privacy URLs and trust stats/rating live in `src/config/site.js`. Make consent text match the real contact channels (calls/SMS/email).
