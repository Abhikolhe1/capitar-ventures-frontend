import axios from 'axios';

import fallback from 'src/content/about-us.json';

import { safeHref } from './homepage.service';

export type AboutUsContent = Omit<typeof fallback, 'people'> & {
  artworks?: Record<string, string>;
  people: Omit<typeof fallback.people, 'team'> & {
    team: ((typeof fallback.people.team)[number] & { image?: string; biography?: string })[];
  };
};
const origin = (import.meta.env.VITE_CMS_URL || 'http://localhost:3035').replace(/\/$/, '');
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const imageURL = (value: unknown): string | undefined => {
  const url = object(value).url;
  if (typeof url !== 'string' || !url.trim()) return undefined;
  try {
    const result = new URL(url, origin);
    return ['http:', 'https:'].includes(result.protocol) ? result.href : undefined;
  } catch {
    return undefined;
  }
};
// Only known fields are accepted. Missing fields use Figma content; explicit empty lists remain empty.
function merge(template: unknown, value: unknown): unknown {
  if (Array.isArray(template))
    return Array.isArray(value) ? value.map((item) => merge(template[0], item)) : template;
  if (template && typeof template === 'object') {
    const raw = object(value);
    return Object.fromEntries(
      Object.entries(template).map(([key, child]) => [key, merge(child, raw[key])])
    );
  }
  return typeof value === typeof template ? value : template;
}
export function normalizeAboutUs(payload: unknown): AboutUsContent {
  const raw = object(payload).data;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw new Error('Published About Us is unavailable');
  const page = object(raw);
  const result = merge(fallback, page) as AboutUsContent;
  result.mission.image = imageURL(object(page.mission).image) || fallback.mission.image;
  const cta = object(object(page.hero).cta);
  if (Object.keys(cta).length) {
    const href = safeHref(cta.href);
    result.hero.cta.href = href || '';
    result.hero.cta.enabled = cta.enabled === true && !!href;
  }
  const members = object(page.people).team;
  if (Array.isArray(members))
    result.people.team = result.people.team.map((member, index) => ({
      ...member,
      portrait: ['rahul', 'partner', 'bikramjit'].includes(member.portrait)
        ? member.portrait
        : 'rahul',
      image: imageURL(object(members[index]).image),
      biography:
        typeof object(members[index]).biography === 'string'
          ? (object(members[index]).biography as string)
          : undefined,
    }));
  result.artworks = {};
  if (Array.isArray(page.artworks))
    page.artworks.forEach((value) => {
      const item = object(value),
        url = imageURL(item.image);
      if (typeof item.key === 'string' && url) result.artworks![item.key] = url;
    });
  return result;
}
export async function fetchAboutUs(signal?: AbortSignal): Promise<AboutUsContent> {
  const response = await axios.get(origin + '/api/about-us', { signal, timeout: 5000 });
  return normalizeAboutUs(response.data);
}
