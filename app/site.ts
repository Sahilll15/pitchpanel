export const SITE_URL = 'https://pitchpanel.vercel.app';
export const SITE_NAME = 'PitchPanel';
export const SITE_TITLE = 'PitchPanel: startup pitch feedback from five investors';
export const SITE_DESCRIPTION =
  'Free startup pitch feedback. Paste your pitch and get scored by five investor archetypes on market, product, team and numbers, with a verdict from each.';
export const SITE_KEYWORDS = ['startup pitch feedback', 'pitch review', 'investor pitch practice', 'pitch evaluation', 'startup pitch score', 'VC pitch', 'fundraising pitch', 'elevator pitch'];

const AUTHOR = {
  '@type': 'Person',
  name: 'Sahil Chalke',
  url: 'https://sahilchalke.com',
  sameAs: ['https://github.com/Sahilll15', 'https://x.com/chalke1015'],
};

export const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: AUTHOR,
  creator: AUTHOR,
};

export function jsonLdScript(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
