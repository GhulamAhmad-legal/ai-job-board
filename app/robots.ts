import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    // Don't forget to update this URL once you buy your real domain!
    sitemap: 'http://localhost:3000/sitemap.xml', 
  };
}