import { siteConfig } from '../../lib/siteConfig';
import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCompanyMeta } from '../../lib/companiesData';
import { jobPath } from '../../lib/jobSlug';
import { locationWithMore } from '../../lib/locationLabel';
import { getSiteUrl } from '../../lib/siteUrl';
import { fitTitle } from '../../lib/titleFit';
import { joinList } from '../../lib/landingPages';
import { summarizeListings } from '../../lib/listingStats';

export const revalidate = 3600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type JobRow = {
  id: string;
  seq: number | null;
  title: string;
  company: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  company_logo_url: string | null;
  group_size: number | null;
  tags: unknown;
};

const SHOW_JOBS = 100; // newest roles listed on the page (the total is still shown)

// Cuts text at a whole word and adds an ellipsis.
const clip = (s: string, n: number) =>
  s.length <= n ? s : `${s.slice(0, Math.max(s.lastIndexOf(' ', n - 1), 0) || n - 1)}…`;

// Safely read the curated profile (industry, description, domain) for a company.
function readMeta(name: string) {
  let meta: any;
  try {
    meta = typeof getCompanyMeta === 'function' ? getCompanyMeta(name) : undefined;
  } catch (e) {
    console.error('getCompanyMeta error:', e);
  }
  return {
    name: meta?.name || name,
    domain: meta?.domain || '',
    industry: meta?.industry || 'Technology',
    description: meta?.description || `${name} has open roles listed on ${siteConfig.name}.`,
  };
}

// Fetch every active job for this company (pages through results so nothing is cut off).
async function fetchCompanyJobs(name: string): Promise<JobRow[]> {
  // Escape % and _ so a company name can't act as a wildcard in ilike.
  const safeName = name.replace(/[\\%_]/g, '\\$&');
  const pageSize = 1000;
  const all: JobRow[] = [];

  for (let from = 0; from < 10000; from += pageSize) {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, seq, title, company, location, salary_min, salary_max, company_logo_url, group_size, tags')
      .ilike('company', safeName)
      .eq('status', 'active')
      .eq('is_primary', true)
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error || !data) break;
    all.push(...(data as JobRow[]));
    if (data.length < pageSize) break;
  }
  return all;
}

// One query shared by generateMetadata and the page.
const getCompanyJobs = cache((name: string) => fetchCompanyJobs(name));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const found = await getCompanyJobs(decodedName);
  if (found.length === 0) {
    return { title: `Company not found | ${siteConfig.name}`, robots: { index: false } };
  }
  // Always use the company's real spelling, so /companies/databricks and /companies/Databricks
  // can never become two separate pages in search results.
  const canonicalName = found[0].company;
  const meta = readMeta(canonicalName);

  const title = fitTitle([
    `${canonicalName} Careers and Open Roles | ${siteConfig.name}`,
    `${canonicalName} Careers and Open Roles`,
    `${canonicalName} Careers | ${siteConfig.name}`,
    `${canonicalName} Careers`,
  ]);
  const foundSummary = summarizeListings(found);
  const lead =
    foundSummary.topTitles.length > 0
      ? `${found.length.toLocaleString()} open ${canonicalName} roles, including ${joinList(foundSummary.topTitles.slice(0, 3).map((t) => t.name))}.`
      : `${found.length.toLocaleString()} open ${canonicalName} ${found.length === 1 ? 'role' : 'roles'}.`;
  const description = clip(`${lead} ${meta.description}`, 158);
  const path = `/companies/${encodeURIComponent(canonicalName)}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: 'website', siteName: siteConfig.name },
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const jobs = await getCompanyJobs(decodedName);
  if (jobs.length === 0) notFound();

  const companyName = jobs[0].company;
  // Wrong capitalisation in the address? Send people (and Google) to the one real address.
  if (companyName !== decodedName) permanentRedirect(`/companies/${encodeURIComponent(companyName)}`);
  const meta = readMeta(companyName);
  const hasRealDomain = !!meta.domain && meta.domain !== 'unknown.com';
  const logoUrl = hasRealDomain ? `https://unavatar.io/${meta.domain}` : jobs[0].company_logo_url || '';

  // Facts about this employer's listings, all computed from them.
  const summary = summarizeListings(jobs);
  const withCount = (rows: { name: string; count: number }[]) =>
    joinList(rows.map((r) => `${r.name} (${r.count.toLocaleString()})`));
  const findings: string[] = [];
  if (summary.topTitles.length > 0) {
    findings.push(`The most common role titles are ${withCount(summary.topTitles)}.`);
  }
  if (summary.topPlaces.length > 0) {
    findings.push(`Most on-site and hybrid openings are in ${withCount(summary.topPlaces)}.`);
  }
  if (summary.remotePct >= 10) {
    findings.push(`${summary.remotePct}% of the roles are fully remote.`);
  }
  findings.push(
    summary.payPct > 0
      ? `${summary.payPct}% of the listings state a pay range${
          summary.usPay
            ? `, and the median posted range for US roles is $${summary.usPay.minMedian}K – $${summary.usPay.maxMedian}K per year (from ${summary.usPay.listings.toLocaleString()} listings)`
            : ''
        }.`
      : 'None of the listings state a pay range.'
  );
  const tiles = [
    { label: 'Open roles', value: jobs.length.toLocaleString() },
    { label: 'Fully remote', value: `${summary.remotePct}%` },
    { label: 'State pay', value: `${summary.payPct}%` },
    ...(summary.aiPct > 0 ? [{ label: 'AI-titled', value: `${summary.aiPct}%` }] : []),
    ...(summary.usPay ? [{ label: 'Median US pay', value: `$${summary.usPay.minMedian}K–$${summary.usPay.maxMedian}K` }] : []),
  ];

  const baseUrl = getSiteUrl();
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Companies', item: `${baseUrl}/companies` },
      { '@type': 'ListItem', position: 3, name: companyName, item: `${baseUrl}/companies/${encodeURIComponent(companyName)}` },
    ],
  };

  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }}
      />
      <div className="max-w-[800px] mx-auto px-4 pt-6">
        <Link
          href="/companies"
          className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-bold text-[14px]"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          All Companies
        </Link>
      </div>

      <div className="max-w-[800px] mx-auto px-4 mt-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-10 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>

          <div className="flex items-start gap-6">
            <div className="w-[80px] h-[80px] border border-gray-200 rounded-2xl flex items-center justify-center bg-white shadow-sm overflow-hidden text-gray-900 font-black text-[24px] shrink-0">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={`${companyName} logo`} className="w-full h-full object-contain p-2" />
              ) : (
                companyName.slice(0, 2).toUpperCase()
              )}
            </div>

            <div>
              <h1 className="text-[32px] font-extrabold text-gray-900 leading-tight tracking-tight">
                {companyName} Careers
              </h1>
              <p className="text-[14px] font-bold text-indigo-700 mt-1">{meta.industry}</p>
              <p className="text-[15px] text-gray-600 leading-relaxed mt-3">{meta.description}</p>
              <p className="text-[14px] text-gray-500 font-medium mt-4">
                Currently hiring for {jobs.length.toLocaleString()} {jobs.length === 1 ? 'position' : 'positions'}
              </p>
            </div>
          </div>
        </div>

        {jobs.length >= 3 && (
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 mb-6">
            <h2 className="text-[18px] font-extrabold text-gray-900 mb-4">
              Hiring at {companyName} at a glance
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {tiles.map((t) => (
                <div key={t.label} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                  <div className="text-[20px] leading-tight font-black text-gray-900">{t.value}</div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{t.label}</div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[15px] text-gray-600 leading-relaxed">{findings.join(' ')}</p>
            <p className="mt-3 text-[13px] text-gray-400">
              Based on the {jobs.length.toLocaleString()} open roles listed below, taken from {companyName}’s own career
              page. Apply on the employer’s site.
            </p>
          </section>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-[15px] font-extrabold text-gray-900">
              {jobs.length > SHOW_JOBS
                ? `Newest ${SHOW_JOBS} of ${jobs.length.toLocaleString()} open positions at ${companyName}`
                : `Open Positions at ${companyName}`}
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {jobs.slice(0, SHOW_JOBS).map((job) => {
              // Only show a salary when real values exist (stored in thousands). Never a default.
              const hasSalary =
                typeof job.salary_min === 'number' &&
                typeof job.salary_max === 'number' &&
                job.salary_min > 0 &&
                job.salary_max >= job.salary_min;
              const locationLabel = locationWithMore(job.location, (job.group_size ?? 1) - 1);

              return (
                <Link href={jobPath(job)} key={job.id} className="block group hover:bg-blue-50/30 transition-colors">
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-[17px] font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors mb-1.5">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-[14px]">
                        {locationLabel && <span className="text-gray-500 font-medium">{locationLabel}</span>}
                        {hasSalary && (
                          <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100">
                            ${job.salary_min}K{job.salary_max !== job.salary_min ? ` – $${job.salary_max}K` : ''}{' '}
                            <span className="font-medium opacity-80">/yr</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-blue-600 font-bold text-[14px] group-hover:translate-x-1 transition-transform">
                      View Job →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
