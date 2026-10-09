import { useEffect } from 'react';

export type PageMeta = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  robots?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export const BRAND = 'QuicGen';
// Production defaults to the live Workers origin. Set VITE_SITE_URL once the custom domain is live.
export const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://quicgen.nnamdimichael020.workers.dev').replace(/\/$/, '');

export function usePageMeta({ title, description, path, image = '/og-image.png', robots = 'index, follow', ogType = 'website', jsonLd }: PageMeta) {
  useEffect(() => {
    const fullTitle = title.includes(BRAND) ? title : `${title} | ${BRAND}`;
    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', robots);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', `${siteUrl}${path ?? window.location.pathname}`);
    setMeta('property', 'og:image', image.startsWith('http') ? image : `${siteUrl}${image}`);
    setMeta('property', 'og:image:alt', 'QuicGen — free privacy-first online tools');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image.startsWith('http') ? image : `${siteUrl}${image}`);
    setMeta('name', 'twitter:image:alt', 'QuicGen — free privacy-first online tools');
    setMeta('name', 'twitter:card', 'summary_large_image');
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${siteUrl}${path ?? window.location.pathname}`;
    let schema = document.querySelector<HTMLScriptElement>('#qg-structured-data');
    if (jsonLd) {
      if (!schema) {
        schema = document.createElement('script');
        schema.id = 'qg-structured-data';
        schema.type = 'application/ld+json';
        document.head.appendChild(schema);
      }
      schema.textContent = JSON.stringify(jsonLd);
    } else {
      schema?.remove();
    }
    return () => {
      // Metadata is replaced by the next route; leaving it in place avoids a brief blank title on navigation.
    };
  }, [title, description, path, image, robots, ogType, jsonLd]);
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export async function copyText(value: string): Promise<boolean> {
  let area: HTMLTextAreaElement | undefined;
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
    area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    area?.remove();
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Inclusive, unbiased cryptographic integer sampling for all safe-integer ranges. */
export function secureRandomInt(min: number, max: number): number {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max < min) {
    throw new RangeError('Enter a valid whole-number range.');
  }
  const low = BigInt(min);
  const span = BigInt(max) - low + 1n;
  const sampleSpace = 1n << 64n;
  if (span > sampleSpace) throw new RangeError('The selected range is too large.');
  const limit = sampleSpace - (sampleSpace % span);
  const buffer = new Uint32Array(2);
  let sample: bigint;
  do {
    crypto.getRandomValues(buffer);
    sample = (BigInt(buffer[0]) << 32n) | BigInt(buffer[1]);
  } while (sample >= limit);
  return Number(low + (sample % span));
}

export function secureRandomString(length: number, alphabet: string): string {
  const characters = [...alphabet];
  if (!characters.length) throw new Error('Choose at least one character.');
  const out: string[] = [];
  const space = 0x1_0000_0000;
  const limit = Math.floor(space / characters.length) * characters.length;
  const batch = new Uint32Array(Math.max(16, Math.min(512, length * 2)));
  while (out.length < length) {
    crypto.getRandomValues(batch);
    for (const number of batch) {
      if (number >= limit) continue;
      out.push(characters[number % characters.length]);
      if (out.length === length) break;
    }
  }
  return out.join('');
}

export function safeNumber(value: string, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(value);
}

export function formatCurrency(value: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setStored<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be disabled or full; tools continue to work without it.
  }
}

export function removeStored(key: string) {
  try { localStorage.removeItem(key); } catch { /* Storage is optional. */ }
}
