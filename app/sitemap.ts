import { getSiteUrl } from './lib/siteUrl';
import { getPosts } from './lib/blogIndex';
import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { jobPath } from './lib/jobSlug';
import { getLandingCounts } from './lib/landingData';
import { MIN_JOBS } from './lib/landingPages';

// Rebuilt at most once an hour: new scraper jobs show up without a redeploy, and crawlers
// don't trigger a full Supabase paging run on every hit.
export const revalidate = 3600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Set NEXT_PUBLIC_SITE_URL in Vercel once you have your custom domain.
const baseUrl = getSiteUrl();

type JobRow = { id: string; seq: number | null; title: string; company: string; created_at: string | null };

// Supabase returns at most 1000 rows per request, so page through them all.
async function fetchAllActiveJobs(): Promise<JobRow[]> {
  const pageSize = 1000;
  const all: JobRow[] = [];

  for (let from = 0; ; from += pageSize) {
    // Try each page up to 3 times. If it still fails, stop with an error rather than publishing a
    // sitemap that is silently missing jobs (Next keeps the last good sitemap when a refresh fails).
    let rows: JobRow[] | null = null;
    let lastError = '';
    for (let attempt = 0; attempt < 3 && !rows; attempt++) {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, seq, title, company, created_at')
        .eq('status', 'active')
        .eq('is_primary', true)
        .order('created_at', { ascending: false })
        .order('id', { ascending: true }) // stable order for pagination
        .range(from, from + pageSize - 1);

      if (!error && data) rows = data as JobRow[];
      else {
        lastError = error?.message ?? 'no data returned';
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
    if (!rows) throw new Error(`sitemap: could not read jobs (${lastError})`);

    all.push(...rows);
    if (rows.length < pageSize) break;
  }

  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await fetchAllActiveJobs();

  const jobUrls: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${baseUrl}${jobPath(job)}`,
    ...(job.created_at ? { lastModified: new Date(job.created_at) } : {}),
  }));

  // One entry per company; lastModified = its newest job.
  const newestByCompany = new Map<string, Date>();
  for (const job of jobs) {
    if (!job.company) continue;
    const d = job.created_at ? new Date(job.created_at) : new Date(0);
    const prev = newestByCompany.get(job.company);
    if (!prev || d > prev) newestByCompany.set(job.company, d);
  }

  const companyUrls: MetadataRoute.Sitemap = Array.from(
    newestByCompany.entries()
  ).map(([company, lastModified]) => ({
    url: `${baseUrl}/companies/${encodeURIComponent(company)}`,
    ...(lastModified.getTime() > 0 ? { lastModified } : {}),
  }));

  // Landing pages (/jobs/remote, /jobs/san-francisco, ...) that currently have enough openings.
  const landingCounts = (await getLandingCounts()).filter((c) => c.count >= MIN_JOBS);
  const landingUrls: MetadataRoute.Sitemap = landingCounts.map((c) => ({
    url: `${baseUrl}/jobs/${c.slug}`,
  }));

  const staticPaths = [
    ...(landingCounts.length ? ['/jobs'] : []),
    '/companies',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/blog',
  ];

  const postUrls: MetadataRoute.Sitemap = getPosts().map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: new Date(p.updated ?? p.date),
  }));

  return [
    { url: baseUrl, lastModified: new Date() },
    ...staticPaths.map((p) => ({ url: `${baseUrl}${p}` })),
    ...landingUrls,
    ...postUrls,
    ...companyUrls,
    ...jobUrls,
  ];
}