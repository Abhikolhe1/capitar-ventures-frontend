import axios from 'axios';

import fallback from 'src/content/privacy-policy.json';

export type PrivacyBlock = { kind: 'paragraph' | 'list'; items: string[] };
export type PrivacyPolicyContent = {
  title: string;
  illustration: string;
  illustrationAlt: string;
  sections: { heading: string; blocks: PrivacyBlock[] }[];
};
export const privacyPolicyFallback = fallback as PrivacyPolicyContent;
const origin = (import.meta.env.VITE_CMS_URL || 'http://localhost:3035').replace(/\/$/, '');
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const text = (value: unknown): string => {
  const node = object(value);
  if (typeof node.text === 'string') return node.text;
  return Array.isArray(node.children) ? node.children.map(text).join('') : '';
};

export function normalizePrivacyPolicy(payload: unknown): PrivacyPolicyContent {
  const page = object(object(payload).data);
  if (typeof page.title !== 'string' || !page.title.trim() || !Array.isArray(page.sections))
    throw new Error('Published Privacy Policy is unavailable');
  const image = object(page.illustration);
  let illustration = fallback.illustration;
  if (typeof image.url === 'string' && image.url.trim()) {
    const url = new URL(image.url, origin);
    if (['http:', 'https:'].includes(url.protocol)) illustration = url.href;
  }
  const sections = page.sections.map((value) => {
    const section = object(value);
    if (typeof section.heading !== 'string' || !Array.isArray(section.blocks))
      throw new Error('Invalid Privacy Policy section');
    const blocks = section.blocks.flatMap<PrivacyBlock>((raw) => {
      const block = object(raw);
      if (block.type === 'list' && Array.isArray(block.children))
        return [{ kind: 'list', items: block.children.map(text).filter(Boolean) }];
      const valueText = text(block);
      return valueText ? [{ kind: 'paragraph', items: [valueText] }] : [];
    });
    return { heading: section.heading, blocks };
  });
  return {
    title: page.title,
    illustration,
    illustrationAlt:
      typeof image.alternativeText === 'string' ? image.alternativeText : fallback.illustrationAlt,
    sections,
  };
}

export async function fetchPrivacyPolicy(signal?: AbortSignal) {
  const response = await axios.get(`${origin}/api/privacy-policy`, { signal, timeout: 5000 });
  return normalizePrivacyPolicy(response.data);
}
