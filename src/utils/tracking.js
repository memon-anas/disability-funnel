// Attribution + Meta tracking helpers.
// Attribution is captured once at load, stored in sessionStorage, and only replaced when a NEW
// campaign click arrives (utm_* or fbclid present). Same-tab navigation never wipes it.
const KEY = 'funnel_attribution_v1';
const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
const store = {
  get: (k) => { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: degrade silently */ } },
};
const CLICK_IDS = ['fbclid', 'gclid', 'gbraid', 'wbraid', 'ttclid', 'msclkid', 'twclid', 'li_fat_id', 'epik', 'rdt_cid'];
const refHost = (u) => { try { return u ? new URL(u).hostname.replace(/^www\./, '') : ''; } catch { return ''; } };
const cookie = (n) => document.cookie.split('; ').find((c) => c.startsWith(n + '='))?.split('=')[1] || '';
export const newId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export function initTracking() {
  const q = new URLSearchParams(location.search);
  const utm = {};
  UTM.forEach((k) => { const v = q.get(k); if (v) utm[k] = v.slice(0, 200); });
  q.forEach((v, k) => { if (/^utm_/i.test(k) && !UTM.includes(k.toLowerCase())) utm[k.toLowerCase()] = v.slice(0, 200); }); // utm_id etc.
  const clickIds = {}; CLICK_IDS.forEach((k) => { const v = q.get(k); if (v) clickIds[k] = v.slice(0, 300); });
  const fbclid = clickIds.fbclid || '';
  const prev = store.get(KEY);
  if (prev && !Object.keys(utm).length && !Object.keys(clickIds).length) return prev;
  const now = Date.now();
  const rec = {
    utm, fbclid, clickIds,
    clickTs: fbclid ? now : prev?.clickTs || null,
    landingPage: location.href,
    referrer: document.referrer || '',
    firstVisitAt: prev?.firstVisitAt || new Date(now).toISOString(),
  };
  store.set(KEY, rec);
  return rec;
}

// Read at submit time: _fbp/_fbc cookies are written by the pixel after load, so read them late.
export function getTracking() {
  const r = store.get(KEY) || initTracking();
  const fbc = cookie('_fbc') || (r.fbclid ? `fb.1.${r.clickTs}.${r.fbclid}` : '');
  return {
    ...Object.fromEntries(UTM.map((k) => [k, r.utm?.[k] || ''])),
    landingPage: r.landingPage, referrer: r.referrer, firstVisitAt: r.firstVisitAt,
    fbclid: r.fbclid, clickIds: r.clickIds || {},
    extraUtm: Object.fromEntries(Object.entries(r.utm || {}).filter(([k]) => !UTM.includes(k))),
    source: r.utm?.utm_source || refHost(r.referrer) || 'direct', // works even with no UTMs
    fbp: cookie('_fbp'), fbc, userAgent: navigator.userAgent,
  };
}

export function loadPixel() {
  const id = import.meta.env.VITE_META_PIXEL_ID;
  if (!id || window.fbq) return;
  const fbq = (window.fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); });
  fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
  const s = document.createElement('script');
  s.async = true; s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  fbq('init', id);
  fbq('track', 'PageView');
}

// eventId MUST match the event_id sent in your server-side Conversions API call so Meta de-duplicates.
export function trackStandard(name, eventId, params = {}) {
  window.fbq?.('track', name, params, eventId ? { eventID: eventId } : undefined);
}
export function trackCustom(name, params = {}) { window.fbq?.('trackCustom', name, params); }
