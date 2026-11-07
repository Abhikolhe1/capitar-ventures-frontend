import type { Media, ContentLink, CaseStudyContent } from 'src/types/homepage';

import axios from 'axios';

import fallback from 'src/content/portfolio.json';

import { safeHref } from './homepage.service';

type Company = {
  key: string;
  name: string;
  description: string;
  sector: string;
  stage: string;
  status: string;
  logo?: Media;
  founder: { name: string; role: string };
};
export type PortfolioContent = {
  title: string;
  hero: {
    enabled: boolean;
    heading: string;
    emphasis: string;
    description: string;
    backgroundImage?: Media;
    cta: ContentLink;
  };
  featuredStories: CaseStudyContent;
  companiesSection: typeof fallback.companiesSection;
  companies: Company[];
  conversation: {
    enabled: boolean;
    sectionLabel: string;
    heading: string;
    description: string;
    backgroundImage?: Media;
    cta: ContentLink;
  };
};

const origin = (import.meta.env.VITE_CMS_URL || 'http://localhost:3035').replace(/\/$/, '');
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const text = (value: unknown, defaultValue = '') =>
  typeof value === 'string' ? value : defaultValue;
const enabled = (value: unknown) => value !== false;
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
const link = (value: unknown, defaultValue: ContentLink): ContentLink => {
  if (!value || typeof value !== 'object') return defaultValue;
  const item = object(value);
  const href = safeHref(item.href);
  return {
    label: text(item.label, defaultValue.label),
    href,
    enabled: item.enabled === true && !!href,
  };
};

export function normalizePortfolio(payload: unknown): PortfolioContent {
  const raw = object(payload).data;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw new Error('Published Portfolio content is unavailable');
  const page = object(raw);
  const hero = object(page.hero),
    conversation = object(page.conversation);
  const settings = object(page.companiesSection),
    featured = object(page.featuredStories);
  const companies: Company[] = Array.isArray(page.companies)
    ? page.companies.flatMap((value, index) => {
        const company = object(value),
          founder = object(company.founder);
        if (!text(company.name).trim()) return [];
        return [
          {
            key: `${text(company.key, String(company.id ?? index))}-${index}`,
            name: text(company.name),
            description: text(company.description),
            sector: text(company.sector),
            stage: text(company.stage),
            status: text(company.status),
            logo: media(company.logo),
            founder: { name: text(founder.name), role: text(founder.role) },
          },
        ];
      })
    : fallback.companies;
  return {
    title: text(page.title, fallback.title),
    hero: {
      enabled: enabled(hero.enabled),
      heading: text(hero.heading, fallback.hero.heading),
      emphasis: text(hero.emphasis, fallback.hero.emphasis),
      description: text(hero.description, fallback.hero.description),
      backgroundImage: media(hero.backgroundImage) ?? fallback.hero.backgroundImage,
      cta: link(hero.cta, fallback.hero.cta),
    },
    featuredStories: {
      enabled: enabled(featured.enabled),
      sectionLabel: text(featured.sectionLabel, fallback.featuredStories.sectionLabel),
      heading: text(featured.heading, fallback.featuredStories.heading),
      description: text(featured.description, fallback.featuredStories.description),
      items: Array.isArray(featured.items)
        ? featured.items.flatMap((value) => {
            const item = object(value);
            if (!text(item.name).trim()) return [];
            return [
              {
                name: text(item.name),
                number: text(item.number),
                description: text(item.description),
                image: media(item.image),
                logo: media(item.logo),
                link: link(item.link, {
                  label: `Read ${text(item.name)} case study`,
                  enabled: false,
                }),
              },
            ];
          })
        : fallback.featuredStories.items,
    },
    companiesSection: Object.fromEntries(
      Object.entries(fallback.companiesSection).map(([key, value]) => [
        key,
        key === 'enabled' ? enabled(settings[key]) : text(settings[key], String(value)),
      ])
    ) as typeof fallback.companiesSection,
    companies,
    conversation: {
      enabled: enabled(conversation.enabled),
      sectionLabel: text(conversation.sectionLabel, fallback.conversation.sectionLabel),
      heading: text(conversation.heading, fallback.conversation.heading),
      description: text(conversation.description, fallback.conversation.description),
      backgroundImage: media(conversation.backgroundImage),
      cta: link(conversation.cta, fallback.conversation.cta),
    },
  };
}

export async function fetchPortfolio(signal?: AbortSignal): Promise<PortfolioContent> {
  const response = await axios.get(`${origin}/api/portfolio`, { signal, timeout: 5000 });
  return normalizePortfolio(response.data);
}
