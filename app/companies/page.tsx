import { siteConfig } from '../lib/siteConfig';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyMeta, curatedCompanies } from '../lib/companiesData';
import { getSiteUrl } from '../lib/siteUrl';
import { joinList } from '../lib/landingPages';
import CompaniesBrowser, { type CompanyCard } from './CompaniesBrowser';

// Rebuild at most once an hour (fast for visitors and crawlers).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Companies Hiring in AI and Tech | ${siteConfig.name}`,
  description:
    `Browse the AI and tech companies with open roles on ${siteConfig.name}, including Anthropic, OpenAI, Databricks, Scale AI, Cohere and Perplexity.`,
  alternates: { canonical: '/companies' },
  openGraph: {
    title: `Companies Hiring in AI and Tech | ${siteConfig.name}`,
    description:
      `Browse the AI and tech companies with open roles on ${siteConfig.name}, including Anthropic, OpenAI, Databricks, Scale AI, Cohere and Perplexity.`,
    url: '/companies',
    siteName: siteConfig.name,
    type: 'website',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-default.png'] },
};

// Groups companies into a few broad types for the filter chips, from the industry text.
const CATEGORIES = ['AI labs & models', 'AI infrastructure & data', 'Robotics & autonomy', 'AI products & software'];
function categoryOf(industry: string): string {
  if (/robot|autonom|driving|humanoid/i.test(industry)) return 'Robotics & autonomy';
  if (/cloud|inference|hardware|compute|chips|vector|database|data|infrastructure|hosting|tooling|framework|serverless/i.test(industry)) {
    return 'AI infrastructure & data';
  }
  if (/llm|frontier|general intelligence|safety|multimodal|foundation|generative/i.test(industry)) return 'AI labs & models';
  return 'AI products & software';
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Page through ALL active jobs (only company + logo columns) so counts are exact,
// no matter how many jobs there are.
async function fetchActiveCompanyRows(): Promise<{ company: string; logo: string }[]> {
  const pageSize = 1000;
  const rows: { company: string; logo: string }[] = [];

  for (let from = 0; from < 100000; from += pageSize) {
    const { data, error } = await supabase
      .from('jobs')
      .select('company, company_logo_url')
      .eq('status', 'active')
      .eq('is_primary', true)
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error || !data) {
      if (error) console.error('Supabase returned an error:', error);
      break;
    }
    for (const row of data) {
      if (row && typeof row.company === 'string' && row.company.trim()) {
        rows.push({ company: row.company.trim(), logo: row.company_logo_url || '' });
      }
    }
    if (data.length < pageSize) break;
  }

  return rows;
}

export default async function CompaniesIndex() {
  const countMap = new Map<string, { count: number; logo: string }>();

  try {
    if (supabaseUrl && supabaseKey) {
      const rows = await fetchActiveCompanyRows();
      for (const { company, logo } of rows) {
        const existing = countMap.get(company);
        if (existing) existing.count += 1;
        else countMap.set(company, { count: 1, logo });
      }
    }
  } catch (error) {
    console.error('Network or Supabase exception caught:', error);
  }

  const curatedKeys =
    typeof curatedCompanies === 'object' && curatedCompanies !== null
      ? Object.keys(curatedCompanies)
      : [];

  const allCompanyNames = Array.from(new Set([...curatedKeys, ...Array.from(countMap.keys())]));

  const companies: CompanyCard[] = allCompanyNames
    .map((name) => {
      let meta;
      try {
        meta = typeof getCompanyMeta === 'function' ? getCompanyMeta(name) : undefined;
      } catch (e) {
        console.error('getCompanyMeta error:', e);
      }

      const fallbackMeta = {
        name,
        domain: '',
        industry: 'Technology',
        description: `${name} has open roles listed on ${siteConfig.name}.`,
      };

      const safeMeta = meta || fallbackMeta;
      const info = countMap.get(name);
      const hasRealDomain = !!safeMeta.domain && safeMeta.domain !== 'unknown.com';
      const displayName = safeMeta.name || name;

      return {
        name: displayName,
        href: `/companies/${encodeURIComponent(name)}`,
        // Curated companies use their domain logo; new companies use the logo saved with their jobs.
        logoUrl: hasRealDomain ? `https://unavatar.io/${safeMeta.domain}` : info?.logo || '',
        industry: safeMeta.industry,
        description: safeMeta.description,
        jobCount: info?.count ?? 0,
        category: categoryOf(safeMeta.industry),
      };
    })
    // Only companies that actually have open roles (a company with 0 jobs would be a dead link).
    .filter((company) => company.jobCount > 0)
    .sort((a, b) => b.jobCount - a.jobCount);

  const totalRoles = companies.reduce((n, c) => n + c.jobCount, 0);
  const lead = companies.slice(0, 3);

  const baseUrl = getSiteUrl();
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Companies', item: `${baseUrl}/companies` },
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
            Employers
          </p>
          <h1 className="text-[36px] md:text-[48px] font-black text-gray-900 tracking-tight leading-tight">
            Companies <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">hiring in AI and tech</span>
          </h1>
          <p className="mt-4 text-[17px] md:text-[18px] text-gray-600 font-medium max-w-2xl mx-auto md:mx-0">
            {companies.length > 0
              ? `${totalRoles.toLocaleString()} open roles at ${companies.length} companies. ${joinList(
                  lead.map((c) => `${c.name} (${c.jobCount.toLocaleString()})`)
                )} have the most openings.`
              : `The companies with open roles on ${siteConfig.name}, with the number of active listings for each.`}{' '}
            A company stays on this list while it has at least one open role on its own career page.
          </p>
        </div>
      </section>

      {/* ---------- Search, filters and cards ---------- */}
      <CompaniesBrowser companies={companies} categories={CATEGORIES} />

      {/* ---------- Bottom call to action ---------- */}
      <section className="max-w-[1152px] mx-auto px-4 mt-16">
        <div className="relative overflow-hidden rounded-3xl bg-[#00060C] px-8 py-10 md:px-12 md:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" aria-hidden="true" />
          <div>
            <h2 className="text-[24px] md:text-[28px] font-extrabold text-white tracking-tight">
              Know the role, not the company?
            </h2>
            <p className="mt-2 text-[16px] text-gray-400 max-w-xl">
              Browse open roles by city, job type or remote work, or search every listing by keyword.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/jobs"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] px-6 py-3 rounded-xl transition-colors"
            >
              Browse by location and role
            </Link>
            <Link
              href="/"
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-[15px] px-6 py-3 rounded-xl border border-white/20 transition-colors"
            >
              Search all roles
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
