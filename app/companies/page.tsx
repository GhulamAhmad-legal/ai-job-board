import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Companies Hiring AI Talent | AIJobs",
  description: "Browse top tech companies and startups hiring remote AI talent. View open roles, salaries, and remote engineering jobs.",
};

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function CompaniesIndex() {
  // Fetch all active jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('company, company_logo_url')
    .eq('status', 'active');

  // Group and count jobs by company
  const companyMap = new Map();
  (jobs || []).forEach(job => {
    if (!companyMap.has(job.company)) {
      companyMap.set(job.company, {
        name: job.company,
        logoUrl: job.company_logo_url,
        jobCount: 1
      });
    } else {
      companyMap.get(job.company).jobCount += 1;
    }
  });

  // Convert to array and sort by most open roles first
  const companies = Array.from(companyMap.values()).sort((a, b) => b.jobCount - a.jobCount);

  return (
    <main className="min-h-[calc(100vh-65px)] bg-[#F5F6F8] font-sans py-12 px-4">
      <div className="max-w-[1000px] mx-auto">
        
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Top Companies Hiring</h1>
          <p className="text-[16px] text-gray-500 font-medium">Browse {companies.length} companies actively recruiting AI and remote tech professionals.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {companies.map((company) => (
            <Link href={`/companies/${encodeURIComponent(company.name)}`} key={company.name} className="block group">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 h-full flex flex-col items-center text-center">
                <div className="w-[64px] h-[64px] border border-gray-100 rounded-xl flex items-center justify-center bg-white shadow-sm overflow-hidden text-gray-900 font-black text-[18px] mb-4">
                  {company.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain p-1.5" />
                  ) : (
                    company.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <h2 className="text-[16px] font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors mb-1.5">{company.name}</h2>
                <span className="text-[12px] font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 mt-auto">
                  {company.jobCount} open {company.jobCount === 1 ? 'role' : 'roles'}
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}