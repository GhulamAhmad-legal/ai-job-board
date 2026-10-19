import Link from "next/link";
import { siteConfig } from "../lib/siteConfig";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto shrink-0">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 font-medium">
        <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/about" className="hover:text-gray-900 transition">About</Link>
          <Link href="/companies" className="hover:text-gray-900 transition">Companies</Link>
          <Link href="/blog" className="hover:text-gray-900 transition">Blog</Link>
          <Link href="/contact" className="hover:text-gray-900 transition">Contact</Link>
          <Link href="/privacy" className="hover:text-gray-900 transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-900 transition">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
