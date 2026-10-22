import { getSiteUrl } from './lib/siteUrl';
import { MetadataRoute } from 'next';

const baseUrl = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `https://www.coretechroles.com/sitemap.xml`,
  };
}