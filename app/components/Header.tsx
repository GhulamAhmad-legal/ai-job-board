'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '../lib/siteConfig';

const links = [
  { href: '/', label: 'Find Jobs', isActive: (p: string) => p === '/' },
  { href: '/jobs', label: 'Browse', isActive: (p: string) => p.startsWith('/jobs') },
  { href: '/companies', label: 'Companies', isActive: (p: string) => p.startsWith('/companies') },
  { href: '/blog', label: 'Blog', isActive: (p: string) => p.startsWith('/blog') },
  { href: '/about', label: 'About', isActive: (p: string) => p === '/about' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1152px] mx-auto px-4">
        <div className="flex justify-between items-center h-[65px]">

          <div className="flex items-center h-full">
            <Link href="/" className="flex-shrink-0 flex items-center mr-8">
              <span className="text-[22px] font-black tracking-tighter text-blue-600">
                {siteConfig.logoLeft}<span className="text-[#00060C]">{siteConfig.logoRight}</span>
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex space-x-8 h-full">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-[3px] text-[15px] font-bold transition-all duration-200 ${
                    link.isActive(pathname)
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-blue-600 hover:border-blue-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/contact" className="text-[14px] font-bold text-gray-500 hover:text-blue-600 transition-colors duration-200">
              Contact
            </Link>
            <Link href="/post-job" className="bg-[#00060C] text-white px-5 py-2.5 rounded-lg text-[14px] font-bold hover:bg-blue-600 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
              Post a Job — $299
            </Link>
          </div>

        </div>

        {/* Mobile links (the desktop links above are hidden on phones) */}
        <div className="md:hidden flex items-center gap-6 overflow-x-auto h-11 border-t border-gray-100 -mx-4 px-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 text-[14px] font-bold ${
                link.isActive(pathname) ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
