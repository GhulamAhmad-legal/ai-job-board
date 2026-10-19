import { getSiteUrl } from './lib/siteUrl';
import { getPosts } from './lib/blogIndex';
import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// Build the sitemap fresh on every request, so new scraper jobs appear without a redeploy.
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Set NEXT_PUBLIC_SITE_URL in Vercel once you have your custom domain.
const baseUrl = getSiteUrl();

type JobRow = { id: string; company: string; created_at: string | null };

// Supabase returns at most 1000 rows per request, so page through them all.
async function fetchAllActiveJobs(): Promise<JobRow[]> {
  const pageSize = 1000;
  const all: JobRow[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, company, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .order('id', { ascending: true }) // stable order for pagination
      .range(from, from + pageSize - 1);

    if (error || !data) break;
    all.push(...(data as JobRow[]));
    if (data.length < pageSize) break;
  }

  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await fetchAllActiveJobs();

  const jobUrls: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${baseUrl}/job/${job.id}`,
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

  const staticPaths = [
    '/companies',
    '/post-job',
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
    ...postUrls,
    ...companyUrls,
    ...jobUrls,
  ];
}
