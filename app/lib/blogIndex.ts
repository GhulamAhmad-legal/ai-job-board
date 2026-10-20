import { siteConfig } from './siteConfig';

// The list of blog posts. To add an article:
//   1. Save its text as content/blog/<slug>.md  (plain Markdown, start headings at "##")
//   2. Add an entry below with the SAME slug.
// Dates are YYYY-MM-DD. A post goes live automatically on its date (UTC), no redeploy needed;
// until then it is hidden from the blog, the sitemap and direct links.
//
// Links inside an article's text:
//   [text](post:some-slug)       -> links to another article once it is published (plain text before that)
//   [text](/companies/OpenAI)    -> a company page
//   [text](/)                    -> the job search

// Shown on every article (byline, author box and structured data).
export const AUTHOR = {
  name: 'Ghulam Ahmad',
  role: 'Software Engineer',
};

// Shows a short note at the bottom of every article. Set to false to hide it.
// Only keep it true if you really do read and approve each article before its date.
export const SHOW_AI_NOTE = true;

// A live list of current openings, pulled from the database each time the page refreshes.
export type JobWidget = {
  heading: string;
  tags?: string[]; // e.g. ['AI'] or ['AI', 'Remote'] (job must have all of them)
  titleContains?: string;
  locationContains?: string;
  descriptionContains?: string;
  salaryOnly?: boolean; // only jobs that state a salary
};

export type PostMeta = {
  slug: string;
  title: string;
  description: string; // 120-160 characters works best in Google results
  date: string; // publish date
  updated?: string; // set when you edit an article later
  tags: string[];
  related?: string[]; // slugs of related articles (only published ones are shown)
  companies?: { heading: string; names: string[] }; // company-page links shown under the article
  jobs?: JobWidget[]; // live openings shown under the article
};

export const posts: PostMeta[] = [
  {
    slug: 'how-we-collect-and-label-job-listings',
    title: `How ${siteConfig.name} Collects, Labels and Updates Job Listings`,
    description: `Where ${siteConfig.name} listings come from, how salary, remote and AI labels are decided, and what the data does and does not cover.`,
    date: '2026-10-17',
    tags: ['About the data'],
    related: [
      'ai-machine-learning-salary-ranges-from-job-listings',
      'who-is-hiring-in-ai-and-tech-open-roles-by-company',
      'remote-ai-and-tech-jobs-who-offers-them',
    ],
    jobs: [{ heading: 'Latest AI and machine learning openings', tags: ['AI'] }],
  },
  {
    slug: 'ai-machine-learning-salary-ranges-from-job-listings',
    title: 'What AI and Machine Learning Jobs Pay: Posted Salary Ranges From 39 Companies',
    description:
      'Median posted pay for machine learning, research, AI engineering, data science and forward deployed roles, from 437 listings with stated salary ranges.',
    date: '2026-10-21',
    tags: ['Salary data'],
    related: [
      'who-is-hiring-in-ai-and-tech-open-roles-by-company',
      'skills-ai-job-descriptions-ask-for',
      'remote-ai-and-tech-jobs-who-offers-them',
    ],
    companies: {
      heading: 'Employers that state pay on most of their listings',
      names: ['CoreWeave', 'Fireworks AI', 'Perplexity', 'Reddit', 'Anthropic', 'OpenAI'],
    },
    jobs: [
      {
        heading: 'Machine learning roles that state a salary',
        tags: ['AI'],
        titleContains: 'machine learning',
        salaryOnly: true,
      },
    ],
  },
  {
    slug: 'who-is-hiring-in-ai-and-tech-open-roles-by-company',
    title: 'Who Is Hiring in AI and Tech: Open Roles at 39 Companies',
    description:
      'Open roles, AI-titled roles and pay transparency at 39 AI and tech employers, from OpenAI and Anthropic to Databricks and Waymo, as of October 2026.',
    date: '2026-10-23',
    tags: ['Hiring data'],
    related: [
      'remote-ai-and-tech-jobs-who-offers-them',
      'where-ai-jobs-are-cities-with-the-most-openings',
      'ai-machine-learning-salary-ranges-from-job-listings',
    ],
    companies: {
      heading: 'Browse these employers',
      names: [
        'Databricks', 'OpenAI', 'Anthropic', 'Waymo', 'Harvey', 'CoreWeave',
        'xAI', 'Sierra', 'Scale AI', 'Wayve', 'Reddit', 'Perplexity',
      ],
    },
    jobs: [{ heading: 'Latest AI and machine learning openings', tags: ['AI'] }],
  },
  {
    slug: 'remote-ai-and-tech-jobs-who-offers-them',
    title: 'Remote AI and Tech Jobs: How Many Are Really Remote, and Who Offers Them',
    description:
      'Only about 9% of listings at 39 AI and tech companies are fully remote, and four employers offer roughly 70% of them. Here is the data.',
    date: '2026-10-26',
    tags: ['Remote work'],
    related: [
      'where-ai-jobs-are-cities-with-the-most-openings',
      'who-is-hiring-in-ai-and-tech-open-roles-by-company',
      'ai-machine-learning-salary-ranges-from-job-listings',
    ],
    companies: {
      heading: 'Employers with the most remote listings',
      names: ['ElevenLabs', 'Reddit', 'Cohere', 'Databricks', 'LangChain', 'Sierra'],
    },
    jobs: [{ heading: 'Current remote AI roles', tags: ['AI', 'Remote'] }],
  },
  {
    slug: 'where-ai-jobs-are-cities-with-the-most-openings',
    title: 'Where the AI Jobs Are: Cities With the Most AI and Machine Learning Openings',
    description:
      'Where AI and machine learning roles are located: San Francisco and Mountain View lead, followed by London, New York, Tokyo and Bengaluru.',
    date: '2026-10-28',
    tags: ['Locations'],
    related: [
      'remote-ai-and-tech-jobs-who-offers-them',
      'who-is-hiring-in-ai-and-tech-open-roles-by-company',
      'skills-ai-job-descriptions-ask-for',
    ],
    companies: {
      heading: 'Employers behind many of these roles',
      names: ['Waymo', 'Wayve', 'OpenAI', 'Anthropic', 'Scale AI'],
    },
    jobs: [
      { heading: 'Current AI roles in London', tags: ['AI'], locationContains: 'London' },
      { heading: 'Current AI roles in New York', tags: ['AI'], locationContains: 'New York' },
    ],
  },
  {
    slug: 'skills-ai-job-descriptions-ask-for',
    title: 'What AI Job Descriptions Ask For: Skills Mentioned in 797 Postings',
    description:
      'What 797 AI and machine learning job descriptions mention most: Python, LLMs, PyTorch, distributed systems and more, with caveats.',
    date: '2026-10-30',
    tags: ['Skills'],
    related: [
      'ai-machine-learning-salary-ranges-from-job-listings',
      'where-ai-jobs-are-cities-with-the-most-openings',
      'who-is-hiring-in-ai-and-tech-open-roles-by-company',
    ],
    jobs: [{ heading: 'Current AI roles that mention PyTorch', tags: ['AI'], descriptionContains: 'pytorch' }],
  },
];

const today = () => new Date().toISOString().slice(0, 10);

// Published posts only, newest first
export function getPosts(): PostMeta[] {
  const t = today();
  return posts.filter((p) => p.date <= t).sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostMeta(slug: string): PostMeta | undefined {
  const t = today();
  return posts.find((p) => p.slug === slug && p.date <= t);
}
