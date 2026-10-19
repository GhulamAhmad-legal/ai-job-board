import { getSiteUrl } from '../../lib/siteUrl';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cleanDescription } from '../../lib/cleanDescription';

export const revalidate = 3600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const baseUrl = getSiteUrl();

// Maps "United States" / "California" / "Ontario, Canada" to a schema.org requirement.
function remoteRequirement(region: string) {
  const countries: Record<string, string> = {
    'united states': 'US',
    us: 'US',
    usa: 'US',
    'united kingdom': 'GB',
    uk: 'GB',
    india: 'IN',
    canada: 'CA',
  };
  const code = countries[region.toLowerCase()];
  return code
    ? { '@type': 'Country', name: code }
    : { '@type': 'AdministrativeArea', name: region };
}

// One query shared by generateMetadata and the page. Inactive jobs 404.
const getJob = cache(async (id: string) => {
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .maybeSingle();
  return data;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) return { title: 'Job Not Found | AIJobs', robots: { index: false } };

  const location = (job.location ?? '').split(';')[0];
  const cleanTitle = String(job.title).replace(/\s+/g, ' ').trim();
  const title = `${cleanTitle} at ${job.company}${location ? ` – ${location}` : ''} | AIJobs`;

  // Built from the job's own facts, so every description is unique (no employer boilerplate or requisition codes).
  const hasSalary =
    typeof job.salary_min === 'number' &&
    typeof job.salary_max === 'number' &&
    job.salary_min > 0 &&
    job.salary_max >= job.salary_min;
  const salaryText = hasSalary
    ? job.salary_min === job.salary_max
      ? ` Pay: $${job.salary_min}K per year.`
      : ` Pay: $${job.salary_min}K–$${job.salary_max}K per year.`
    : '';
  const remoteText = /^remote(\s+-\s+|\s*,\s*)/i.test(job.location ?? '') ? ' Fully remote role.' : '';
  const description = `${cleanTitle} at ${job.company}${location ? ` in ${location}` : ''}.${remoteText}${salaryText} Read the full description and apply on the employer’s website.`;
  const url = `${baseUrl}/job/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', siteName: 'AIJobs' },
  };
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) notFound();

  const locationLabel = (job.location ?? '').split(';')[0];

  // Only show/emit salary when real values exist. No made-up defaults.
  // Assumes salary_min / salary_max are stored in thousands (e.g. 150 = $150K).
  const hasSalary =
    typeof job.salary_min === 'number' &&
    typeof job.salary_max === 'number' &&
    job.salary_min > 0 &&
    job.salary_max >= job.salary_min;

  // "Remote - United States" / "Remote, US" = fully remote.
  // "Remote-Friendly (Travel-Required) | San Francisco, CA" is NOT fully remote.
  const rawLocation = String(job.location ?? '').trim();
  const remoteMatch = rawLocation.match(/^remote(?:\s+-\s+|\s*,\s*)(.+)$/i);
  const isFullyRemote = !!remoteMatch;
  const remoteRegion = remoteMatch ? remoteMatch[1].trim() : '';

  const locations = isFullyRemote
    ? []
    : rawLocation
        .split(/[;|]/)
        .map((l) => l.trim())
        .filter((l) => l && !/^remote/i.test(l));

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: cleanDescription(job.description ?? ''),
    datePosted: job.created_at,
    directApply: false,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
      ...(job.company_logo_url ? { logo: job.company_logo_url } : {}),
    },
    ...(locations.length
      ? {
          jobLocation: locations.map((l) => ({
            '@type': 'Place',
            address: { '@type': 'PostalAddress', addressLocality: l },
          })),
        }
      : {}),
    ...(isFullyRemote
      ? {
          jobLocationType: 'TELECOMMUTE',
          applicantLocationRequirements: remoteRequirement(remoteRegion),
        }
      : {}),
  };

  if (hasSalary) {
    jsonLd.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salary_min * 1000,
        maxValue: job.salary_max * 1000,
        unitText: 'YEAR',
      },
    };
  }

  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <div className="max-w-[800px] mx-auto px-4 pt-6">
        <Link
          href="/"
          className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-bold text-[14px]"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all jobs
        </Link>
      </div>

      <div className="max-w-[800px] mx-auto px-4 mt-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-8 py-10 border-b border-gray-100 bg-white relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-[56px] h-[56px] border border-gray-200 rounded-xl flex items-center justify-center bg-white shadow-sm overflow-hidden text-gray-900 font-black text-[18px]">
                {job.company_logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={job.company_logo_url} alt={`${job.company} logo`} className="w-full h-full object-contain p-1" />
                ) : (
                  job.company.slice(0, 2).toUpperCase()
                )}
              </div>
              <Link
                href={`/companies/${encodeURIComponent(job.company)}`}
                className="text-[18px] font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {job.company}
              </Link>
            </div>

            <h1 className="text-[32px] md:text-[40px] font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              {locationLabel && (
                <span className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-[14px] font-bold border border-gray-100">
                  {locationLabel}
                </span>
              )}
              {hasSalary && (
                <span className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-[14px] font-bold border border-green-100">
                  ${job.salary_min}K – ${job.salary_max}K <span className="font-medium opacity-80">/yr</span>
                </span>
              )}
            </div>

            {job.apply_url && (
            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-[16px] px-10 py-4 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              Apply on employer site
            </a>
            )}
          </div>

          <div className="p-8 md:p-12 bg-white">
            <h2 className="text-[20px] font-extrabold text-gray-900 mb-6">About the role</h2>
            <div
              className="prose prose-slate max-w-none text-gray-700 text-[16px] leading-relaxed prose-headings:font-extrabold prose-headings:text-gray-900 prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: cleanDescription(job.description ?? '') }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
