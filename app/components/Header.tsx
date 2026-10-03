export default function Header() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-[65px]">
      <div className="max-w-[1152px] mx-auto px-4 h-full">
        <div className="flex justify-between items-center h-full">
          
          <div className="flex items-center h-full">
            {/* Swapped to standard <a> tags for bulletproof routing */}
            <a href="/" className="flex-shrink-0 flex items-center mr-8">
              <span className="text-[22px] font-black tracking-tighter text-blue-600">
                AI<span className="text-[#00060C]">Jobs</span>
              </span>
            </a>
            <div className="hidden md:flex space-x-8 h-full">
              <a href="/" className="text-blue-600 inline-flex items-center px-1 pt-1 border-b-[3px] border-blue-600 text-[15px] font-bold">
                Find Jobs
              </a>
              <a href="/companies" className="text-gray-500 hover:text-blue-600 hover:border-blue-600 inline-flex items-center px-1 pt-1 border-b-[3px] border-transparent text-[15px] font-bold transition-all duration-200">
                Companies
              </a>
              <a href="/about" className="text-gray-500 hover:text-blue-600 hover:border-blue-600 inline-flex items-center px-1 pt-1 border-b-[3px] border-transparent text-[15px] font-bold transition-all duration-200">
                About
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <a href="/contact" className="text-[14px] font-bold text-gray-500 hover:text-blue-600 transition-colors duration-200">
              Contact
            </a>
            <a href="/post-job" className="bg-[#00060C] text-white px-5 py-2.5 rounded-lg text-[14px] font-bold hover:bg-blue-600 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
              Post a Job — $299
            </a>
          </div>

        </div>
      </div>
    </nav>
  );
}