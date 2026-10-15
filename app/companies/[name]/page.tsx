import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCompanyMeta } from '../../lib/companiesData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decodedCompany = decodeURIComponent(name);
  const meta = getCompanyMeta(decodedCompany);
  
  return {
    title: `${decodedCompany} Careers & Open Roles | TechJobs`,
    description: meta.description,
  };
}

export default async function CompanyProfilePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decodedCompany = decodeURIComponent(name);
  const companyMeta = getCompanyMeta(decodedCompany);

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'active')
    .ilike('company', decodedCompany)
    .order('created_at', { ascending: false });

  if (!jobs || jobs.length === 0) {
    notFound();
  }

  const logoUrl = `https://unavatar.io/${companyMeta.domain}`;

  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans pb-20 text-[#181818]">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-[65px]">
        <div className="max-w-[800px] mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/companies" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors font-bold text-[14px]">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All Companies
          </Link>
          <Link href="/" className="text-[20px] font-black tracking-tighter text-blue-600">
            Tech<span className="text-[#00060C]">Jobs</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-[800px] mx-auto px-4 mt-8">
        {/* Rich Company Header (Original Content for SEO & AdSense) */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-[68px] h-[68px] border border-gray-200 rounded-2xl flex items-center justify-center bg-white shadow-sm overflow-hidden p-2">
              <img src={logoUrl} alt={decodedCompany} className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-[30px] font-extrabold text-gray-900 tracking-tight leading-tight">
                {decodedCompany}
              </h1>
              <span className="text-[13px] font-bold text-indigo-600 bg-indigo-50 px-3 py-0.5 rounded-full border border-indigo-100">
                {companyMeta.industry}
              </span>
            </div>
          </div>
          <p className="text-gray-600 font-medium text-[15px] leading-relaxed mb-4">
            {companyMeta.description}
          </p>
          <div className="text-[13px] font-bold text-gray-400">
            Currently hiring for {jobs.length} position{jobs.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Roles List */}
        <div className="flex flex-col">
          <h2 className="text-[18px] font-extrabold text-gray-900 mb-4 px-1">Open Positions</h2>
          {jobs.map((job) => (
            <Link 
              href={`/job/${job.id}`} 
              key={job.id} 
              className="block p-5 mb-3 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-indigo-500 transition-all group"
            >
              <h3 className="text-[17px] font-extrabold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {job.title}
              </h3>
              <div className="flex gap-2">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700 border border-indigo-200">
                  {job.location.split(';')[0]}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                  ${job.salary_min \vert{}\vert{} 100}K –${job.salary_max || 150}K
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}