import type { Metadata } from 'next';
import { siteConfig } from '../lib/siteConfig';

// Keeps the unfinished page out of Google until it launches. Delete this file (or remove the
// `robots` line) when posting goes live.
export const metadata: Metadata = {
  title: `Post a Job | ${siteConfig.name}`,
  robots: { index: false, follow: false },
};

export default function PostJobLayout({ children }: { children: React.ReactNode }) {
  return children;
}
