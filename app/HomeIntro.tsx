import Link from 'next/link';
import { siteConfig } from './lib/siteConfig';
import { getLandingCounts } from './lib/landingData';
import { getLandingPage, landingLinkLabel, MIN_JOBS } from './lib/landingPages';

// Plain text below the job feed: what the site is, what it covers, and links to the main sections.
// Gives the home page words to rank on and quote, and crawlable links to the search pages.
export default async function HomeIntro({ total }: { total: number }) {
  const counts = await getLandingCounts();
  const hubs = counts
    .filter((c) => c.count >= MIN_JOBS)
    .map((c) => ({ ...getLandingPage(c.slug)!, count: c.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <section className="max-w-[1152px] mx-auto px-4 py-14">
      <div className="max-w-3xl">
        <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight">About {siteConfig.name}</h2>
        <p className="mt-3 text-[16px] text-gray-600 leading-relaxed">
          {siteConfig.name} is a job board for AI and technology companies.
          {total > 0 ? ` It currently lists ${total.toLocaleString('en-US')} open roles` : ' It lists open roles'} taken
          from employers’ own career pages, with the location, the pay when the employer states it, and a direct link to
          apply on the employer’s site.
        </p>
        <p className="mt-3 text-[16px] text-gray-600 leading-relaxed">
          Browse by{' '}
          <Link href="/jobs" className="font-bold text-blue-600 hover:text-blue-700">
            location and role
          </Link>
          , see the{' '}
          <Link href="/companies" className="font-bold text-blue-600 hover:text-blue-700">
            companies that are hiring
          </Link>
          , or read the{' '}
          <Link href="/blog" className="font-bold text-blue-600 hover:text-blue-700">
            data articles
          </Link>{' '}
          on pay, remote work and who is hiring.
        </p>

        {hubs.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {hubs.map((p) => (
              <Link
                key={p.slug}
                href={`/jobs/${p.slug}`}
                className="text-[13px] font-bold text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
              >
                {landingLinkLabel(p)} <span className="font-medium text-gray-400">{p.count.toLocaleString('en-US')}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
