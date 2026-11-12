import type { Media, ContentLink } from 'src/types/homepage';

import axios from 'axios';

import { safeHref } from './homepage.service';

export type CaseStudy = {
  slug: string;
  companyName: string;
  logo?: Media;
  heroImage?: Media;
  headline: string;
  summary: string;
  founders: string;
  sector: string;
  stage: string;
  website?: string;
  metrics: { value: string; label: string }[];
  sections: { heading: string; body: string }[];
  quote?: { text: string; name: string; role: string };
  cta?: ContentLink;
};

const origin = (import.meta.env.VITE_CMS_URL || 'http://localhost:3035').replace(/\/$/, '');
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const text = (value: unknown) => (typeof value === 'string' ? value : '');
const list = (value: unknown) => (Array.isArray(value) ? value.map(object) : []);
const media = (value: unknown): Media | undefined => {
  const item = object(value);
  if (typeof item.url !== 'string' || !item.url.trim()) return undefined;
  try {
    const url = new URL(item.url, origin);
    return ['http:', 'https:'].includes(url.protocol)
      ? { url: url.href, alternativeText: text(item.alternativeText) }
      : undefined;
  } catch {
    return undefined;
  }
};

export class CaseStudyNotFound extends Error {}

export function normalizeCaseStudy(payload: unknown): CaseStudy {
  const raw = object(object(payload).data);
  if (!text(raw.slug) || !text(raw.companyName).trim()) throw new CaseStudyNotFound();
  const quote = object(raw.quote);
  const cta = object(raw.cta);
  const ctaHref = safeHref(cta.href);
  return {
    slug: text(raw.slug),
    companyName: text(raw.companyName),
    logo: media(raw.logo),
    heroImage: media(raw.heroImage),
    headline: text(raw.headline),
    summary: text(raw.summary),
    founders: text(raw.founders),
    sector: text(raw.sector),
    stage: text(raw.stage),
    website: safeHref(raw.website),
    metrics: list(raw.metrics)
      .map((item) => ({ value: text(item.value), label: text(item.label) }))
      .filter((item) => item.value.trim()),
    sections: list(raw.sections)
      .map((item) => ({ heading: text(item.heading), body: text(item.body) }))
      .filter((item) => item.heading.trim()),
    quote: text(quote.text).trim()
      ? { text: text(quote.text), name: text(quote.name), role: text(quote.role) }
      : undefined,
    cta:
      cta.enabled === true && ctaHref
        ? { label: text(cta.label) || 'Talk to us', href: ctaHref, enabled: true }
        : undefined,
  };
}

export async function fetchCaseStudy(slug: string, signal?: AbortSignal): Promise<CaseStudy> {
  try {
    const response = await axios.get(`${origin}/api/case-studies/${encodeURIComponent(slug)}`, {
      signal,
      timeout: 5000,
    });
    return normalizeCaseStudy(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) throw new CaseStudyNotFound();
    throw error;
  }
}
