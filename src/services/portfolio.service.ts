import type { Media, ContentLink, CaseStudyContent } from 'src/types/homepage';

import axios from 'axios';

import fallback from 'src/content/portfolio.json';

import { safeHref } from './homepage.service';

export type Company = {
  key: string;
  name: string;
  description: string;
  sector: string;
  stage: string;
  status: string;
  caseStudyUrl?: string;
  websiteUrl?: string;
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
// Replace the original seeded banner with the revised Figma artwork. Newly
// selected CMS media still takes precedence over the bundled default.
const heroMedia = (value: unknown): Media => {
  const image = media(value);
  return !image || /\/(?:portfolio_)?hero[_-]background(?:_[a-f0-9]+)?\.webp(?:\?.*)?$/.test(image.url)
    ? fallback.hero.backgroundImage
    : image;
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

// `offset` keeps keys unique across pages (index is the position in the full list).
const normalizeCompanies = (list: unknown[], offset = 0): Company[] =>
  list.flatMap((value, position) => {
    const company = object(value),
      founder = object(company.founder),
      index = offset + position;
    if (!text(company.name).trim()) return [];
    return [
      {
        key: `${text(company.key, String(company.id ?? index))}-${index}`,
        name: text(company.name),
        description: text(company.description),
        sector: text(company.sector),
        stage: text(company.stage),
        status: text(company.status),
        // The case study button appears only for companies with a safe link.
        caseStudyUrl: safeHref(company.caseStudyUrl),
        websiteUrl: /^https?:\/\//i.test(text(company.websiteUrl).trim())
          ? safeHref(text(company.websiteUrl).trim())
          : undefined,
        logo: media(company.logo),
        founder: { name: text(founder.name), role: text(founder.role) },
      },
    ];
  });

export function normalizePortfolio(payload: unknown): PortfolioContent {
  const raw = object(payload).data;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw new Error('Published Portfolio content is unavailable');
  const page = object(raw);
  const hero = object(page.hero),
    conversation = object(page.conversation);
  const settings = object(page.companiesSection),
    featured = object(page.featuredStories);
  // The CMS now serves companies page by page (fetchPortfolioCompanies); the
  // bundled list remains the offline fallback.
  const companies: Company[] = Array.isArray(page.companies)
    ? normalizeCompanies(page.companies)
    : fallback.companies;
  return {
    title: text(page.title, fallback.title),
    hero: {
      enabled: enabled(hero.enabled),
      heading: text(hero.heading, fallback.hero.heading),
      emphasis: text(hero.emphasis, fallback.hero.emphasis),
      description: text(hero.description, fallback.hero.description),
      backgroundImage: heroMedia(hero.backgroundImage),
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

export type CompanyQuery = { limit: number; skip: number; sector?: string; stage?: string };
export type CompanyPage = {
  companies: Company[];
  total: number;
  sectors: string[];
  stages: string[];
};

const strings = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && !!item) : [];

export function normalizeCompanyPage(payload: unknown, skip = 0): CompanyPage {
  const body = object(payload);
  if (!Array.isArray(body.data)) throw new Error('Portfolio companies are unavailable');
  const meta = object(body.meta);
  const total = Number(object(meta.pagination).total);
  const companies = normalizeCompanies(body.data, skip);
  return {
    companies,
    total: Number.isFinite(total) && total >= 0 ? total : skip + companies.length,
    sectors: strings(meta.sectors),
    stages: strings(meta.stages),
  };
}

// Server-side pagination: GET /api/portfolio/companies?limit=&skip=&sector=&stage=
export async function fetchPortfolioCompanies(
  { limit, skip, sector, stage }: CompanyQuery,
  signal?: AbortSignal
): Promise<CompanyPage> {
  const response = await axios.get(`${origin}/api/portfolio/companies`, {
    signal,
    timeout: 5000,
    params: { limit, skip, ...(sector ? { sector } : {}), ...(stage ? { stage } : {}) },
  });
  return normalizeCompanyPage(response.data, skip);
}

// Same contract as the endpoint, run on a local list (used when the CMS is unreachable).
export function paginateCompanies(list: Company[], { limit, skip, sector, stage }: CompanyQuery): CompanyPage {
  const matches = list.filter(
    (company) => (!sector || company.sector === sector) && (!stage || company.stage === stage)
  );
  const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));
  return {
    companies: matches.slice(skip, skip + limit),
    total: matches.length,
    sectors: unique(list.map((company) => company.sector)),
    stages: unique(list.map((company) => company.stage)),
  };
}
