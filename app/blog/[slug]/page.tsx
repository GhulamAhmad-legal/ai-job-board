import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPosts, getPostMeta, AUTHOR, SHOW_AI_NOTE } from '../../lib/blogIndex';
import type { PostMeta } from '../../lib/blogIndex';
import { getPostHtml } from '../../lib/blog';
import { getJobsForWidget } from '../../lib/blogJobs';
import { siteConfig } from '../../lib/siteConfig';
import { getSiteUrl } from '../../lib/siteUrl';
import { jobPath } from '../../lib/jobSlug';
import { shortLocation } from '../../lib/locationLabel';

// Published articles are built ahead of time; scheduled ones appear on their date (checked hourly).
export const revalidate = 3600;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = getPostMeta(slug);
  if (!meta) return { title: `Article not found | ${siteConfig.name}`, robots: { index: false } };

  const title = `${meta.title} | ${siteConfig.name}`;
  const path = `/blog/${meta.slug}`;

  return {
    title,
    description: meta.description,
    alternates: { canonical: path },
    authors: [{ name: AUTHOR.name }],
    openGraph: {
      title,
      description: meta.description,
      url: path,
      siteName: siteConfig.name,
      type: 'article',
      publishedTime: meta.date,
      modifiedTime: meta.updated ?? meta.date,
      authors: [AUTHOR.name],
      images: [{ url: '/og-default.png', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', images: ['/og-default.png'] },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getPostMeta(slug);
  const body = meta ? getPostHtml(slug) : null;
  if (!meta || !body) notFound();

  const baseUrl = getSiteUrl();
  const minutes = Math.max(1, Math.round(body.words / 200));

  // Related articles: the ones chosen for this post (if published), topped up with the newest others
  const chosen = (meta.related ?? [])
    .map((s) => getPostMeta(s))
    .filter((p): p is PostMeta => !!p && p.slug !== meta.slug);
  const fillers = getPosts().filter((p) => p.slug !== meta.slug && !chosen.some((c) => c.slug === p.slug));
  const related = [...chosen, ...fillers].slice(0, 3);

  // Live openings for this article
  const widgets = (
    await Promise.all(
      (meta.jobs ?? []).map(async (w) => ({ heading: w.heading, jobs: await getJobsForWidget(w) }))
    )
  ).filter((w) => w.jobs.length > 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.updated ?? meta.date,
    mainEntityOfPage: `${baseUrl}/blog/${meta.slug}`,
    image: [`${baseUrl}/og-default.png`],
    author: { '@type': 'Person', name: AUTHOR.name, jobTitle: AUTHOR.role },
    publisher: { '@type': 'Organization', name: siteConfig.name },
  };

  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="max-w-[800px] mx-auto px-4 pt-8">
        <Link
          href="/blog"
          className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-bold text-[14px]"
        >
          ← All articles
        </Link>
      </div>

      <div className="max-w-[800px] mx-auto px-4 mt-4 flex flex-col gap-6">
        {/* ---------- The article ---------- */}
        <article className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-12 text-[17px] leading-relaxed text-gray-700 [&_h2]:text-[24px] [&_h2]:font-extrabold [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-[19px] [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_li]:mb-2 [&_a]:text-blue-600 [&_a]:underline [&_strong]:text-gray-900 [&_table]:w-full [&_table]:mb-6 [&_table]:text-[15px] [&_th]:text-left [&_th]:bg-gray-50 [&_th]:p-3 [&_th]:border [&_th]:border-gray-200 [&_td]:p-3 [&_td]:border [&_td]:border-gray-200 [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-300 [&_blockquote]:pl-4 [&_blockquote]:text-gray-600 [&_blockquote]:mb-5">
          <h1 className="text-[32px] md:text-[42px] font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
            {meta.title}
          </h1>
          <p className="text-[14px] text-gray-500 mb-8">
            By <span className="font-bold text-gray-700">{AUTHOR.name}</span>, {AUTHOR.role} · Published{' '}
            {formatDate(meta.date)}
            {meta.updated ? ` · Updated ${formatDate(meta.updated)}` : ''} · {minutes} min read
          </p>

          <div dangerouslySetInnerHTML={{ __html: body.html }} />
        </article>

        {/* ---------- Live openings ---------- */}
        {widgets.map((w) => (
          <section key={w.heading} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-[17px] font-extrabold text-gray-900">{w.heading}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {w.jobs.map((job) => {
                const hasSalary =
                  typeof job.salary_min === 'number' &&
                  typeof job.salary_max === 'number' &&
                  job.salary_min > 0 &&
                  job.salary_max >= job.salary_min;
                const location = shortLocation(job.location).label;
                return (
                  <Link
                    key={job.id}
                    href={jobPath(job)}
                    className="block px-6 py-4 hover:bg-blue-50/40 transition-colors"
                  >
                    <div className="text-[16px] font-bold text-gray-900">{job.title}</div>
                    <div className="text-[14px] text-gray-500 mt-0.5">
                      {job.company}
                      {location ? ` · ${location}` : ''}
                      {hasSalary ? ` · $${job.salary_min}K – $${job.salary_max}K` : ''}
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 text-[14px]">
              <Link href="/" className="font-bold text-blue-600 hover:text-blue-700">
                Browse all current jobs →
              </Link>
            </div>
          </section>
        ))}

        {/* ---------- Company links ---------- */}
        {meta.companies && (
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-[17px] font-extrabold text-gray-900 mb-4">{meta.companies.heading}</h2>
            <div className="flex flex-wrap gap-2">
              {meta.companies.names.map((name) => (
                <Link
                  key={name}
                  href={`/companies/${encodeURIComponent(name)}`}
                  className="text-[14px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full border border-indigo-100 transition-colors"
                >
                  {name}
                </Link>
              ))}
              <Link
                href="/companies"
                className="text-[14px] font-bold text-gray-700 bg-white hover:bg-gray-50 px-4 py-2 rounded-full border border-gray-300 transition-colors"
              >
                All companies →
              </Link>
            </div>
          </section>
        )}

        {/* ---------- Related articles ---------- */}
        {related.length > 0 && (
          <section>
            <h2 className="text-[17px] font-extrabold text-gray-900 mb-3 px-1">Keep reading</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-indigo-500 transition-all"
                >
                  <span className="text-[12px] font-bold text-indigo-700">{post.tags[0]}</span>
                  <h3 className="text-[16px] font-extrabold text-gray-900 mt-1 leading-snug">{post.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ---------- About the author ---------- */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <p className="text-[13px] font-bold uppercase tracking-wide text-gray-400 mb-2">About the author</p>
          <p className="text-[16px] text-gray-700 leading-relaxed">
            <span className="font-bold text-gray-900">{AUTHOR.name}</span> is a {AUTHOR.role.toLowerCase()} who
            builds and runs {siteConfig.name}, including the tools that collect and analyze the job listings
            behind these articles. Learn more on the{' '}
            <Link href="/about" className="text-blue-600 underline">
              About page
            </Link>
            .
          </p>
          {SHOW_AI_NOTE && (
            <p className="mt-4 text-[14px] italic text-gray-500">
              Drafted with AI assistance from {siteConfig.name} listing data. Reviewed and published by{' '}
              {AUTHOR.name}.
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] px-6 py-3 rounded-xl"
            >
              Browse current AI jobs
            </Link>
            <Link
              href="/companies"
              className="inline-block bg-white border border-gray-300 hover:border-blue-600 text-gray-800 font-bold text-[15px] px-6 py-3 rounded-xl"
            >
              See companies hiring
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
