import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '../lib/siteConfig';
import { getLandingPage, MIN_JOBS } from '../lib/landingPages';
import { getLandingCounts } from '../lib/landingData';

export const revalidate = 3600;

const title = `Browse AI and Tech Jobs by Location and Role | ${siteConfig.name}`;
const description =
  'Browse open AI, machine learning and engineering jobs by city, by role, or fully remote, with pay and direct apply links.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/jobs' },
  openGraph: { title, description, url: '/jobs', type: 'website', siteName: siteConfig.name },
};

export default async function JobsIndex() {
  const counts = await getLandingCounts();
  const live = counts
    .filter((c) => c.count >= MIN_JOBS)
    .map((c) => ({ ...getLandingPage(c.slug)!, count: c.count }));

  const sections = [
    { heading: 'Remote', items: live.filter((p) => p.kind === 'remote'), label: () => 'Remote AI and tech jobs' },
    {
      heading: 'Popular searches',
      items: live.filter((p) => p.kind === 'topic').sort((a, b) => b.count - a.count),
      label: (name: string) => `${name} jobs`,
    },
    {
      heading: 'By location',
      items: live.filter((p) => p.kind === 'location').sort((a, b) => b.count - a.count),
      label: (name: string) => `Jobs in ${name}`,
    },
    {
      heading: 'By role',
      items: live.filter((p) => p.kind === 'role').sort((a, b) => b.count - a.count),
      label: (name: string) => `${name} jobs`,
    },
  ];

  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans pb-24 text-[#181818]">
      <div className="max-w-[1152px] mx-auto px-4 mt-16 mb-10 text-center md:text-left">
        <h1 className="text-[36px] md:text-[44px] font-black text-gray-900 tracking-tight mb-4">
          Browse Jobs
        </h1>
        <p className="text-[18px] text-gray-500 font-medium max-w-2xl">
          Open AI, machine learning and engineering roles on {siteConfig.name}, grouped by location, role and
          remote work.
        </p>
      </div>

      <div className="max-w-[1152px] mx-auto px-4 space-y-10">
        {sections
          .filter((s) => s.items.length > 0)
          .map((section) => (
            <section key={section.heading}>
              <h2 className="text-[20px] font-extrabold text-gray-900 mb-4">{section.heading}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/jobs/${p.slug}`}
                    className="group bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm hover:shadow-lg hover:border-indigo-500 transition-all flex items-center justify-between gap-3"
                  >
                    <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {section.label(p.name)}
                    </span>
                    <span className="text-[13px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 shrink-0">
                      {p.count.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
      </div>
    </main>
  );
}
