import type {
  Media,
  ContentLink,
  HeroContent,
  TeamContent,
  GlobalContent,
  FooterContent,
  HomepageContent,
  CaseStudyContent,
  EditorialTabContent,
  InsightsNewsContent,
  TestimonialsContent,
  CapitalEfficiencyContent,
  CapitarDifferenceContent,
  PortfolioProofPointsContent,
} from 'src/types/homepage';

import axios from 'axios';

const cmsOrigin = (import.meta.env.VITE_CMS_URL || 'http://localhost:3035').replace(/\/$/, '');
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
function footer(value: unknown): FooterContent | undefined {
  if (!value) return undefined;
  const links = (items: unknown) => Array.isArray(items) ? items.flatMap(item => {
    try { const normalized = link(item); return normalized ? [normalized] : []; } catch { return []; }
  }) : [];
  const empty = { enabled: false, aiLinks: [], navigation: [], socialLinks: [], legalLinks: [], ctaHeading: '' };
  try {
    const item = record(value);
    return {
      enabled: item.enabled !== false, brandLogo: media(item.brandLogo), logoMonochrome: item.logoMonochrome === true,
      address: string(item.address), email: string(item.email), phone: string(item.phone), aiText: string(item.aiText),
      aiLinks: Array.isArray(item.aiLinks) ? item.aiLinks.flatMap(shortcut => {
        try {
          const normalized = link(shortcut);
          return normalized ? [{ ...normalized, icon: media(record(shortcut).icon) }] : [];
        } catch { return []; }
      }) : [],
      navigation: links(item.navigation), socialLabel: string(item.socialLabel), socialLinks: links(item.socialLinks),
      legalLinks: links(item.legalLinks), copyright: string(item.copyright), ctaHeading: string(item.ctaHeading) || '', cta: link(item.cta),
      backgroundImage: media(item.backgroundImage), backgroundVideo: media(item.backgroundVideo),
    };
  } catch { return empty; }
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
    footer: footer(g.footer),
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
  let caseStudy: CaseStudyContent | undefined;
  const caseValue = record(record(homepageValue).data).caseStudy;
  if (caseValue) {
    try {
      const value = record(caseValue), title = string(value.heading)?.trim(), sectionLabel = string(value.sectionLabel)?.trim();
      if (!title || !sectionLabel) throw new Error('Invalid case study section');
      caseStudy = { enabled: value.enabled !== false, heading: title, sectionLabel, description: string(value.description),
        items: Array.isArray(value.items) ? value.items.flatMap(entry => {
          try { const item = record(entry), name = string(item.name)?.trim();
            return name ? [{ name, number: string(item.number), description: string(item.description), image: media(item.image), logo: media(item.logo), metricValue: string(item.metricValue), metricSuffix: string(item.metricSuffix), metricLabel: string(item.metricLabel), link: link(item.link) }] : [];
          } catch { return []; }
        }) : [],
      };
    } catch { caseStudy = undefined; }
  }
  let team: TeamContent | undefined;
  const teamValue = record(record(homepageValue).data).team;
  if (teamValue) {
    try {
      const item = record(teamValue);
      const teamHeading = string(item.heading)?.trim();
      const sectionLabel = string(item.sectionLabel)?.trim();
      if (!teamHeading || !sectionLabel || !Array.isArray(item.members)) throw new Error('Invalid team section');
      team = {
        enabled: item.enabled !== false, heading: teamHeading, sectionLabel, description: string(item.description),
        members: item.members.flatMap(value => {
          try {
            const member = record(value), name = string(member.name)?.trim(), role = string(member.role)?.trim();
            if (!name || !role) return [];
            let linkedinUrl: string | undefined;
            try {
              const url = new URL(string(member.linkedinUrl) || '');
              if (url.protocol === 'https:' && (url.hostname === 'linkedin.com' || url.hostname.endsWith('.linkedin.com'))) linkedinUrl = url.href;
            } catch { /* Missing or invalid profile links remain non-interactive. */ }
            const portraitPositionY = typeof member.portraitPositionY === 'number' && Number.isFinite(member.portraitPositionY) ? Math.max(0, Math.min(100, member.portraitPositionY)) : 50;
            return [{ name, role, description: string(member.description), portrait: media(member.portrait), portraitPositionY, linkedinUrl }];
          } catch { return []; }
        }),
      };
    } catch { team = { enabled: false, sectionLabel: '', heading: '', members: [] }; }
  }
  let insightsNews: InsightsNewsContent | undefined;
  const editorialValue = record(record(homepageValue).data).insightsNews;
  if (editorialValue) {
    const normalizeTab = (tabValue: unknown, label: string): EditorialTabContent => {
      const empty = { label, sectionLabel: label.toUpperCase(), heading: label, items: [] };
      try {
        const tab = record(tabValue);
        const tabHeading = string(tab.heading)?.trim();
        if (!tabHeading) return empty;
        return {
          label: string(tab.label)?.trim() || label,
          sectionLabel: string(tab.sectionLabel)?.trim() || label.toUpperCase(),
          heading: tabHeading, emptyMessage: string(tab.emptyMessage), cta: link(tab.cta),
          items: Array.isArray(tab.items) ? tab.items.flatMap(value => {
            try {
              const item = record(value), title = string(item.title)?.trim();
              return title ? [{ title, category: string(item.category) || '', description: string(item.description), image: media(item.image), href: safeHref(item.href) }] : [];
            } catch { return []; }
          }) : [],
        };
      } catch { return empty; }
    };
    try {
      const editorial = record(editorialValue);
      insightsNews = { enabled: editorial.enabled !== false, insights: normalizeTab(editorial.insights, 'Insights'), news: normalizeTab(editorial.news, 'News') };
    } catch {
      insightsNews = { enabled: false, insights: normalizeTab(null, 'Insights'), news: normalizeTab(null, 'News') };
    }
  }
  let testimonials: TestimonialsContent | undefined;
  const testimonialsValue = record(record(homepageValue).data).testimonials;
  if (testimonialsValue) {
    try {
      const section = record(testimonialsValue);
      const sectionHeading = string(section.heading)?.trim(), sectionLabel = string(section.sectionLabel)?.trim();
      if (!sectionHeading || !sectionLabel || !Array.isArray(section.items)) throw new Error('Invalid testimonials section');
      testimonials = { enabled: section.enabled !== false, heading: sectionHeading, sectionLabel,
        items: section.items.flatMap(value => {
          try {
            const item = record(value), name = string(item.name)?.trim(), quote = string(item.quote)?.trim();
            return name && quote ? [{ name, quote, role: string(item.role), company: string(item.company), location: string(item.location), portrait: media(item.portrait), companyLogo: media(item.companyLogo), companyLogoMonochrome: item.companyLogoMonochrome === true }] : [];
          } catch { return []; }
        }),
      };
    } catch { testimonials = { enabled: false, sectionLabel: '', heading: '', items: [] }; }
  }
  return { global, hero, portfolioProofPoints, capitalEfficiency, capitarDifference, caseStudy, team, insightsNews, testimonials };
}
export async function fetchHomepage(signal?: AbortSignal) {
  const [global, homepage] = await Promise.all([
    client.get('/global', { signal }),
    client.get('/homepage', { signal }),
  ]);
  return normalizeContent(global.data, homepage.data);
}
