import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "About CoreTechRoles | The Premier Tech & AI Job Board",
  description: "Learn about CoreTechRoles — a focused job board connecting AI, Machine Learning, and Data Science professionals with top companies. Discover how we curate roles and who runs the platform.",
};

export default function About() {
  return (
    <main className="min-h-[calc(100vh-65px)] bg-[#F5F6F8] font-sans py-12 px-4 md:py-16">
      <div className="max-w-[700px] mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#00060C] px-8 py-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
            About CoreTechRoles
          </h1>
          <p className="text-gray-400 text-[16px] md:text-[18px] max-w-lg mx-auto">
            Connecting world-class talent with the companies building the future of Artificial Intelligence.
          </p>
        </div>
        
        {/* Content */}
        <div className="p-8 md:p-12 prose prose-slate max-w-none text-gray-700 text-[15px] md:text-[16px] leading-relaxed prose-headings:font-extrabold prose-headings:text-gray-900 prose-headings:tracking-tight prose-strong:text-gray-900">
          
          <p>
            The artificial intelligence industry is evolving faster than any technological shift in history. From large language models and generative AI to autonomous systems and data infrastructure, companies are competing intensely for specialized talent. Yet most job seekers still waste hours filtering through irrelevant listings on generic job boards.
          </p>

          <p>
            <strong>CoreTechRoles</strong> was built to solve this problem. We are a focused job board dedicated exclusively to Artificial Intelligence, Machine Learning, Data Science, and related roles. Our goal is simple: help talented professionals find high-quality AI opportunities faster, and help companies reach the right candidates more effectively.
          </p>

          <h2 className="text-[22px] mt-10 mb-4">Our Mission</h2>
          <p>
            We believe that the people building the next generation of AI systems deserve a better way to discover opportunities. CoreTechRoles exists to cut through the noise and surface only relevant, high-quality roles from reputable companies in the AI ecosystem.
          </p>

          <h2 className="text-[22px] mt-10 mb-4">How We Source Jobs</h2>
          <p>
            We collect publicly available job listings directly from company career pages and official job postings. Every listing is organized, categorized, and presented with clear information such as location, salary range (when available), and employment type. We do not invent or alter job descriptions — we simply make them easier to find and compare.
          </p>
          <p>
            When you click “Apply”, you are taken directly to the employer’s official application page. We do not collect applications or intermediate between candidates and companies.
          </p>

          <h2 className="text-[22px] mt-10 mb-4">For Candidates</h2>
          <p>
            Instead of scrolling through thousands of unrelated jobs, you can browse a carefully curated collection of AI and Machine Learning roles. We highlight remote opportunities, standardize salary information where possible, and make it easy to filter by company or role type so you can focus on opportunities that match your skills and goals.
          </p>

          <h2 className="text-[22px] mt-10 mb-4">For Employers</h2>
          <p>
            Posting a role on CoreTechRoles places your opening in front of a highly targeted audience of AI professionals actively looking for their next opportunity. We use structured data and programmatic SEO to help your listings reach the right people searching for AI careers.
          </p>

          <h2 className="text-[22px] mt-10 mb-4">Who Runs CoreTechRoles</h2>
          <p>
            CoreTechRoles is operated by <strong>Ghulam Ahmad</strong>. The platform was created to serve the growing community of AI practitioners, researchers, and engineers. If you have questions, feedback, or need a listing corrected or removed, you can reach us anytime at <a href="mailto:ghulam.ahmad2@gmail.com" className="text-blue-600 hover:underline font-medium">ghulam.ahmad2@gmail.com</a> or through our <Link href="/contact" className="text-blue-600 hover:underline font-medium">Contact page</Link>.
          </p>

          <h2 className="text-[22px] mt-10 mb-4">Transparency & Trust</h2>
          <p>
            We are committed to running a transparent and trustworthy platform. You can review our full <Link href="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link> and <Link href="/terms" className="text-blue-600 hover:underline font-medium">Terms of Service</Link> at any time. We never sell personal data, and we only display information that is already publicly available from employers.
          </p>

          {/* CTA Section */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center text-center">
            <Link 
              href="/post-job" 
              className="inline-block w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] px-10 py-4 rounded-xl transition-all shadow-sm hover:-translate-y-0.5"
            >
              Post a Job for $299
            </Link>
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