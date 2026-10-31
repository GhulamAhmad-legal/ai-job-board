import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { siteConfig } from '../lib/siteConfig';

const title = `Contact | ${siteConfig.name}`;
const description =
  'Send a question, a correction or removal request, or feedback about the job board.';

// Gives this page its own title, description, canonical address and share preview
// (without this, social shares and some search snippets show the homepage text).
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/contact' },
  openGraph: {
    title,
    description,
    url: '/contact',
    siteName: siteConfig.name,
    type: 'website',
    images: ['/og-default.png'],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/og-default.png'] },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
