import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Utility to decode HTML entities in the description
function decodeHtml(html: string) {
  if (!html) return '';
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

// 🧠 1. DYNAMIC SEO METADATA (Updated to await params)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const { data: job } = await supabase
    .from('jobs')
    .select('title, company, location')
    .eq('id', resolvedParams.id)
    .single();

  if (!job) return { title: 'Job Not Found | AIJobs' };

  return {
    title: `${job.title} at ${job.company} | AIJobs`,
    description: `Apply for the ${job.title} role at ${job.company} located in ${job.location}. Find more AI and remote tech jobs on AIJobs.`,
  };
}

// 🧠 2. SERVER COMPONENT (Updated to await params)
export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (!job) {
    notFound();
  }

  const mockRating = 3.0 + (job.company.length % 3);
  const salaryMin = job.salary_min || 100;
  const salaryMax = job.salary_max || 150;

  // 🧠 3. JSON-LD SCHEMA
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.created_at,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company,
      "logo": job.company_logo_url
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location
      }
    },
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": salaryMin * 1000,
        "maxValue": salaryMax * 1000,
        "unitText": "YEAR"
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans pb-20">
      
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

      {/* Main Job Content */}
      <div className="max-w-[800px] mx-auto px-4 mt-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          
          <div className="px-8 py-10 border-b border-gray-100 bg-white relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-[56px] h-[56px] border border-gray-200 rounded-xl flex items-center justify-center bg-white shadow-sm overflow-hidden text-gray-900 font-black text-[18px]">
                {job.company_logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={job.company_logo_url} alt={job.company} className="w-full h-full object-contain p-1" />
                ) : (
                  job.company.slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <span className="text-[18px] font-bold text-gray-900 block">{job.company}</span>
                <span className="text-[14px] font-bold text-gray-500 flex items-center mt-1">
                  {mockRating}.0 <span className="text-amber-400 ml-1 text-[12px]">★</span>
                </span>
              </div>
            </div>

            <h1 className="text-[32px] md:text-[40px] font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-[14px] font-bold border border-gray-100">
                {job.location.split(';')[0]}
              </span>
              <span className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-[14px] font-bold border border-green-100">
                ${salaryMin}K –${salaryMax}K <span className="font-medium opacity-80">/yr</span>
              </span>
            </div>

            <a 
              href={job.apply_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-[16px] px-10 py-4 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              Apply on employer site
            </a>
          </div>

          <div className="p-8 md:p-12 bg-white">
            <h2 className="text-[20px] font-extrabold text-gray-900 mb-6">About the role</h2>
            <div className="prose prose-slate max-w-none text-gray-700 text-[16px] leading-relaxed prose-headings:font-extrabold prose-headings:text-gray-900 prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-strong:text-gray-900" 
                 dangerouslySetInnerHTML={{ __html: decodeHtml(job.description) }} />
          </div>

        </div>
      </div>
    </main>
  );
}