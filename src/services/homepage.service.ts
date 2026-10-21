import type {
  Media,
  ContentLink,
  HeroContent,
  GlobalContent,
  HomepageContent,
  CapitalEfficiencyContent,
  CapitarDifferenceContent,
  PortfolioProofPointsContent,
} from 'src/types/homepage';

import axios from 'axios';

const cmsOrigin = (import.meta.env.VITE_CMS_URL || 'http://localhost:1340').replace(/\/$/, '');
const client = axios.create({ baseURL: `${cmsOrigin}/api`, timeout: 5000 });
type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid CMS object');
  return value as RecordValue;
};
const string = (value: unknown) => (typeof value === 'string' ? value : undefined);
export function safeHref(value: unknown): string | undefined {
  const href = string(value)?.trim();
  if (!href) return undefined;
  if (/^\/(?!\/)/.test(href) || /^#\S+/.test(href)) return href;
  try {
    const url = new URL(href);
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol) ? href : undefined;
  } catch {
    return undefined;
  }
}
function media(value: unknown): Media | undefined {
  if (!value) return undefined;
  const item = record(value);
  const path = string(item.url);
  if (!path) return undefined;
  const url = new URL(path, cmsOrigin);
  if (!['http:', 'https:'].includes(url.protocol)) return undefined;
  return {
    url: url.href,
    alternativeText: string(item.alternativeText),
    mime: string(item.mime),
    width: typeof item.width === 'number' ? item.width : undefined,
    height: typeof item.height === 'number' ? item.height : undefined,
  };
}
function link(value: unknown): ContentLink | undefined {
  if (!value) return undefined;
  const item = record(value),
    label = string(item.label),
    href = safeHref(item.href);
  if (!label) throw new Error('CMS link requires a label');
  return {
    label,
    href,
    enabled: item.enabled === true && !!href,
    showIndicator: item.showIndicator === true,
  };
}
export function normalizeContent(globalValue: unknown, homepageValue: unknown): HomepageContent {
  const g = record(record(globalValue).data),
    h = record(record(record(homepageValue).data).hero);
  const heading = string(h.heading);
  if (!heading?.trim() || !Array.isArray(g.navigation))
    throw new Error('Required CMS content is missing');
  const global: GlobalContent = {
    brandLogo: media(g.brandLogo),
    navigation: g.navigation.map(link).filter((v): v is ContentLink => !!v),
    headerCta: link(g.headerCta),
  };
  const hero: HeroContent = {
    enabled: h.enabled !== false,
    heading,
    emphasisText: string(h.emphasisText),
    description: string(h.description),
    announcementText: string(h.announcementText),
    announcementLink: link(h.announcementLink),
    primaryCta: link(h.primaryCta),
    backgroundImage: media(h.backgroundImage),
    backgroundImageMobile: media(h.backgroundImageMobile),
    backgroundVideo: media(h.backgroundVideo),
    trustedClientsTitle: string(h.trustedClientsTitle),
    trustedClients: Array.isArray(h.trustedClients)
      ? h.trustedClients.flatMap((value) => {
          const item = record(value),
            logo = media(item.logo),
            name = string(item.name);
          return logo && name
            ? [
                {
                  name,
                  logo,
                  height:
                    typeof item.height === 'number' ? Math.max(10, Math.min(100, item.height)) : 40,
                  width:
                    typeof item.width === 'number' ? Math.max(20, Math.min(200, item.width)) : 120,
                },
              ]
            : [];
        })
      : [],
  };
  let portfolioProofPoints: PortfolioProofPointsContent | undefined;
  const proofValue = record(record(homepageValue).data).portfolioProofPoints;
  if (proofValue) {
    try {
      const proof = record(proofValue);
      const proofHeading = string(proof.heading);
      const sectionLabel = string(proof.sectionLabel);
      if (!proofHeading || !sectionLabel || !Array.isArray(proof.metrics)) throw new Error('Invalid proof section');
      portfolioProofPoints = {
        enabled: proof.enabled !== false, heading: proofHeading, sectionLabel,
        mutedText: string(proof.mutedText),
        backgroundLeft: media(proof.backgroundLeft), backgroundRight: media(proof.backgroundRight),
        metrics: proof.metrics.flatMap(value => {
          const item = record(value);
          const number = typeof item.value === 'number' || typeof item.value === 'string' ? Number(item.value) : NaN;
          const label = string(item.label);
          return Number.isFinite(number) && number >= 0 && label ? [{
            value: number, label, prefix: string(item.prefix), valueSuffix: string(item.valueSuffix), suffix: string(item.suffix),
          }] : [];
        }),
      };
    } catch {
      // An invalid optional section must not discard the published Header and Hero.
      portfolioProofPoints = undefined;
    }
  }
  let capitalEfficiency: CapitalEfficiencyContent | undefined;
  const capitalValue = record(record(homepageValue).data).capitalEfficiency;
  if (capitalValue) {
    try {
      const capital = record(capitalValue);
      const capitalHeading = string(capital.heading)?.trim();
      const sectionLabel = string(capital.sectionLabel)?.trim();
      if (!capitalHeading || !sectionLabel) throw new Error('Invalid capital section');
      capitalEfficiency = {
        enabled: capital.enabled !== false, heading: capitalHeading, sectionLabel,
        description: string(capital.description), backgroundImage: media(capital.backgroundImage),
        benefits: Array.isArray(capital.benefits) ? capital.benefits.flatMap(value => {
          try {
            const benefit = record(value), title = string(benefit.title)?.trim();
            return title ? [{ title, description: string(benefit.description),
              artworkWidth: typeof benefit.artworkWidth === 'number' && Number.isFinite(benefit.artworkWidth) ? Math.min(100, Math.max(20, benefit.artworkWidth)) : 94,
              layout: benefit.layout === 'wide' || benefit.layout === 'tall' ? benefit.layout : 'standard',
              icon: media(benefit.icon), artwork: media(benefit.artwork),
            } as CapitalEfficiencyContent['benefits'][number]] : [];
          } catch { return []; }
        }) : [],
      };
    } catch { capitalEfficiency = undefined; }
  }
  let capitarDifference: CapitarDifferenceContent | undefined;
  const differenceValue = record(record(homepageValue).data).capitarDifference;
  if (differenceValue) {
    try {
      const difference = record(differenceValue);
      const differenceHeading = string(difference.heading)?.trim();
      const sectionLabel = string(difference.sectionLabel)?.trim();
      if (!differenceHeading || !sectionLabel) throw new Error('Invalid difference section');
      capitarDifference = {
        enabled: difference.enabled !== false, heading: differenceHeading, sectionLabel,
        description: string(difference.description), cta: link(difference.cta), cardBackground: media(difference.cardBackground),
        items: Array.isArray(difference.items) ? difference.items.flatMap(value => {
          try {
            const item = record(value), title = string(item.title)?.trim();
            return title ? [{ title, number: string(item.number), description: string(item.description), image: media(item.image) }] : [];
          } catch { return []; }
        }) : [],
      };
    } catch { capitarDifference = undefined; }
  }
  return { global, hero, portfolioProofPoints, capitalEfficiency, capitarDifference };
}
export async function fetchHomepage(signal?: AbortSignal) {
  const [global, homepage] = await Promise.all([
    client.get('/global', { signal }),
    client.get('/homepage', { signal }),
  ]);
  return normalizeContent(global.data, homepage.data);
}
