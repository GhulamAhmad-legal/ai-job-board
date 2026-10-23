// The landing pages under /jobs/<slug>. To add one, add a row below: no other code changes.
//   kind 'remote'   -> jobs tagged "Remote" by the scraper
//   kind 'location' -> `match` words are looked for in the job's location text
//   kind 'role'     -> `match` words are looked for in the job's title
//   kind 'topic'    -> jobs carrying all of the listed `tags` (e.g. the "AI" tag)
// Extra options on any row:
//   remote: true    -> the job must ALSO be tagged Remote (e.g. "Remote Software Engineer")
//   tags: [...]     -> the job must ALSO carry these tags
//   usd: true       -> every listing there is a US job, so a median pay line can be shown
//                      (the jobs table has no currency column)
// A page with fewer than MIN_JOBS open roles is hidden from Google and from the sitemap
// automatically, so it is safe to list places and roles that sometimes have no openings.
// Words are matched anywhere in the text (case-insensitive), so avoid words that sit inside
// other words, such as "India" (it also matches "Indiana").

export type LandingKind = 'remote' | 'location' | 'role' | 'topic';

export type LandingPage = {
  slug: string;
  kind: LandingKind;
  name: string;
  match: string[];
  usd?: boolean;
  remote?: boolean;
  tags?: string[];
};

export const MIN_JOBS = 5;

export const landingPages: LandingPage[] = [
  // ---------- Broad ----------
  { slug: 'remote', kind: 'remote', name: 'Remote', match: [] },
  { slug: 'ai-jobs', kind: 'topic', name: 'AI', match: [], tags: ['AI'] },
  { slug: 'remote-ai-jobs', kind: 'topic', name: 'Remote AI', match: [], tags: ['AI', 'Remote'] },

  // ---------- Big hiring cities ----------
  { slug: 'san-francisco', kind: 'location', name: 'San Francisco', match: ['San Francisco', 'SF Office', 'Bay Area'], usd: true },
  { slug: 'silicon-valley', kind: 'location', name: 'Silicon Valley', match: ['Mountain View', 'Sunnyvale', 'Palo Alto', 'San Jose', 'Santa Clara', 'Menlo Park', 'Foster City', 'San Mateo', 'Cupertino'], usd: true },
  { slug: 'new-york', kind: 'location', name: 'New York', match: ['New York', 'NYC'], usd: true },
  { slug: 'seattle', kind: 'location', name: 'Seattle', match: ['Seattle', 'Bellevue'], usd: true },
  { slug: 'london', kind: 'location', name: 'London', match: ['London'] },

  // ---------- Popular roles ----------
  { slug: 'machine-learning-engineer', kind: 'role', name: 'Machine Learning Engineer', match: ['machine learning engineer', 'ml engineer'] },
  { slug: 'software-engineer', kind: 'role', name: 'Software Engineer', match: ['software engineer'] },
  { slug: 'research-scientist', kind: 'role', name: 'Research Scientist', match: ['research scientist', 'research engineer'] },
  { slug: 'data-scientist', kind: 'role', name: 'Data Scientist', match: ['data scientist'] },
  { slug: 'forward-deployed-engineer', kind: 'role', name: 'Forward Deployed Engineer', match: ['forward deployed'] },

  // ---------- Remote + role ----------
  { slug: 'remote-machine-learning-engineer', kind: 'role', name: 'Remote Machine Learning Engineer', match: ['machine learning engineer', 'ml engineer'], remote: true },
  { slug: 'remote-software-engineer', kind: 'role', name: 'Remote Software Engineer', match: ['software engineer'], remote: true },

  // To grow later, add rows here after Search Console shows these are indexed. Ideas that fit
  // the data: more cities (Mountain View, Toronto, Bengaluru, Singapore, Tokyo, Paris, Munich),
  // roles (ai-engineer, product-manager, solutions-architect) and countries.
];

export function getLandingPage(slug: string): LandingPage | undefined {
  return landingPages.find((p) => p.slug === slug);
}

// Page heading (also used for the <title>)
export function landingHeading(lp: LandingPage): string {
  if (lp.kind === 'remote') return 'Remote AI and Tech Jobs';
  if (lp.kind === 'location') return `AI and Tech Jobs in ${lp.name}`;
  if (lp.kind === 'topic') return `${lp.name} Jobs`;
  return `${lp.name} Jobs in AI and Tech`;
}

// Plain-words description that fits "123 <noun>" and "Browse 123 <noun>"
export function landingNoun(lp: LandingPage): string {
  if (lp.kind === 'remote') return 'remote AI and tech jobs';
  if (lp.kind === 'location') return `AI and tech jobs in ${lp.name}`;
  if (lp.kind === 'topic') return `${lp.name} jobs`;
  return `${lp.name.toLowerCase()} jobs`;
}

// ['A'] -> "A", ['A','B'] -> "A and B", ['A','B','C'] -> "A, B and C"
export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}