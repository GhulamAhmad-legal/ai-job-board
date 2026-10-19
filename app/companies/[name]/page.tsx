import { siteConfig } from '../../lib/siteConfig';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCompanyMeta } from '../../lib/companiesData';

export const revalidate = 3600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type JobRow = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  company_logo_url: string | null;
};

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
      .select('id, title, company, location, salary_min, salary_max, company_logo_url')
      .ilike('company', safeName)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error || !data) break;
    all.push(...(data as JobRow[]));
    if (data.length < pageSize) break;
  }
  return all;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const meta = readMeta(decodedName);

  const title = `${decodedName} Careers and Open Roles | ${siteConfig.name}`;
  const description = `${decodedName} open roles on ${siteConfig.name}. ${meta.description}`.slice(0, 158);
  const path = `/companies/${encodeURIComponent(decodedName)}`;

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

  const jobs = await fetchCompanyJobs(decodedName);
  if (jobs.length === 0) notFound();

  const companyName = jobs[0].company;
  const meta = readMeta(companyName);
  const hasRealDomain = !!meta.domain && meta.domain !== 'unknown.com';
  const logoUrl = hasRealDomain ? `https://unavatar.io/${meta.domain}` : jobs[0].company_logo_url || '';

  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans pb-20">
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
                {companyName}
              </h1>
              <p className="text-[14px] font-bold text-indigo-700 mt-1">{meta.industry}</p>
              <p className="text-[15px] text-gray-600 leading-relaxed mt-3">{meta.description}</p>
              <p className="text-[14px] text-gray-500 font-medium mt-4">
                Currently hiring for {jobs.length.toLocaleString()} {jobs.length === 1 ? 'position' : 'positions'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-[15px] font-extrabold text-gray-900">Open Positions at {companyName}</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {jobs.map((job) => {
              // Only show a salary when real values exist (stored in thousands). Never a default.
              const hasSalary =
                typeof job.salary_min === 'number' &&
                typeof job.salary_max === 'number' &&
                job.salary_min > 0 &&
                job.salary_max >= job.salary_min;
              const locationLabel = (job.location ?? '').split(';')[0];

              return (
                <Link href={`/job/${job.id}`} key={job.id} className="block group hover:bg-blue-50/30 transition-colors">
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
