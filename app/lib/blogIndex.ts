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
  titleRegex?: string; // case-insensitive pattern on the title, e.g. '\\mintern(ship)?s?\\M' (whole words)
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
    updated: '2026-10-27',
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
  // ---------------- Batch 2 ----------------
  {
    slug: 'forward-deployed-engineer-jobs-who-hires-and-what-they-ask-for',
    title: 'Forward Deployed Engineer Jobs: Who Is Hiring and What They Ask For',
    description:
      '202 forward deployed engineer listings at 17 companies: who hires, what the role asks for, where the jobs are and the median posted pay of about $217K.',
    date: '2026-10-31',
    tags: ['Role guide'],
    related: [
      'ai-machine-learning-salary-ranges-from-job-listings',
      'who-is-hiring-in-ai-and-tech-open-roles-by-company',
      'skills-ai-job-descriptions-ask-for',
    ],
    companies: {
      heading: 'Employers hiring forward deployed engineers',
      names: ['Databricks', 'OpenAI', 'Scale AI', 'Cohere', 'Anthropic'],
    },
    jobs: [{ heading: 'Current forward deployed engineer roles', titleContains: 'forward deployed' }],
  },
  {
    slug: 'entry-level-and-internship-ai-tech-jobs-who-is-hiring',
    title: 'Entry-Level and Internship Roles at AI and Tech Companies: Who Is Hiring',
    description:
      '174 internship, new-grad and early-career listings at AI and tech companies: which employers hire, what the roles look like and why so few state pay.',
    date: '2026-11-04',
    tags: ['Early career'],
    related: [
      'do-you-need-a-phd-for-ai-jobs',
      'who-is-hiring-in-ai-and-tech-open-roles-by-company',
      'ai-machine-learning-salary-ranges-from-job-listings',
    ],
    companies: {
      heading: 'Employers with the most early-career roles',
      names: ['Waymo', 'Databricks', 'Together AI', 'Figure AI', 'Figma', 'Scale AI'],
    },
    jobs: [
      { heading: 'Current internship roles', titleRegex: '\\mintern(ship)?s?\\M' },
      { heading: 'Current new-grad roles', titleRegex: '\\mnew grad(uate)?s?\\M' },
    ],
  },
  {
    slug: 'do-you-need-a-phd-for-ai-jobs',
    title: 'Do You Need a PhD for AI Jobs? What 688 Job Descriptions Say',
    description:
      'About one in five AI job descriptions mentions a PhD. We looked at 688 AI roles to see how often degrees come up and how often experience can substitute.',
    date: '2026-11-06',
    tags: ['Careers'],
    related: [
      'entry-level-and-internship-ai-tech-jobs-who-is-hiring',
      'skills-ai-job-descriptions-ask-for',
      'ai-machine-learning-salary-ranges-from-job-listings',
    ],
    jobs: [
      {
        heading: 'AI roles whose descriptions mention equivalent experience',
        tags: ['AI'],
        descriptionContains: 'or equivalent',
      },
    ],
  },
  {
    slug: 'ai-safety-alignment-and-policy-careers-who-is-hiring',
    title: 'AI Safety, Alignment and Policy Careers: Who Is Hiring and in What Roles',
    description:
      '137 safety, alignment and policy-related listings at 16 AI and tech companies. Only about one in five is research; most are engineering, policy and operations.',
    date: '2026-11-09',
    tags: ['Role guide'],
    related: [
      'who-is-hiring-in-ai-and-tech-open-roles-by-company',
      'do-you-need-a-phd-for-ai-jobs',
      'entry-level-and-internship-ai-tech-jobs-who-is-hiring',
    ],
    companies: {
      heading: 'Employers hiring for safety and policy roles',
      names: ['Anthropic', 'OpenAI', 'Cohere', 'Discord', 'Reddit'],
    },
    jobs: [
      {
        heading: 'Current alignment, interpretability and safeguards roles',
        titleRegex: '\\m(alignment|interpretability|safeguards|red team|ai safety)\\M',
      },
    ],
  },
  {
    slug: 'is-prompt-engineer-a-real-job',
    title: 'Is "Prompt Engineer" a Real Job? What Job Postings Actually Show',
    description:
      'Only one of about 6,100 listings has "prompt" in its title, yet 153 roles mention prompting in the description. Where the skill really shows up.',
    date: '2026-11-11',
    tags: ['Careers'],
    related: [
      'skills-ai-job-descriptions-ask-for',
      'forward-deployed-engineer-jobs-who-hires-and-what-they-ask-for',
      'ai-machine-learning-salary-ranges-from-job-listings',
    ],
    companies: {
      heading: 'Employers whose roles mention prompting most',
      names: ['Sierra', 'Anthropic', 'Harvey', 'OpenAI', 'Databricks'],
    },
    jobs: [
      {
        heading: 'Current AI roles that mention prompt engineering',
        tags: ['AI'],
        descriptionContains: 'prompt engineering',
      },
    ],
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
