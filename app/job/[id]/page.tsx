import { siteConfig } from '../../lib/siteConfig';
import { getSiteUrl } from '../../lib/siteUrl';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { cleanDescription } from '../../lib/cleanDescription';
import { officePlaces, remoteTargets, inferEmploymentType, allInUS } from '../../lib/jobSchema';
import { getCompanyMeta } from '../../lib/companiesData';
import { jobPath, parseJobRef } from '../../lib/jobSlug';
import BackLink from '../../components/BackLink';
import { getLandingCounts } from '../../lib/landingData';
import { MIN_JOBS, jobHubs, landingLinkLabel } from '../../lib/landingPages';
import { getMoreFromCompany, getSimilarJobs, type RelatedJob } from '../../lib/relatedJobs';

export const revalidate = 3600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const baseUrl = getSiteUrl();

// One query shared by generateMetadata and the page. Inactive jobs 404.
// Takes the raw URL segment: a short slug (…-4821), a long slug, or a bare UUID.
const getJob = cache(async (param: string) => {
  const ref = parseJobRef(param);
  if (!ref) return null;
  const query = supabase.from('jobs').select('*').eq('status', 'active');
  const { data } = await (ref.kind === 'seq' ? query.eq('seq', ref.value) : query.eq('id', ref.value)).maybeSingle();
  return data;
});

// The primary listing of the same role (used as the canonical page for the other locations).
const getPrimary = cache(async (groupKey: string, company: string) => {
  const { data } = await supabase
    .from('jobs')
    .select('id, seq, title, company')
    .eq('group_key', groupKey)
    .eq('company', company)
    .eq('status', 'active')
    .eq('is_primary', true)
    .maybeSingle();
  return data;
});

// Every active location of the same role, each with its own apply link.
const getSiblings = cache(async (groupKey: string, company: string) => {
  const { data } = await supabase
    .from('jobs')
    .select('id, location, apply_url')
    .eq('group_key', groupKey)
    .eq('company', company)
    .eq('status', 'active')
    .order('location', { ascending: true })
    .limit(40);
  return data ?? [];
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const job = await getJob(rawId);

  if (!job) return { title: `Job Not Found | ${siteConfig.name}`, robots: { index: false } };

  const location = (job.location ?? '').split(';')[0];
  const cleanTitle = String(job.title).replace(/\s+/g, ' ').trim();
  const title = `${cleanTitle} at ${job.company}${location ? ` – ${location}` : ''} | ${siteConfig.name}`;

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
  // A role posted in several locations has one main page; the others point to it and stay out of search results.
  let canonicalPath = jobPath(job);
  let duplicate = false;
  if (job.is_primary === false && job.group_key) {
    const primary = await getPrimary(job.group_key, job.company);
    if (primary) {
      canonicalPath = jobPath(primary);
      duplicate = true;
    }
  }
  const url = `${baseUrl}${canonicalPath}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    ...(duplicate ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title, description, url, type: 'website', siteName: siteConfig.name },
  };
}

// A compact list of related roles (used for "More jobs at ..." and "Similar roles").
function RelatedList({
  heading,
  jobs,
  footer,
}: {
  heading: string;
  jobs: RelatedJob[];
  footer?: React.ReactNode;
}) {
  if (jobs.length === 0) return null;
  return (
    <section className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-[16px] font-extrabold text-gray-900">{heading}</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {jobs.map((j) => {
          const paid =
            typeof j.salary_min === 'number' &&
            typeof j.salary_max === 'number' &&
            j.salary_min > 0 &&
            j.salary_max >= j.salary_min;
          const place = (j.location ?? '').split(';')[0];
          return (
            <Link key={j.id} href={jobPath(j)} className="block px-6 py-4 hover:bg-blue-50/40 transition-colors">
              <div className="text-[16px] font-bold text-gray-900">{j.title}</div>
              <div className="text-[14px] text-gray-500 mt-0.5">
                {j.company}
                {place ? ` · ${place}` : ''}
                {paid ? ` · $${j.salary_min}K – $${j.salary_max}K` : ''}
              </div>
            </Link>
          );
        })}
      </div>
      {footer && <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 text-[14px]">{footer}</div>}
    </section>
  );
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const job = await getJob(rawId);

  if (!job) notFound();

  // Old /job/<uuid> links (and out-of-date slugs) 301 to the one canonical URL.
  const canonicalPath = jobPath(job);
  let currentId = rawId;
  try {
    currentId = decodeURIComponent(rawId);
  } catch {}
  if (`/job/${currentId}` !== canonicalPath) permanentRedirect(canonicalPath);

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

  // Other locations of the same role (only when the employer posted it in several places).
  const siblings =
    (job.group_size ?? 1) > 1 && job.group_key ? await getSiblings(job.group_key, job.company) : [];

  // Raw location text goes straight to officePlaces, which splits and cleans it
  // (handles | ; / • "or" "and", Hybrid/Office/Remote words, SF/NYC, 3-letter countries...).
  const placeTexts =
    siblings.length > 1 ? siblings.map((sib) => sib.location ?? '') : [rawLocation];

  // Google only accepts Country or State objects for remote jobs, and a readable address for office jobs.
  // If we can't work out a valid place, the JobPosting markup is left out instead of sending something invalid.
  const targets = isFullyRemote ? remoteTargets(remoteRegion) : [];
  const places = isFullyRemote ? [] : officePlaces(placeTexts);
  const hasValidLocation = isFullyRemote ? targets.length > 0 : places.length > 0;

  const employmentType = inferEmploymentType(job.title, job.description ?? '');
  const companyDomain = getCompanyMeta(job.company).domain;

  // Rolling expiry: 30 days after the scraper last saw this job still listed.
  const VALID_DAYS = 30;
  const lastSeen = new Date(job.last_seen_at ?? job.updated_at ?? job.created_at ?? Date.now());
  const validThroughDate = new Date(lastSeen.getTime() + VALID_DAYS * 86400000);
  const validThrough =
    !isNaN(validThroughDate.getTime()) && validThroughDate.getTime() > Date.now()
      ? validThroughDate.toISOString()
      : undefined;

  // Google also requires a way to apply, so listings without an apply link get no JobPosting markup.
  const jsonLd: Record<string, unknown> | null = hasValidLocation && job.apply_url
    ? {
        '@context': 'https://schema.org/',
        '@type': 'JobPosting',
        title: job.title,
        description: cleanDescription(job.description ?? ''),
        datePosted: job.first_seen_at ?? job.created_at,
        ...(validThrough ? { validThrough } : {}),
        directApply: false,
        identifier: { '@type': 'PropertyValue', name: job.company, value: String(job.id) },
        ...(employmentType ? { employmentType } : {}),
        hiringOrganization: {
          '@type': 'Organization',
          name: job.company,
          ...(companyDomain ? { sameAs: `https://${companyDomain}` } : {}),
          ...(job.company_logo_url ? { logo: job.company_logo_url } : {}),
        },
        ...(places.length ? { jobLocation: places.length === 1 ? places[0] : places } : {}),
        ...(isFullyRemote
          ? {
              jobLocationType: 'TELECOMMUTE',
              applicantLocationRequirements: targets.length === 1 ? targets[0] : targets,
            }
          : {}),
      }
    : null;

  // The jobs table has no currency column, so only label pay as USD when every place is in the US.
  if (jsonLd && hasSalary && allInUS(places, targets)) {
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

  // ---- Related links: the search pages this job belongs to, more jobs at the company, similar roles ----
  const liveSlugs = new Set(
    (await getLandingCounts()).filter((c) => c.count >= MIN_JOBS).map((c) => c.slug)
  );
  const hubs = jobHubs(job, liveSlugs);
  const [moreFromCompany, similarJobs] = await Promise.all([getMoreFromCompany(job), getSimilarJobs(job)]);

  // Breadcrumb: Home > Jobs > (role or place page) > this job
  const crumbHub = hubs.find((h) => h.kind === 'role') ?? hubs.find((h) => h.kind === 'location') ?? hubs[0];
  const crumbTitle = String(job.title).replace(/\s+/g, ' ').trim();
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Jobs', item: `${baseUrl}/jobs` },
      ...(crumbHub
        ? [{ '@type': 'ListItem', position: 3, name: landingLinkLabel(crumbHub), item: `${baseUrl}/jobs/${crumbHub.slug}` }]
        : []),
      { '@type': 'ListItem', position: crumbHub ? 4 : 3, name: crumbTitle, item: `${baseUrl}${canonicalPath}` },
    ],
  };

  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, '\\u003c') }}
      />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
      )}

      <div className="max-w-[800px] mx-auto px-4 pt-6">
        {/* Goes back to the page the visitor came from (company page, landing page, home);
            falls back to the home page when they arrived from elsewhere. */}
        <BackLink
          fallbackHref="/"
          className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-bold text-[14px]"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all jobs
        </BackLink>

        <nav aria-label="Breadcrumb" className="mt-3 flex flex-wrap items-center gap-x-1.5 text-[13px] text-gray-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span aria-hidden="true">›</span>
          <Link href="/jobs" className="hover:text-blue-600 transition-colors">Jobs</Link>
          {crumbHub && (
            <>
              <span aria-hidden="true">›</span>
              <Link href={`/jobs/${crumbHub.slug}`} className="hover:text-blue-600 transition-colors">
                {landingLinkLabel(crumbHub)}
              </Link>
            </>
          )}
          <span aria-hidden="true">›</span>
          <span className="text-gray-700 font-medium">{crumbTitle}</span>
        </nav>
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

          {siblings.length > 1 && (
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-[16px] font-extrabold text-gray-900 mb-3">
                This role is open in {siblings.length} locations
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {siblings.map((sib) => (
                  <li key={sib.id} className="text-[14px] text-gray-700 flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2">
                    <span className="font-medium">{(sib.location ?? '').split(';')[0] || 'Location not listed'}</span>
                    {sib.apply_url && (
                      <a
                        href={sib.apply_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="font-bold text-blue-600 hover:text-blue-700 shrink-0"
                      >
                        Apply →
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-8 md:p-12 bg-white">
            <h2 className="text-[20px] font-extrabold text-gray-900 mb-6">About the role</h2>
            <div
              className="prose prose-slate max-w-none text-gray-700 text-[16px] leading-relaxed prose-headings:font-extrabold prose-headings:text-gray-900 prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: cleanDescription(job.description ?? '') }}
            />
          </div>
        </div>

        {/* ---------- Explore more ---------- */}
        <section className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-[16px] font-extrabold text-gray-900 mb-4">Explore more</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/companies/${encodeURIComponent(job.company)}`}
              className="text-[13px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors"
            >
              All {job.company} jobs →
            </Link>
            {hubs.map((h) => (
              <Link
                key={h.slug}
                href={`/jobs/${h.slug}`}
                className="text-[13px] font-bold text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
              >
                {landingLinkLabel(h)}
              </Link>
            ))}
          </div>
        </section>

        {/* ---------- More at this company ---------- */}
        <RelatedList
          heading={`More jobs at ${job.company}`}
          jobs={moreFromCompany.jobs}
          footer={
            moreFromCompany.total > moreFromCompany.jobs.length + 1 ? (
              <Link
                href={`/companies/${encodeURIComponent(job.company)}`}
                className="font-bold text-blue-600 hover:text-blue-700"
              >
                See all {moreFromCompany.total.toLocaleString()} jobs at {job.company} →
              </Link>
            ) : undefined
          }
        />

        {/* ---------- Similar roles elsewhere ---------- */}
        <RelatedList heading="Similar roles at other companies" jobs={similarJobs} />
      </div>
    </main>
  );
}
