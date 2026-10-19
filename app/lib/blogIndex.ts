// The list of blog posts. To add an article:
//   1. Save its text as content/blog/<slug>.md  (plain Markdown, start headings at "##")
//   2. Add an entry below with the SAME slug.
// Dates are written as YYYY-MM-DD.

import { siteConfig } from './siteConfig';

export type PostMeta = {
  slug: string;
  title: string;
  description: string; // 120-160 characters works best in Google results
  date: string; // published
  updated?: string; // last updated, if you edit the article later
  tags: string[];
};

export const posts: PostMeta[] = [
  {
    slug: 'how-we-collect-and-label-job-listings',
    title: `How ${siteConfig.name} Collects, Labels and Updates Job Listings`,
    description:
      `Where ${siteConfig.name} listings come from, how salary, remote and AI labels are decided, and what the data does and does not cover.`,
    date: '2026-10-17',
    tags: ['About the data'],
  },
];

// Newest first
export function getPosts(): PostMeta[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostMeta(slug: string): PostMeta | undefined {
  return posts.find((p) => p.slug === slug);
}
