import type { Metadata } from 'next';
import { siteConfig } from '../lib/siteConfig';

// The contact page is a client component (it has a form), so its metadata lives here.
const title = `Contact | ${siteConfig.name}`;
const description = `Contact ${siteConfig.name} about listing corrections or removals, privacy requests, partnerships and feedback.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/contact' },
  openGraph: {
    title,
    description,
    url: '/contact',
    type: 'website',
    siteName: siteConfig.name,
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-default.png'] },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
