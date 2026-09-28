import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 🧠 1. DYNAMIC SEO METADATA
export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = await params;
  // Decode the URL (e.g. "Scale%20AI" becomes "Scale AI")
  const decodedName = decodeURIComponent(resolvedParams.name);
  
  return {
    title: `${decodedName} Careers, AI Roles & Remote Jobs | AIJobs`,
    description: `Browse all open roles, salaries, and remote jobs at ${decodedName}. Apply directly on the employer site.`,
  };
}

// 🧠 2. SERVER COMPONENT (Fully rendered for Google)
export default async function CompanyPage({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = await params;
  const decodedName = decodeURIComponent(resolvedParams.name);

  // Fetch all active jobs matching the company name
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .ilike('company', decodedName) // ilike makes it case-insensitive
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // If no jobs exist for this company, show a 404 page
  if (!jobs || jobs.length === 0) {
    notFound();
  }

  // Grab company details from the first job in the array
  const companyName = jobs[0].company;
  const logoUrl = jobs[0].company_logo_url;
  const mockRating = 3.0 + (companyName.length % 3);

  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans pb-20">
      
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-[65px]">
        <div className="max-w-[800px] mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors font-bold text-[14px]">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all jobs
          </Link>
          <Link href="/" className="text-[20px] font-black tracking-tighter text-blue-600">
            AI<span className="text-[#00060C]">Jobs</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-[800px] mx-auto px-4 mt-8">
        
        {/* Company Header */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-10 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
          
          <div className="flex items-center gap-6">
            <div className="w-[80px] h-[80px] border border-gray-200 rounded-2xl flex items-center justify-center bg-white shadow-sm overflow-hidden text-gray-900 font-black text-[24px] shrink-0">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={companyName} className="w-full h-full object-contain p-2" />
              ) : (
                companyName.slice(0, 2).toUpperCase()
              )}
            </div>
            
            <div>
              <h1 className="text-[32px] font-extrabold text-gray-900 leading-tight tracking-tight">
                {companyName}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[14px] font-bold text-gray-500 flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-100">
                  {mockRating}.0 <span className="text-amber-400 ml-1 text-[12px]">★</span>
                </span>
                <span className="text-[14px] text-gray-500 font-medium">
                  {jobs.length} open {jobs.length === 1 ? 'role' : 'roles'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Listings List */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-[15px] font-extrabold text-gray-900">Latest Openings at {companyName}</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {jobs.map((job) => {
              const salaryMin = job.salary_min || 100;
              const salaryMax = job.salary_max || 150;
              
              return (
                <Link href={`/job/${job.id}`} key={job.id} className="block group hover:bg-blue-50/30 transition-colors">
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-[18px] font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors mb-1.5">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-3 text-[14px]">
                        <span className="text-gray-500 font-medium flex items-center">
                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {job.location.split(';')[0]}
                        </span>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100">
                          ${salaryMin}K –${salaryMax}K <span className="font-medium opacity-80">/yr</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="shrink-0 flex items-center text-blue-600 font-bold text-[14px] group-hover:translate-x-1 transition-transform">
                      View Job
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
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