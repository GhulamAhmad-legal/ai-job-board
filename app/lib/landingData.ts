import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { landingPages, getLandingPage, type LandingPage } from './landingPages';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const SHOW_JOBS = 100; // newest roles listed on each landing page

export type LandingJob = {
  id: string;
  seq: number | null;
  title: string;
  company: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  company_logo_url: string | null;
  group_size: number | null;
  created_at: string | null;
};

const LIST_COLUMNS =
  'id, seq, title, company, location, salary_min, salary_max, company_logo_url, group_size, created_at';

// Applies a landing page's rule to a query. Search words come from landingPages.ts (not from
// visitors) and are wrapped in quotes so commas inside them, like "Washington, D", are safe.
export function orFilter(column: string, words: string[]): string {
  return words.map((w) => `${column}.ilike."*${w.replace(/["\\%_*]/g, '')}*"`).join(',');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilter(query: any, lp: LandingPage) {
  // Tags the job must carry (all of them). Fully remote roles are tagged "Remote" by the scraper.
  const tags = [...(lp.kind === 'remote' || lp.remote ? ['Remote'] : []), ...(lp.tags ?? [])];
  let q = query;
  if (tags.length) q = q.filter('tags', 'cs', JSON.stringify(tags));
  if (lp.kind === 'location') q = q.or(orFilter('location', lp.match));
  if (lp.kind === 'role') q = q.or(orFilter('title', lp.match));
  return q;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const base = (columns: string, options?: any) =>
  supabase.from('jobs').select(columns, options).eq('status', 'active').eq('is_primary', true);

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

export type LandingData = {
  page: LandingPage;
  count: number;
  companyCount: number;
  topCompanies: { name: string; count: number }[];
  pay: { listings: number; minMedian: number; maxMedian: number } | null;
  jobs: LandingJob[];
};

// Everything one landing page needs. Shared by generateMetadata and the page (one fetch).
export const getLandingData = cache(async (slug: string): Promise<LandingData | null> => {
  const page = getLandingPage(slug);
  if (!page) return null;

  // 1. Every matching job, light columns only, so counts and stats are exact.
  const rows: { company: string; salary_min: number | null; salary_max: number | null }[] = [];
  for (let from = 0; from < 10000; from += 1000) {
    const { data, error } = await applyFilter(base('company, salary_min, salary_max'), page)
      .order('id', { ascending: true })
      .range(from, from + 999);
    if (error || !data) break;
    rows.push(...data);
    if (data.length < 1000) break;
  }

  // 2. The newest roles, with everything the cards show.
  const { data: jobs } = await applyFilter(base(LIST_COLUMNS), page)
    .order('created_at', { ascending: false })
    .order('id', { ascending: true })
    .limit(SHOW_JOBS);

  const perCompany = new Map<string, number>();
  for (const r of rows) {
    const name = String(r.company ?? '').trim();
    if (name) perCompany.set(name, (perCompany.get(name) ?? 0) + 1);
  }
  const topCompanies = Array.from(perCompany.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8);

  // Pay line only where every listing is a US job (no currency column exists).
  let pay: LandingData['pay'] = null;
  if (page.usd) {
    const paid = rows.filter(
      (r) => typeof r.salary_min === 'number' && typeof r.salary_max === 'number' && r.salary_min > 0 && r.salary_max >= r.salary_min
    );
    if (paid.length >= 5) {
      pay = {
        listings: paid.length,
        minMedian: median(paid.map((r) => r.salary_min as number)),
        maxMedian: median(paid.map((r) => r.salary_max as number)),
      };
    }
  }

  return {
    page,
    count: rows.length,
    companyCount: perCompany.size,
    topCompanies,
    pay,
    jobs: (jobs ?? []) as LandingJob[],
  };
});

// Open-role count for every landing page (index page, sitemap, "related pages" links).
// Remembered for 10 minutes, so building or refreshing 35 pages doesn't repeat 35 count queries each.
let countsMemo: { at: number; promise: Promise<{ slug: string; count: number }[]> } | null = null;

export function getLandingCounts(): Promise<{ slug: string; count: number }[]> {
  if (countsMemo && Date.now() - countsMemo.at < 10 * 60 * 1000) return countsMemo.promise;

  // Ten at a time, so a long list of pages never fires everything at the database at once.
  const promise = (async () => {
    const out: { slug: string; count: number }[] = [];
    for (let i = 0; i < landingPages.length; i += 10) {
      const batch = landingPages.slice(i, i + 10);
      out.push(
        ...(await Promise.all(
          batch.map(async (lp) => {
            const { count } = await applyFilter(base('id', { count: 'exact', head: true }), lp);
            return { slug: lp.slug, count: (count as number | null) ?? 0 };
          })
        ))
      );
    }
    return out;
  })();
  countsMemo = { at: Date.now(), promise };
  promise.catch(() => {
    countsMemo = null;
  });
  return promise;
}