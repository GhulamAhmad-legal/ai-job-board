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
    slug: 'the-state-of-ai-hiring',
    title: 'The State of AI Hiring: Salaries, Skills, and Remote Work',
    description: 'A data-backed breakdown of 6,100+ active roles across 39 leading tech and AI companies, covering compensation benchmarks, remote availability, and in-demand skills.',
    date: '2026-10-20',
    tags: ['Data Report', 'Salaries'],
  },
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