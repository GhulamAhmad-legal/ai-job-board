import Link from "next/link";
import { siteConfig } from "../lib/siteConfig";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto shrink-0">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 font-medium">
        {/* Popular searches: crawlable links to the biggest landing pages */}
        <div className="mb-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/jobs" className="font-bold text-gray-700 hover:text-gray-900 transition">Find Jobs</Link>
          <Link href="/jobs/remote" className="hover:text-gray-900 transition">Remote Jobs</Link>
          <Link href="/jobs/san-francisco" className="hover:text-gray-900 transition">Jobs in San Francisco</Link>
          <Link href="/jobs/new-york" className="hover:text-gray-900 transition">Jobs in New York</Link>
          <Link href="/jobs/london" className="hover:text-gray-900 transition">Jobs in London</Link>
          <Link href="/jobs/machine-learning-engineer" className="hover:text-gray-900 transition">Machine Learning Engineer Jobs</Link>
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/about" className="hover:text-gray-900 transition">About</Link>
          <Link href="/companies" className="hover:text-gray-900 transition">Companies</Link>
          <Link href="/blog" className="hover:text-gray-900 transition">Blog</Link>
          <Link href="/contact" className="hover:text-gray-900 transition">Contact</Link>
          <Link href="/privacy" className="hover:text-gray-900 transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-900 transition">Terms of Service</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
