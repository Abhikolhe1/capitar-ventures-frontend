import type { Media } from 'src/types/homepage';

import axios from 'axios';

import fallback from 'src/content/venture-debt.json';
import { safeHref } from 'src/services/homepage.service';

export type VentureDebtContent = Omit<typeof fallback, 'practice'> & {
  practice: Omit<typeof fallback.practice, 'items'> & {
    items: ((typeof fallback.practice.items)[number] & { icon?: Media })[];
  };
};
const origin = (import.meta.env.VITE_CMS_URL || 'http://localhost:3035').replace(/\/$/, '');
const object = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

// Read only fields present in the page contract; malformed sections fall back independently.
function merge(template: unknown, value: unknown, key = ''): unknown {
  if (Array.isArray(template)) {
    if (!Array.isArray(value)) return template;
    if (!value.length && key === 'items' && object(template[0])?.title) return template;
    return value.filter((item) => object(item)).map((item) => merge(template[0], item));
  }
  const shape = object(template);
  if (shape) {
    const incoming = object(value);
    if (!incoming) return template;
    if ('url' in shape) {
      try {
        if (typeof incoming.url !== 'string') return template;
        const url = new URL(incoming.url, origin);
        if (!['https:', 'http:'].includes(url.protocol)) return template;
        return {
          url: url.href,
          alternativeText:
            typeof incoming.alternativeText === 'string'
              ? incoming.alternativeText
              : shape.alternativeText,
        };
      } catch {
        return template;
      }
    }
    const result = Object.fromEntries(
      Object.entries(shape).map(([field, defaultValue]) => [
        field,
        merge(defaultValue, incoming[field], field),
      ])
    );
    if ('href' in shape) {
      result.href = safeHref(incoming.href) || '';
      result.enabled = incoming.enabled === true && Boolean(result.href);
    }
    // Outcomes can optionally replace their default sprite with an individual CMS image.
    if (typeof shape.title === 'string' && incoming.icon)
      result.icon = merge({ url: '', alternativeText: '' }, incoming.icon);
    return result;
  }
  if (key === 'section')
    return ['before', 'with-capitar', 'in-practice', 'before-you-decide'].includes(String(value))
      ? value
      : template;
  return typeof value === typeof template ? value : template;
}

export function normalizeVentureDebt(payload: unknown): VentureDebtContent {
  const data = object(object(payload)?.data);
  if (!data) throw new Error('Published venture debt content is unavailable');
  return merge(fallback, data) as VentureDebtContent;
}

export async function fetchVentureDebt(signal?: AbortSignal) {
  const response = await axios.get(`${origin}/api/venture-debt`, { signal, timeout: 5000 });
  return normalizeVentureDebt(response.data);
}
