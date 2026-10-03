'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-[65px]">
      <div className="max-w-[1152px] mx-auto px-4 h-full">
        <div className="flex justify-between items-center h-full">
          
          <div className="flex items-center h-full">
            <Link href="/" className="flex-shrink-0 flex items-center mr-8">
              <span className="text-[22px] font-black tracking-tighter text-blue-600">
                AI<span className="text-[#00060C]">Jobs</span>
              </span>
            </Link>
            
            <div className="hidden md:flex space-x-8 h-full">
              {/* FIND JOBS LINK */}
              <Link 
                href="/" 
                className={`inline-flex items-center px-1 pt-1 border-b-[3px] text-[15px] font-bold transition-all duration-200 ${
                  pathname === '/' 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-500 border-transparent hover:text-blue-600 hover:border-blue-600'
                }`}
              >
                Find Jobs
              </Link>
              
              {/* COMPANIES LINK */}
              <Link 
                href="/companies" 
                className={`inline-flex items-center px-1 pt-1 border-b-[3px] text-[15px] font-bold transition-all duration-200 ${
                  pathname.startsWith('/companies')
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-500 border-transparent hover:text-blue-600 hover:border-blue-600'
                }`}
              >
                Companies
              </Link>
              
              {/* ABOUT LINK */}
              <Link 
                href="/about" 
                className={`inline-flex items-center px-1 pt-1 border-b-[3px] text-[15px] font-bold transition-all duration-200 ${
                  pathname === '/about'
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-500 border-transparent hover:text-blue-600 hover:border-blue-600'
                }`}
              >
                About
              </Link>
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
      </div>
    </nav>
  );
}