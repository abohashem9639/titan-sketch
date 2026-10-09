import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import defaults from './defaultContent.json';
import type { SectionKey, SiteContent } from './types';

/**
 * The content the site shipped with before the CMS. Used as the fallback when
 * the database can't be reached, and as the "restore original" backup.
 */
export const DEFAULT_CONTENT = defaults as unknown as SiteContent;

export type ContentRows = Partial<Record<SectionKey, unknown>>;

export const CONTENT_CACHE_KEY = 'portfolio:content:v1';
const FETCH_TIMEOUT_MS = 5000;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

// Objects merge key by key; arrays and primitives from `override` win.
const deepMerge = (base: unknown, override: unknown): unknown => {
  if (override === undefined || override === null) return base;
  if (!isPlainObject(base) || !isPlainObject(override)) return override;
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) out[key] = deepMerge(base[key], override[key]);
  return out;
};

/** Fills anything missing in the stored sections from the defaults. */
export const mergeContent = (rows: ContentRows, base: SiteContent = DEFAULT_CONTENT): SiteContent =>
  deepMerge(base, rows) as SiteContent;

/** Reads the published content with a plain fetch (no supabase-js on the public site). */
export const fetchPublishedContent = async (signal?: AbortSignal): Promise<ContentRows> => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Supabase is not configured');

  const res = await fetch(`${url}/rest/v1/site_content?select=section,data`, {
    headers: { apikey: key },
    signal,
  });
  if (!res.ok) throw new Error(`Content request failed (${res.status})`);

  const rows = (await res.json()) as { section: SectionKey; data: unknown }[];
  return Object.fromEntries(rows.map((r) => [r.section, r.data]));
};

const readCache = (): ContentRows | null => {
  try {
    const raw = localStorage.getItem(CONTENT_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return isPlainObject(parsed) ? (parsed as ContentRows) : null;
  } catch {
    return null;
  }
};

const writeCache = (rows: ContentRows) => {
  try {
    localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(rows));
  } catch {
    // storage blocked — ignore
  }
};

const ContentContext = createContext<SiteContent | null>(null);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  // Returning visitors render instantly from the last copy, then refresh.
  const [content, setContent] = useState<SiteContent | null>(() => {
    const cached = readCache();
    return cached ? mergeContent(cached) : null;
  });

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    fetchPublishedContent(controller.signal)
      .then((rows) => {
        setContent(mergeContent(rows));
        writeCache(rows);
      })
      // Keep the cached copy if there is one; otherwise fall back to the defaults.
      .catch(() => setContent((c) => c ?? DEFAULT_CONTENT))
      .finally(() => clearTimeout(timeout));

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
};

export const useContent = () => {
  const content = useContext(ContentContext);
  if (!content) throw new Error('useContent must be used within a ContentProvider');
  return content;
};
