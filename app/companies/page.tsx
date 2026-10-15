import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyMeta, curatedCompanies } from '../lib/companiesData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Top Tech & AI Companies Hiring | TechJobs',
  description: 'Explore leading companies and startups hiring engineers, data scientists, and product leaders. View culture profiles and active roles.',
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function CompaniesIndex() {
  // Query Supabase for real-time counts
  const { data: jobs } = await supabase
    .from('jobs')
    .select('company, company_logo_url')
    .eq('status', 'active')
    .limit(10000);

  // Group database jobs by company
  const countMap = new Map<string, { count: number; logoUrl: string }>();
  (jobs || []).forEach(job => {
    if (!countMap.has(job.company)) {
      countMap.set(job.company, { count: 1, logoUrl: job.company_logo_url || '' });
    } else {
      countMap.get(job.company)!.count += 1;
    }
  });

  // Merge database counts with curated companies list
  const allCompanyNames = Array.from(
    new Set([...Object.keys(curatedCompanies), ...Array.from(countMap.keys())])
  );

  const companies = allCompanyNames
    .map(name => {
      const meta = getCompanyMeta(name);
      const dbInfo = countMap.get(name);
      return {
        ...meta,
        jobCount: dbInfo ? dbInfo.count : 0,
        logoUrl: `https://unavatar.io/${meta.domain}`
      };
    })
    .sort((a, b) => b.jobCount - a.jobCount);

  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans pb-24 text-[#181818]">
      
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-[65px]">
        <div className="max-w-[1152px] mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-[22px] font-black tracking-tighter text-blue-600">
              Tech<span className="text-[#00060C]">Jobs</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-[15px] font-bold text-gray-500 pt-1">
              <Link href="/" className="hover:text-gray-900 transition-colors">Find Jobs</Link>
              <Link href="/companies" className="text-gray-900 border-b-2 border-blue-600 pb-[19px]">Companies</Link>
              <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hidden md:block text-[14px] font-bold text-gray-500 hover:text-gray-900 transition-colors">
              Contact
            </Link>
            <Link href="/post-job" className="bg-[#00060C] hover:bg-gray-800 text-white font-bold text-[14px] px-6 py-2.5 rounded-lg transition-all">
              Post a Job — $299
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-[1152px] mx-auto px-4 mt-16 mb-12 text-center md:text-left">
        <h1 className="text-[40px] md:text-[48px] font-black text-gray-900 tracking-tight mb-4">
          Top Companies Hiring
        </h1>
        <p className="text-[18px] text-gray-500 font-medium max-w-2xl">
          Browse verified companies actively building teams across engineering, research, and remote operations.
        </p>
      </div>

      {/* Grid */}
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
                  <div className="w-[60px] h-[60px] border border-gray-100 rounded-xl flex items-center justify-center bg-white shadow-sm overflow-hidden p-2">
                    <img 
                      src={company.logoUrl} 
                      alt={company.name} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <span className="text-[12px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
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
                    {company.jobCount} open {company.jobCount === 1 ? 'role' : 'roles'}
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