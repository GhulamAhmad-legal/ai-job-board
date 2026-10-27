import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '../../lib/siteConfig';
import { getSiteUrl } from '../../lib/siteUrl';
import { jobPath } from '../../lib/jobSlug';
import {
  landingPages,
  getLandingPage,
  landingHeading,
  landingNoun,
  joinList,
  landingCoverage,
  MIN_JOBS,
} from '../../lib/landingPages';
import { getLandingData, getLandingCounts, SHOW_JOBS } from '../../lib/landingData';
import { locationWithMore } from '../../lib/locationLabel';

export const revalidate = 3600;
export const dynamicParams = false; // only the slugs in landingPages.ts exist; anything else is a 404

const baseUrl = getSiteUrl();

export function generateStaticParams() {
  return landingPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lp = getLandingPage(slug);
  if (!lp) return { title: `Not Found | ${siteConfig.name}`, robots: { index: false } };

  const data = await getLandingData(slug);
  const count = data?.count ?? 0;
  const top = (data?.topCompanies ?? []).slice(0, 3).map((c) => c.name);

  const title = `${landingHeading(lp)} | ${siteConfig.name}`;
  const description = (
    `Browse ${count.toLocaleString()} ${landingNoun(lp)}` +
    (top.length ? ` at ${joinList(top)} and more.` : '.') +
    ' See pay, location and apply on the employer’s site.'
  ).slice(0, 158);
  const path = `/jobs/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    // Pages with almost nothing on them stay out of search results until they fill up.
    ...(count < MIN_JOBS ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title, description, url: path, type: 'website', siteName: siteConfig.name },
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getLandingData(slug);
  if (!data) notFound();

  const { page, count, companyCount, topCompanies, pay, stats, jobs } = data;
  const heading = landingHeading(page);
  const noun = landingNoun(page);

  // Links to the other landing pages that have enough openings.
  const counts = await getLandingCounts();
  const live = counts
    .filter((c) => c.slug !== slug && c.count >= MIN_JOBS)
    .map((c) => ({ ...getLandingPage(c.slug)!, count: c.count }))
    .sort((a, b) => b.count - a.count);
  const sameKind = live.filter((p) => p.kind === page.kind).slice(0, 12);
  const otherKinds = live.filter((p) => p.kind !== page.kind).slice(0, 12);

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Jobs', item: `${baseUrl}/jobs` },
      { '@type': 'ListItem', position: 3, name: heading, item: `${baseUrl}/jobs/${slug}` },
    ],
  };

  const lead = topCompanies.slice(0, 3);

  // Facts that make each page different from the others, all computed from the listings.
  const withCount = (rows: { name: string; count: number }[]) =>
    joinList(rows.map((r) => `${r.name} (${r.count.toLocaleString()})`));
  const findings: string[] = [];
  if (page.kind !== 'role' && stats.topRoles.length > 0) {
    findings.push(`The most common role titles are ${withCount(stats.topRoles)}.`);
  }
  if (page.kind !== 'location' && stats.topPlaces.length > 0) {
    findings.push(`The cities with the most on-site and hybrid openings are ${withCount(stats.topPlaces)}.`);
  }
  const isRemotePage = page.kind === 'remote' || !!page.remote;
  const isAiPage = !!page.tags?.includes('AI');
  const tiles = [
    { label: 'Open roles', value: count.toLocaleString() },
    { label: 'Employers', value: companyCount.toLocaleString() },
    ...(isRemotePage ? [] : [{ label: 'Fully remote', value: `${stats.remotePct}%` }]),
    { label: 'State pay', value: `${stats.payPct}%` },
    ...(isAiPage ? [] : [{ label: 'AI-titled', value: `${stats.aiPct}%` }]),
  ];

  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }}
      />

      <div className="max-w-[800px] mx-auto px-4 pt-6">
        <Link
          href="/jobs"
          className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-bold text-[14px]"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          All job categories
        </Link>
      </div>

      <div className="max-w-[800px] mx-auto px-4 mt-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-10 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
          <h1 className="text-[30px] md:text-[36px] font-extrabold text-gray-900 leading-tight tracking-tight">
            {heading}
          </h1>

          {count > 0 ? (
            <div className="mt-4 space-y-3 text-[15px] text-gray-600 leading-relaxed">
              <p>
                There {count === 1 ? 'is' : 'are'} {count.toLocaleString()} open {noun} across{' '}
                {companyCount.toLocaleString()} {companyCount === 1 ? 'company' : 'companies'} right now.
                {lead.length > 0 && (
                  <>
                    {' '}
                    The most listings come from{' '}
                    {lead.map((c, i) => (
                      <span key={c.name}>
                        {i > 0 && (i === lead.length - 1 ? ' and ' : ', ')}
                        <Link
                          href={`/companies/${encodeURIComponent(c.name)}`}
                          className="font-bold text-blue-600 hover:text-blue-700"
                        >
                          {c.name}
                        </Link>{' '}
                        ({c.count.toLocaleString()})
                      </span>
                    ))}
                    .
                  </>
                )}
              </p>
              {pay && (
                <p>
                  {pay.listings.toLocaleString()} of these listings state pay. The median posted range is{' '}
                  <strong className="text-gray-900">
                    ${pay.minMedian}K – ${pay.maxMedian}K
                  </strong>{' '}
                  per year.
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {tiles.map((t) => (
                  <div key={t.label} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                    <div className="text-[22px] leading-tight font-black text-gray-900">{t.value}</div>
                    <div className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{t.label}</div>
                  </div>
                ))}
              </div>
              {findings.length > 0 && <p>{findings.join(' ')}</p>}
              <p className="text-[14px] text-gray-500">
                {landingCoverage(page)} Listings come from employers’ own career pages. Apply on the employer’s site.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-[15px] text-gray-600">
              There are no open {noun} right now.{' '}
              <Link href="/" className="font-bold text-blue-600 hover:text-blue-700">
                Browse all jobs
              </Link>
              .
            </p>
          )}

          {topCompanies.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {topCompanies.map((c) => (
                <Link
                  key={c.name}
                  href={`/companies/${encodeURIComponent(c.name)}`}
                  className="text-[13px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full border border-indigo-100 transition-colors"
                >
                  {c.name} · {c.count.toLocaleString()}
                </Link>
              ))}
            </div>
          )}
        </div>

        {jobs.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-[15px] font-extrabold text-gray-900">
                {count > jobs.length
                  ? `Newest ${jobs.length} of ${count.toLocaleString()} open roles`
                  : `${count.toLocaleString()} open ${count === 1 ? 'role' : 'roles'}`}
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {jobs.map((job) => {
                // Only show a salary when real values exist (stored in thousands). Never a default.
                const hasSalary =
                  typeof job.salary_min === 'number' &&
                  typeof job.salary_max === 'number' &&
                  job.salary_min > 0 &&
                  job.salary_max >= job.salary_min;
                const locationLabel = locationWithMore(job.location, (job.group_size ?? 1) - 1);

                return (
                  <Link
                    href={jobPath(job)}
                    key={job.id}
                    className="block group hover:bg-blue-50/30 transition-colors"
                  >
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-[17px] font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors mb-1.5">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-[14px]">
                          <span className="text-gray-900 font-bold">{job.company}</span>
                          {locationLabel && <span className="text-gray-500 font-medium">{locationLabel}</span>}
                          {hasSalary && (
                            <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100">
                              ${job.salary_min}K
                              {job.salary_max !== job.salary_min ? ` – $${job.salary_max}K` : ''}{' '}
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

            {count > SHOW_JOBS && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-[14px] text-gray-600">
                Showing the newest {SHOW_JOBS}.{' '}
                <Link href="/" className="font-bold text-blue-600 hover:text-blue-700">
                  Search all roles
                </Link>{' '}
                to narrow by title, location or remote.
              </div>
            )}
          </div>
        )}

        {(sameKind.length > 0 || otherKinds.length > 0) && (
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-[15px] font-extrabold text-gray-900 mb-4">More job searches</h2>
            <div className="flex flex-wrap gap-2">
              {[...sameKind, ...otherKinds].map((p) => (
                <Link
                  key={p.slug}
                  href={`/jobs/${p.slug}`}
                  className="text-[13px] font-bold text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
                >
                  {p.kind === 'location' ? `Jobs in ${p.name}` : p.kind === 'remote' ? 'Remote jobs' : `${p.name} jobs`}{' '}
                  <span className="font-medium text-gray-400">{p.count.toLocaleString()}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
