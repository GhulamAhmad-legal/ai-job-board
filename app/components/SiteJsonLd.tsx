import { siteConfig } from '../lib/siteConfig';
import { getSiteUrl } from '../lib/siteUrl';
import { AUTHOR } from '../lib/blogIndex';
import { authorSameAs } from '../lib/authorProfile';

// Tells search engines and AI assistants who the site is: one organisation and one website, named
// the same way everywhere. Add <SiteJsonLd /> once in app/layout.tsx.
export default function SiteJsonLd() {
  const url = getSiteUrl();
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteConfig.name,
      url,
      description: siteConfig.tagline,
      founder: { '@type': 'Person', name: AUTHOR.name, jobTitle: AUTHOR.role, sameAs: authorSameAs },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.name,
      url,
    },
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
