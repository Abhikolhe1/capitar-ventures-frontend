// Keep the introduction factual; the provider should verify details rather than repeat marketing claims.
export const CAPITAR_INTRODUCTION_PROMPT =
  'Introduce Capitar Ventures and explain its venture debt and growth capital offerings in plain language. Who are these offerings suited to, how can they support a growing business, and what should a founder ask before getting in touch? Use current public sources, cite them, and clearly distinguish verified information from anything you cannot confirm.';

export function footerAiDestination(label: string) {
  const provider = label.toLowerCase().replace(/\s+/g, '');
  const query = encodeURIComponent(CAPITAR_INTRODUCTION_PROMPT);
  switch (provider) {
    case 'chatgpt': return { href: `https://chatgpt.com/?q=${query}`, copyRequired: false };
    case 'perplexity': return { href: `https://www.perplexity.ai/search?q=${query}`, copyRequired: false };
    case 'claude': return { href: `https://claude.ai/new?q=${query}`, copyRequired: false };
    // Gemini does not offer a verified browser URL for prefilling the composer.
    case 'gemini': return { href: 'https://gemini.google.com/app', copyRequired: true };
    default: return undefined;
  }
}
