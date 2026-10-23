import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '../lib/siteConfig';

const title = `About ${siteConfig.name} | AI & Tech Job Board`;
const description = `${siteConfig.name} is a job board for AI and technology companies. See where the listings come from, how they are organized, and who runs the site.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/about' },
  openGraph: {
    title,
    description,
    url: '/about',
    type: 'website',
    siteName: siteConfig.name,
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-default.png'] },
};

export default function About() {
  return (
    <main className="min-h-[calc(100vh-65px)] bg-[#F5F6F8] font-sans py-12 px-4 md:py-16">
      <div className="max-w-[700px] mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Header */}
        <div className="bg-[#00060C] px-8 py-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
            About {siteConfig.name}
          </h1>
          <p className="text-gray-400 text-[16px] md:text-[18px] max-w-lg mx-auto">
            A job board for AI and technology companies, built from employers’ own career pages.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12 prose prose-slate max-w-none text-gray-700 text-[15px] md:text-[16px] leading-relaxed prose-headings:font-extrabold prose-headings:text-gray-900 prose-headings:tracking-tight prose-strong:text-gray-900">

          <p>
            Roles in artificial intelligence and machine learning are spread across the career pages of
            many different companies. <strong>{siteConfig.name}</strong> collects them in one place so
            you can search and compare them without visiting each site.
          </p>

          <p>
            The site covers AI and technology companies, from frontier AI labs to infrastructure and
            developer-tools companies. It lists engineering, research and data roles, and it also
            includes other positions that these employers advertise, such as product, design and
            operations. Roles are labeled “AI” only when the job title points to AI or machine learning
            work.
          </p>

          <h2 className="text-[22px] mt-10 mb-4">How we source jobs</h2>
          <p>
            We read the public job boards of dozens of AI and technology companies and keep our listings
            in sync with them. When an employer removes a job, we close it on our site too. Job
            descriptions keep the employer’s own wording. We only tidy them, for example by removing
            legal footers and recruiter codes, and we never rewrite or invent job details.
          </p>
          <p>
            Pay is shown only when the employer states a range. Roles are marked remote only when the
            listing says they are fully remote. You can read the details in{' '}
            <Link href="/blog/how-we-collect-and-label-job-listings" className="text-blue-600 hover:underline font-medium">
              how we collect and label job listings
            </Link>
            , including what the data does and does not cover.
          </p>
          <p>
            When you click “Apply”, you go directly to the employer’s official application page. We do
            not collect applications or act as a go-between for candidates and companies.
          </p>

          <h2 className="text-[22px] mt-10 mb-4">For candidates</h2>
          <p>
            You can browse all current listings, or start from a{' '}
            <Link href="/jobs" className="text-blue-600 hover:underline font-medium">location or role</Link>
            {' '}or look at a specific{' '}
            <Link href="/companies" className="text-blue-600 hover:underline font-medium">company</Link>
            . Where employers publish pay, it is shown on the listing, and you can filter for remote
            roles and set up an email alert for the searches you care about.
          </p>

          <h2 className="text-[22px] mt-10 mb-4">For employers</h2>
          <p>
            We plan to let employers post roles directly, but that is not open yet. If you would like to
            hear when it is, or have a question about your company’s listings, please{' '}
            <Link href="/contact" className="text-blue-600 hover:underline font-medium">contact us</Link>.
            Your jobs may already appear here if they are on your public career page, and if you want one
            corrected or removed, just send us the link.
          </p>

          <h2 className="text-[22px] mt-10 mb-4">Who runs {siteConfig.name}</h2>
          <p>
            {siteConfig.name} is operated by <strong>Ghulam Ahmad</strong>, a software engineer, who built
            the site and the tools that collect and organize the listings. If you have questions or
            feedback, or need a listing corrected or removed, you can reach us at{' '}
            <a href={`mailto:${siteConfig.contactEmail}`} className="text-blue-600 hover:underline font-medium">
              {siteConfig.contactEmail}
            </a>{' '}
            or through our{' '}
            <Link href="/contact" className="text-blue-600 hover:underline font-medium">Contact page</Link>.
          </p>

          <h2 className="text-[22px] mt-10 mb-4">Transparency &amp; trust</h2>
          <p>
            You can review our full{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>{' '}
            and{' '}
            <Link href="/terms" className="text-blue-600 hover:underline font-medium">Terms of Service</Link>{' '}
            at any time. We do not sell personal data, and the job information we display is already
            public on employers’ own websites.
          </p>

          {/* CTA Section */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center text-center">
            <span
              aria-disabled="true"
              className="inline-block w-full sm:w-auto bg-gray-100 text-gray-500 border border-gray-200 font-bold text-[15px] px-10 py-4 rounded-xl cursor-not-allowed select-none"
            >
              Post a Job: coming soon
            </span>
            <Link
              href="/"
              className="block mt-5 text-[14px] font-bold text-gray-500 hover:text-blue-600 transition-colors"
            >
              Browse active AI jobs →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
