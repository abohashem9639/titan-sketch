// Plain fetch instead of supabase-js: visitors download ~0.5KB instead of ~60KB.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const VISITOR_ID_KEY = 'portfolio:visitor-id';
const NO_TRACK_KEY = 'portfolio:no-track';
const SESSION_KEY = 'portfolio:tracked';

const BOT_PATTERN = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|embedly|whatsapp|telegram/i;

const safeGet = (storage: Storage, k: string) => {
  try {
    return storage.getItem(k);
  } catch {
    return null;
  }
};

const safeSet = (storage: Storage, k: string, v: string) => {
  try {
    storage.setItem(k, v);
  } catch {
    // storage blocked (private mode, etc.) — ignore
  }
};

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

export const getVisitorId = () => {
  let id = safeGet(localStorage, VISITOR_ID_KEY);
  if (!id) {
    id = newId();
    safeSet(localStorage, VISITOR_ID_KEY, id);
  }
  return id;
};

export const isTrackingDisabled = () => safeGet(localStorage, NO_TRACK_KEY) === '1';

export const disableTracking = () => safeSet(localStorage, NO_TRACK_KEY, '1');

const detectDevice = (ua: string) => {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android/i.test(ua)) return 'mobile';
  return 'desktop';
};

const detectBrowser = (ua: string) => {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\/|opera/i.test(ua)) return 'Opera';
  if (/samsungbrowser/i.test(ua)) return 'Samsung Internet';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/chrome|crios/i.test(ua)) return 'Chrome';
  if (/safari/i.test(ua)) return 'Safari';
  return 'Other';
};

const detectOs = (ua: string) => {
  if (/windows/i.test(ua)) return 'Windows';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
  if (/mac os x|macintosh/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Other';
};

// First-touch source: utm_source / ref param, else the external referrer host.
const detectSource = () => {
  const params = new URLSearchParams(window.location.search);
  const tagged = params.get('utm_source') || params.get('ref');
  if (tagged) return tagged.toLowerCase();

  try {
    if (!document.referrer) return null;
    const host = new URL(document.referrer).hostname.replace(/^www\./, '');
    return host && host !== window.location.hostname.replace(/^www\./, '') ? host : null;
  } catch {
    return null;
  }
};

/** Records this browser as a visitor. Safe to call on every page load. */
export const trackVisit = async () => {
  if (import.meta.env.DEV || !SUPABASE_URL || !SUPABASE_KEY) return;
  if (isTrackingDisabled()) return;
  if (safeGet(sessionStorage, SESSION_KEY)) return;

  const ua = navigator.userAgent || '';
  if (BOT_PATTERN.test(ua) || navigator.webdriver) return;

  safeSet(sessionStorage, SESSION_KEY, '1');

  let ok = false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/track_visit`, {
      method: 'POST',
      keepalive: true,
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_visitor_id: getVisitorId(),
        p_source: detectSource(),
        p_path: window.location.pathname,
        p_language: navigator.language || null,
        p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
        p_device: detectDevice(ua),
        p_browser: detectBrowser(ua),
        p_os: detectOs(ua),
      }),
    });
    ok = res.ok;
  } catch {
    // network error — fall through
  }

  // Let the next page load retry if this one failed.
  if (!ok) {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }
};
