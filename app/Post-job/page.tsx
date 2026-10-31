import Link from 'next/link';
import { siteConfig } from '../lib/siteConfig';

// The layout next to this file keeps the page out of Google. Replace this page when posting goes live.
export default function PostJob() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl p-8 md:p-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Employer job postings are coming soon
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-gray-600">
          {siteConfig.name} does not accept paid or featured job postings yet. The listings on the site are
          collected from employers’ own career pages.
        </p>
        <p className="mt-3 text-[16px] leading-relaxed text-gray-600">
          If you would like to hear when employer postings open, or you want a listing about your company
          corrected or removed, please get in touch.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] px-6 py-3 rounded-xl"
          >
            Contact us
          </Link>
          <Link
            href="/companies"
            className="inline-block bg-white border border-gray-300 hover:border-blue-600 text-gray-800 font-bold text-[15px] px-6 py-3 rounded-xl"
          >
            Browse companies
          </Link>
        </div>
      </div>
    </main>
  );
}
