import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "About AIJobs | The Premier AI Job Board",
  description: "Learn about AIJobs, the premium destination for discovering remote careers in Artificial Intelligence, Machine Learning, and Data Science.",
};

export default function About() {
  return (
    <main className="min-h-[calc(100vh-65px)] bg-[#F5F6F8] font-sans py-12 px-4 md:py-16">
      <div className="max-w-[700px] mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        
        <div className="bg-[#00060C] px-8 py-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">About AIJobs</h1>
          <p className="text-gray-400 text-[16px] md:text-[18px] max-w-lg mx-auto">
            Connecting world-class talent with the companies building the future.
          </p>
        </div>
        
        <div className="p-8 md:p-12 prose prose-slate max-w-none text-gray-700 text-[15px] md:text-[16px] leading-relaxed prose-headings:font-extrabold prose-headings:text-gray-900 prose-headings:tracking-tight prose-strong:text-gray-900">
          <p>
            The artificial intelligence landscape is moving faster than any technological shift in history. From large language models to generative design, the demand for specialized engineering and research talent has never been higher. 
          </p>
          <p>
            <strong>AIJobs</strong> was created to cut through the noise of generic job boards. We focus exclusively on the AI sector, curating the highest-quality roles in machine learning, data science, prompt engineering, and AI product management from top-tier tech companies.
          </p>
          
          <h2 className="text-[22px] mt-8 mb-4">For Candidates</h2>
          <p>
            Stop sifting through thousands of irrelevant listings. Our platform automatically aggregates and filters the best AI roles, standardizing salary estimates and highlighting remote opportunities so you can find your next career leap instantly.
          </p>

          <h2 className="text-[22px] mt-8 mb-4">For Employers</h2>
          <p>
            Publishing a role on AIJobs puts your opening directly in front of a highly targeted, niche audience of AI professionals. We leverage advanced programmatic SEO and structured data to ensure your listings are visible exactly where top talent is searching.
          </p>

          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col items-center text-center">
            <Link href="/post-job" className="inline-block w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] px-10 py-4 rounded-xl transition-all shadow-sm hover:-translate-y-0.5">
              Post a Job for $299
            </Link>
            <Link href="/" className="block mt-5 text-[14px] font-bold text-gray-500 hover:text-blue-600 transition-colors">
              Return to active jobs
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}