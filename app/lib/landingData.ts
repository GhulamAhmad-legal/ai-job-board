import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { landingPages, getLandingPage, type LandingPage } from './landingPages';
import { cityOf } from './locationLabel';

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

export type LandingStats = {
  remotePct: number; // % of these roles tagged fully remote
  aiPct: number; // % labelled AI (by title)
  payPct: number; // % that state a pay range
  topRoles: { name: string; count: number }[]; // most common titles, seniority removed
  topPlaces: { name: string; count: number }[]; // cities with the most roles
};

export type LandingData = {
  page: LandingPage;
  count: number;
  companyCount: number;
  topCompanies: { name: string; count: number }[];
  pay: { listings: number; minMedian: number; maxMedian: number } | null;
  stats: LandingStats;
  jobs: LandingJob[];
};

// "Senior Software Engineer, Backend (Remote)" -> "Software Engineer"
const SENIORITY = /\b(senior|sr\.?|staff|principal|junior|jr\.?|lead|associate|distinguished|entry[- ]level|early career|new grad|ii|iii|iv)\b/gi;
export function roleFamily(title: string | null | undefined): string {
  const head = String(title ?? '').split(/\s[-–—]\s|[,(|:]/)[0];
  return head.replace(SENIORITY, ' ').replace(/\s+/g, ' ').trim();
}

// Counts values and returns the `limit` most common ones that occur at least `min` times.
function topCounts(values: (string | null)[], limit = 3, min = 2): { name: string; count: number }[] {
  const counts = new Map<string, { name: string; count: number }>();
  for (const v of values) {
    if (!v) continue;
    const key = v.toLowerCase();
    const row = counts.get(key);
    if (row) row.count++;
    else counts.set(key, { name: v, count: 1 });
  }
  return Array.from(counts.values())
    .filter((r) => r.count >= min)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

// Everything one landing page needs. Shared by generateMetadata and the page (one fetch).
export const getLandingData = cache(async (slug: string): Promise<LandingData | null> => {
  const page = getLandingPage(slug);
  if (!page) return null;

  // 1. Every matching job, light columns only, so counts and stats are exact.
  const rows: {
    company: string;
    title: string | null;
    location: string | null;
    tags: unknown;
    salary_min: number | null;
    salary_max: number | null;
  }[] = [];
  for (let from = 0; from < 10000; from += 1000) {
    const { data, error } = await applyFilter(base('company, title, location, tags, salary_min, salary_max'), page)
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

  // Facts about this group of roles (all computed from the listings, none written by hand).
  const total = Math.max(rows.length, 1);
  const hasTag = (r: { tags: unknown }, tag: string) => Array.isArray(r.tags) && (r.tags as unknown[]).includes(tag);
  const statesPay = (r: { salary_min: number | null; salary_max: number | null }) =>
    typeof r.salary_min === 'number' && typeof r.salary_max === 'number' && r.salary_min > 0 && r.salary_max >= r.salary_min;
  const stats: LandingStats = {
    remotePct: Math.round((rows.filter((r) => hasTag(r, 'Remote')).length / total) * 100),
    aiPct: Math.round((rows.filter((r) => hasTag(r, 'AI')).length / total) * 100),
    payPct: Math.round((rows.filter(statesPay).length / total) * 100),
    topRoles: topCounts(rows.map((r) => roleFamily(r.title) || null)),
    topPlaces: topCounts(rows.map((r) => cityOf(r.location))),
  };

  return {
    page,
    count: rows.length,
    companyCount: perCompany.size,
    topCompanies,
    pay,
    stats,
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

// Total open roles on the site (shown on the /jobs page). Remembered for 10 minutes.
let totalMemo: { at: number; promise: Promise<number> } | null = null;

export function getActiveJobCount(): Promise<number> {
  if (totalMemo && Date.now() - totalMemo.at < 10 * 60 * 1000) return totalMemo.promise;
  const promise = (async () => {
    const { count } = await base('id', { count: 'exact', head: true });
    return (count as number | null) ?? 0;
  })();
  totalMemo = { at: Date.now(), promise };
  promise.catch(() => {
    totalMemo = null;
  });
  return promise;
}