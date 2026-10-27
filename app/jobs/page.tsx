import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '../lib/siteConfig';
import { getSiteUrl } from '../lib/siteUrl';
import { getLandingPage, MIN_JOBS } from '../lib/landingPages';
import { getLandingCounts, getActiveJobCount } from '../lib/landingData';
import JobsBrowser, { type BrowseGroup } from './JobsBrowser';

export const revalidate = 3600;

const title = `Browse AI and Tech Jobs by Location and Role | ${siteConfig.name}`;
const description =
  'Browse open AI, machine learning and engineering jobs by city, by role, or fully remote, with pay and direct apply links.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/jobs' },
  openGraph: {
    title,
    description,
    url: '/jobs',
    type: 'website',
    siteName: siteConfig.name,
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-default.png'] },
};

export default async function JobsIndex() {
  const [counts, total] = await Promise.all([getLandingCounts(), getActiveJobCount()]);

  const live = counts
    .filter((c) => c.count >= MIN_JOBS)
    .map((c) => ({ ...getLandingPage(c.slug)!, count: c.count }));

  const byCount = <T extends { count: number }>(rows: T[]) => [...rows].sort((a, b) => b.count - a.count);

  const popular = byCount(live.filter((p) => p.kind === 'remote' || p.kind === 'topic')).map((p) => ({
    slug: p.slug,
    label: p.kind === 'remote' ? 'Remote AI and tech jobs' : `${p.name} jobs`,
    count: p.count,
  }));
  const places = byCount(live.filter((p) => p.kind === 'location')).map((p) => ({
    slug: p.slug,
    label: `Jobs in ${p.name}`,
    count: p.count,
  }));
  const roles = byCount(live.filter((p) => p.kind === 'role')).map((p) => ({
    slug: p.slug,
    label: `${p.name} jobs`,
    count: p.count,
  }));

  const allGroups: BrowseGroup[] = [
    { id: 'popular', title: 'Popular searches', blurb: 'Start with the biggest groups of open roles.', icon: 'spark', featured: true, items: popular },
    { id: 'location', title: 'Jobs by location', blurb: 'Find roles in your city or hub. A role listed in several places is counted in each, so these numbers overlap.', icon: 'pin', items: places },
    { id: 'role', title: 'Jobs by role', blurb: 'Jump straight to the kind of work you do.', icon: 'briefcase', items: roles },
  ];
  const groups = allGroups.filter((g) => g.items.length > 0);

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${getSiteUrl()}/` },
      { '@type': 'ListItem', position: 2, name: 'Jobs', item: `${getSiteUrl()}/jobs` },
    ],
  };

  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans pb-24 text-[#181818]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }}
      />

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-[#F5F6F8]">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-indigo-200/40 blur-3xl" aria-hidden="true" />
        <div className="absolute -top-16 -left-24 w-[320px] h-[320px] rounded-full bg-blue-200/30 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-[1152px] mx-auto px-4 pt-14 pb-16 text-center md:text-left">
          <p className="inline-block text-[12px] font-bold uppercase tracking-wide text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-4">
            Job search shortcuts
          </p>
          <h1 className="text-[36px] md:text-[48px] font-black text-gray-900 tracking-tight leading-tight">
            Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI and tech jobs</span>
          </h1>
          <p className="mt-4 text-[17px] md:text-[18px] text-gray-600 font-medium max-w-2xl mx-auto md:mx-0">
            Open roles at AI and technology companies, grouped by city, role and remote work. Every listing links to
            the employer’s own application page.
          </p>

          <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3 text-[14px] font-bold">
            {total > 0 && (
              <span className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-full shadow-sm">
                {total.toLocaleString()} open roles
              </span>
            )}
            <span className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-full shadow-sm">
              {places.length} {places.length === 1 ? 'location' : 'locations'}
            </span>
            <span className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-full shadow-sm">
              {roles.length} role {roles.length === 1 ? 'page' : 'pages'}
            </span>
          </div>
        </div>
      </section>

      {/* ---------- Filter + groups ---------- */}
      <JobsBrowser groups={groups} />

      {/* ---------- Bottom call to action ---------- */}
      <section className="max-w-[1152px] mx-auto px-4 mt-16">
        <div className="relative overflow-hidden rounded-3xl bg-[#00060C] px-8 py-10 md:px-12 md:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" aria-hidden="true" />
          <div>
            <h2 className="text-[24px] md:text-[28px] font-extrabold text-white tracking-tight">
              Looking for something else?
            </h2>
            <p className="mt-2 text-[16px] text-gray-400 max-w-xl">
              Search every open role by keyword and location, or browse the companies that are hiring.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] px-6 py-3 rounded-xl transition-colors"
            >
              Search all roles
            </Link>
            <Link
              href="/companies"
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-[15px] px-6 py-3 rounded-xl border border-white/20 transition-colors"
            >
              Browse companies
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
