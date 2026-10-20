import { siteConfig } from '../lib/siteConfig';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts } from '../lib/blogIndex';

// Re-check once an hour so scheduled posts appear on their date.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Blog | ${siteConfig.name}`,
  description: `Guides and data about AI and machine learning jobs, drawn from the listings on ${siteConfig.name}.`,
  alternates: { canonical: '/blog' },
  openGraph: {
    title: `Blog | ${siteConfig.name}`,
    description: `Guides and data about AI and machine learning jobs, drawn from the listings on ${siteConfig.name}.`,
    url: '/blog',
    siteName: siteConfig.name,
    type: 'website',
  },
};

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default function BlogIndex() {
  const posts = getPosts();

  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans pb-24">
      <div className="max-w-[800px] mx-auto px-4 mt-14 mb-10">
        <h1 className="text-[40px] md:text-[48px] font-black text-gray-900 tracking-tight mb-3">Blog</h1>
        <p className="text-[18px] text-gray-500 font-medium">
          Guides and data about AI and machine learning jobs, drawn from the listings on {siteConfig.name}.
        </p>
      </div>

      <div className="max-w-[800px] mx-auto px-4 flex flex-col gap-5">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block group bg-white border border-gray-200 rounded-2xl p-7 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[12px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-[22px] font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
              {post.title}
            </h2>
            <p className="text-[15px] text-gray-600 leading-relaxed mb-4">{post.description}</p>
            <p className="text-[13px] text-gray-400 font-medium">{formatDate(post.date)}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
