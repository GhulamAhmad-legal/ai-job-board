import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyMeta, curatedCompanies } from '../lib/companiesData';

// Rebuild at most once an hour (fast for visitors and crawlers).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Companies Hiring in AI and Tech | AIJobs',
  description:
    'Browse the companies with open roles on AIJobs, including Anthropic, Databricks, Scale AI, Figma, Reddit, Vercel, Discord and Waymo.',
  alternates: { canonical: '/companies' },
  openGraph: {
    title: 'Companies Hiring in AI and Tech | AIJobs',
    description:
      'Browse the companies with open roles on AIJobs, including Anthropic, Databricks, Scale AI, Figma, Reddit, Vercel, Discord and Waymo.',
    url: '/companies',
    siteName: 'AIJobs',
    type: 'website',
  },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Page through ALL active jobs (only the company column) so counts are exact,
// no matter how many jobs there are.
async function fetchActiveCompanyNames(): Promise<string[]> {
  const pageSize = 1000;
  const names: string[] = [];

  for (let from = 0; from < 50000; from += pageSize) {
    const { data, error } = await supabase
      .from('jobs')
      .select('company')
      .eq('status', 'active')
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error || !data) {
      if (error) console.error('Supabase returned an error:', error);
      break;
    }
    for (const row of data) {
      if (row && typeof row.company === 'string' && row.company.trim()) {
        names.push(row.company.trim());
      }
    }
    if (data.length < pageSize) break;
  }

  return names;
}

export default async function CompaniesIndex() {
  const countMap = new Map<string, number>();

  try {
    if (supabaseUrl && supabaseKey) {
      const names = await fetchActiveCompanyNames();
      for (const name of names) {
        countMap.set(name, (countMap.get(name) ?? 0) + 1);
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

  const companies = allCompanyNames
    .map((name) => {
      let meta;
      try {
        meta = typeof getCompanyMeta === 'function' ? getCompanyMeta(name) : undefined;
      } catch (e) {
        console.error('getCompanyMeta error:', e);
      }

      const fallbackMeta = {
        name,
        domain: 'unknown.com',
        industry: 'Technology',
        description: `${name} has open roles listed on AIJobs.`,
      };

      const safeMeta = meta || fallbackMeta;

      return {
        ...safeMeta,
        name: safeMeta.name || name,
        jobCount: countMap.get(name) ?? 0,
        logoUrl: `https://unavatar.io/${safeMeta.domain || 'unknown.com'}`,
      };
    })
    // Only companies that actually have open roles (a company with 0 jobs would be a dead link).
    .filter((company) => company.jobCount > 0)
    .sort((a, b) => b.jobCount - a.jobCount);

  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans pb-24 text-[#181818]">
      <div className="max-w-[1152px] mx-auto px-4 mt-16 mb-12 text-center md:text-left">
        <h1 className="text-[40px] md:text-[48px] font-black text-gray-900 tracking-tight mb-4">
          Companies Hiring
        </h1>
        <p className="text-[18px] text-gray-500 font-medium max-w-2xl">
          The companies with open roles on AIJobs, with the number of active listings for each.
        </p>
      </div>

      <div className="max-w-[1152px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Link
              href={`/companies/${encodeURIComponent(company.name)}`}
              key={company.name}
              className="block group h-full"
            >
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-[60px] h-[60px] border border-gray-100 rounded-xl flex items-center justify-center bg-white shadow-sm overflow-hidden p-2 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={company.logoUrl}
                      alt={`${company.name} logo`}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-[12px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 truncate max-w-[180px]">
                    {company.industry}
                  </span>
                </div>

                <h2 className="text-[20px] font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {company.name}
                </h2>

                <p className="text-[14px] text-gray-500 leading-relaxed mb-6 line-clamp-3 flex-1">
                  {company.description}
                </p>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <span className="text-[13px] font-bold text-gray-700">
                    {company.jobCount.toLocaleString()} open {company.jobCount === 1 ? 'role' : 'roles'}
                  </span>
                  <span className="text-[13px] font-bold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    View jobs →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
