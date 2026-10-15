import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompanyMeta, curatedCompanies } from '../lib/companiesData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Top Tech Companies Hiring | TechJobs',
  description: 'Explore leading companies and startups hiring engineers, data scientists, and product leaders. View culture profiles and active roles.',
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function CompaniesIndex() {
  let jobs: any[] = [];

  // 🧠 BULLETPROOF FIX 1: Wrap DB call in try/catch to prevent Vercel 500 timeouts
  try {
    if (supabaseUrl && supabaseKey) {
      const res = await supabase
        .from('jobs')
        .select('company, company_logo_url')
        .eq('status', 'active')
        .limit(2000); // Lowered to 2000 to keep the serverless function fast

      if (res.data) {
        jobs = res.data;
      } else if (res.error) {
        console.error("Supabase returned an error:", res.error);
      }
    }
  } catch (error) {
    console.error("Network or Supabase exception caught:", error);
    // Page safely falls back to rendering curated companies
  }

  const countMap = new Map<string, { count: number; logoUrl: string }>();

  // 🧠 BULLETPROOF FIX 2: Safely map jobs, ignoring corrupt or missing data
  try {
    (jobs || []).forEach(job => {
      if (!job || !job.company || typeof job.company !== 'string') return;

      const companyName = job.company.trim();
      if (!companyName) return;

      if (!countMap.has(companyName)) {
        countMap.set(companyName, { count: 1, logoUrl: job.company_logo_url || '' });
      } else {
        countMap.get(companyName)!.count += 1;
      }
    });
  } catch (e) {
    console.error("Error processing jobs array:", e);
  }

  const curatedKeys = (typeof curatedCompanies === 'object' && curatedCompanies !== null) ? Object.keys(curatedCompanies) : [];
  const allCompanyNames = Array.from(
    new Set([...curatedKeys, ...Array.from(countMap.keys())])
  );

  const companies = allCompanyNames
    .map(name => {
      let meta;
      // 🧠 BULLETPROOF FIX 3: Catch any potential errors in the metadata matcher
      try {
        meta = typeof getCompanyMeta === 'function' ? getCompanyMeta(name) : undefined;
      } catch (e) {
        console.error("getCompanyMeta error:", e);
      }

      const fallbackMeta = {
        name,
        domain: 'unknown.com',
        industry: 'Technology',
        description: `${name} is actively recruiting engineering and tech talent.`
      };

      const safeMeta = meta || fallbackMeta;
      const dbInfo = countMap.get(name);

      return {
        ...safeMeta,
        name: safeMeta.name || name, 
        jobCount: dbInfo ? dbInfo.count : 0,
        logoUrl: `https://unavatar.io/${safeMeta.domain || 'unknown.com'}`
      };
    })
    .filter(company => company.jobCount > 0 || curatedKeys.includes(company.name))
    .sort((a, b) => b.jobCount - a.jobCount);

  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans pb-24 text-[#181818]">
      
      
      <div className="max-w-[1152px] mx-auto px-4 mt-16 mb-12 text-center md:text-left">
        <h1 className="text-[40px] md:text-[48px] font-black text-gray-900 tracking-tight mb-4">
          Top Companies Hiring
        </h1>
        <p className="text-[18px] text-gray-500 font-medium max-w-2xl">
          Browse verified companies actively building teams across engineering, research, and remote operations.
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
                    <img 
                      src={company.logoUrl} 
                      alt={company.name} 
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