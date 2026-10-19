import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPosts, getPostMeta } from '../../lib/blogIndex';
import { getPostHtml } from '../../lib/blog';
import { siteConfig } from '../../lib/siteConfig';
import { getSiteUrl } from '../../lib/siteUrl';

// Only the articles listed in blogIndex.ts exist; everything is built ahead of time.
export const dynamicParams = false;

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
    openGraph: {
      title,
      description: meta.description,
      url: path,
      siteName: siteConfig.name,
      type: 'article',
      publishedTime: meta.date,
      modifiedTime: meta.updated ?? meta.date,
    },
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.updated ?? meta.date,
    mainEntityOfPage: `${baseUrl}/blog/${meta.slug}`,
    author: { '@type': 'Person', name: siteConfig.ownerName },
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

      <div className="max-w-[800px] mx-auto px-4 mt-4">
        <article className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-12 text-[17px] leading-relaxed text-gray-700 [&_h2]:text-[24px] [&_h2]:font-extrabold [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-[19px] [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_li]:mb-2 [&_a]:text-blue-600 [&_a]:underline [&_strong]:text-gray-900 [&_table]:w-full [&_table]:mb-6 [&_table]:text-[15px] [&_th]:text-left [&_th]:bg-gray-50 [&_th]:p-3 [&_th]:border [&_th]:border-gray-200 [&_td]:p-3 [&_td]:border [&_td]:border-gray-200 [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-300 [&_blockquote]:pl-4 [&_blockquote]:text-gray-600 [&_blockquote]:mb-5">
          <h1 className="text-[32px] md:text-[42px] font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
            {meta.title}
          </h1>
          <p className="text-[14px] text-gray-500 mb-8">
            By {siteConfig.ownerName} · Published {formatDate(meta.date)}
            {meta.updated ? ` · Updated ${formatDate(meta.updated)}` : ''} · {minutes} min read
          </p>

          <div dangerouslySetInnerHTML={{ __html: body.html }} />

          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-3">
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
        </article>
      </div>
    </main>
  );
}
