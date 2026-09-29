'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState, useRef } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function decodeHtml(html: string) {
  if (!html) return '';
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function getEstimatedSalary(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes('fellow') || lower.includes('intern')) return { min: 90, max: 130, median: 110 };
  if (lower.includes('lead') || lower.includes('director') || lower.includes('manager')) return { min: 180, max: 275, median: 220 };
  if (lower.includes('research') || lower.includes('scientist') || lower.includes('security')) return { min: 160, max: 245, median: 195 };
  return { min: 130, max: 195, median: 160 };
}

export default function Home() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeJob, setActiveJob] = useState<any | null>(null);
  
  // Search State
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  
  // Filter States - Defaulting Remote to false so you see all 600+ jobs!
  const [remoteOnly, setRemoteOnly] = useState(false); 
  const [easyApplyOnly, setEasyApplyOnly] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('Any time');
  const [selectedRating, setSelectedRating] = useState('Any');
  const [selectedSort, setSelectedSort] = useState('Most relevant');
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  
  // Modal State
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertSubmitted, setAlertSubmitted] = useState(false);

  const descriptionScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active') // Only show active jobs!
        .order('created_at', { ascending: false });

      if (data && !error) {
        setJobs(data);
        setActiveJob(data[0] || null);
      }
    }
    fetchJobs();
  }, []);

  const handleJobClick = (job: any) => {
    setActiveJob(job);
    if (descriptionScrollRef.current) {
      descriptionScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleSaveJob = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setSavedJobIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // 🧠 THE BRAIN: This handles ALL filters, searches, and sorting simultaneously
  const filteredJobs = jobs.filter(job => {
    // 1. Text Search (Title or Company)
    const matchesTitle = searchTitle === '' ? true : (
      job.title.toLowerCase().includes(searchTitle.toLowerCase()) || 
      job.company.toLowerCase().includes(searchTitle.toLowerCase())
    );
    
    // 2. Location Search
    const matchesLocation = searchLocation === '' ? true : (
      job.location.toLowerCase().includes(searchLocation.toLowerCase())
    );

    // 3. Remote Toggle
    const matchesRemote = remoteOnly ? job.location.toLowerCase().includes('remote') : true;

    // 4. Easy Apply (Mocked: Assumes jobs with "Engineer" in title are Easy Apply for testing)
    const matchesEasyApply = easyApplyOnly ? job.title.toLowerCase().includes('engineer') : true;

    // 5. Date Posted
    let matchesDate = true;
    if (selectedDate !== 'Any time' && job.created_at) {
      const jobDate = new Date(job.created_at);
      const now = new Date();
      const diffDays = (now.getTime() - jobDate.getTime()) / (1000 * 3600 * 24);
      
      if (selectedDate === 'Last day') matchesDate = diffDays <= 1;
      if (selectedDate === 'Last 3 days') matchesDate = diffDays <= 3;
      if (selectedDate === 'Last week') matchesDate = diffDays <= 7;
      if (selectedDate === 'Last 2 weeks') matchesDate = diffDays <= 14;
      if (selectedDate === 'Last month') matchesDate = diffDays <= 30;
    }

    // 6. Company Rating (Mocking rating mathematically based on company name length for testing)
    let matchesRating = true;
    if (selectedRating !== 'Any') {
      const ratingNum = parseFloat(selectedRating); 
      const mockRating = 3.0 + (job.company.length % 3); // Assigns a consistent 3, 4, or 5
      matchesRating = mockRating >= ratingNum;
    }

    return matchesTitle && matchesLocation && matchesRemote && matchesEasyApply && matchesDate && matchesRating;
  }).sort((a, b) => {
    // 7. Sorting Logic
    if (selectedSort === 'Most recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0; // Default: 'Most relevant' keeps database order
  });

  const salary = activeJob ? getEstimatedSalary(activeJob.title) : { min: 120, max: 180, median: 150 };

  return (
    <main className="h-[calc(100vh-65px)] flex flex-col bg-[#F5F6F8] overflow-hidden text-[#181818] font-sans">
      
      {/* Centered Search Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm z-30 shrink-0 relative">
        <div className="max-w-[1152px] mx-auto px-4 pt-5 pb-3 flex flex-col items-center">
          
          <div className="flex w-full items-center justify-center gap-3 relative">
            <div className="w-full max-w-[800px] flex flex-col md:flex-row items-stretch border border-gray-300 rounded-full overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent transition-all duration-300 bg-[#F5F6F8]">
              
              <div className="flex-1 flex items-center px-5 py-2.5 border-b md:border-b-0 md:border-r border-gray-200 bg-white group">
                <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Find your perfect job"
                  className="w-full text-[15px] font-medium text-gray-900 outline-none placeholder:text-gray-400 bg-transparent"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                />
              </div>

              <div className="flex-1 flex items-center px-5 py-2.5 bg-white group">
                <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="City, state, zipcode, or &quot;remote&quot;"
                  className="w-full text-[15px] font-medium text-gray-900 outline-none placeholder:text-gray-400 bg-transparent"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-5">
            <div className="flex items-center gap-2">
              <button onClick={() => setEasyApplyOnly(!easyApplyOnly)} className={`px-4 py-1.5 text-[13px] font-bold rounded-full border transition-all cursor-pointer ${easyApplyOnly ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm'}`}>Easy Apply only</button>
              <button onClick={() => setRemoteOnly(!remoteOnly)} className={`px-4 py-1.5 text-[13px] font-bold rounded-full border transition-all cursor-pointer ${remoteOnly ? 'bg-blue-50 text-blue-700 border-blue-500 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm'}`}>Remote only</button>
              
              <div className="relative">
                <button onClick={() => setActiveDropdown(activeDropdown === 'rating' ? null : 'rating')} className={`px-4 py-1.5 text-[13px] font-bold rounded-full border transition-all cursor-pointer flex items-center ${activeDropdown === 'rating' || selectedRating !== 'Any' ? 'bg-blue-50 text-blue-700 border-blue-500 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm'}`}>
                  Company rating {activeDropdown === 'rating' ? '▴' : '▾'}
                </button>
                {activeDropdown === 'rating' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                        <span className="font-extrabold text-[13px] text-gray-500 uppercase tracking-wider">Company rating</span>
                        <button onClick={() => setActiveDropdown(null)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">✕</button>
                      </div>
                      {['Any', '4.0', '3.0', '2.0'].map(stars => (
                        <div key={stars} onClick={() => { setSelectedRating(stars); setActiveDropdown(null); }} className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center text-[15px] font-medium text-gray-700 transition-colors group">
                          <span className="flex items-center group-hover:text-blue-600">{stars} {stars !== 'Any' && <><span className="text-amber-400 ml-1 text-sm">★</span><span className="ml-1 text-sm text-gray-500 group-hover:text-blue-500">and up</span></>}</span>
                          {selectedRating === stars && <span className="text-blue-600 font-bold">✓</span>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="relative hidden sm:block">
                <button onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')} className={`px-4 py-1.5 text-[13px] font-bold rounded-full border transition-all cursor-pointer flex items-center ${activeDropdown === 'date' || selectedDate !== 'Any time' ? 'bg-blue-50 text-blue-700 border-blue-500 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm'}`}>
                  Date posted {activeDropdown === 'date' ? '▴' : '▾'}
                </button>
                {activeDropdown === 'date' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                        <span className="font-extrabold text-[13px] text-gray-500 uppercase tracking-wider">Date posted</span>
                        <button onClick={() => setActiveDropdown(null)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">✕</button>
                      </div>
                      {['Any time', 'Last day', 'Last 3 days', 'Last week', 'Last 2 weeks', 'Last month'].map(time => (
                        <div key={time} onClick={() => { setSelectedDate(time); setActiveDropdown(null); }} className="px-5 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center text-[15px] font-medium text-gray-700 hover:text-blue-600 transition-colors">
                          {time}
                          {selectedDate === time && <span className="text-blue-600 font-bold">✓</span>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <button onClick={() => setShowAlertModal(true)} className="flex items-center text-[13px] font-bold text-gray-500 hover:text-blue-600 transition-colors cursor-pointer group">
              <svg className="w-4 h-4 mr-1.5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Create job alert
            </button>
          </div>
        </div>
      </div>

      {/* Main Dual-Pane Content View */}
      <div className="flex-1 max-w-[1152px] w-full mx-auto px-4 flex gap-4 min-h-0 bg-[#F5F6F8] py-4">
        
        {/* Left Column: Job List */}
        <div className="w-full lg:w-[390px] flex flex-col bg-white border border-gray-200 rounded-xl shrink-0 overflow-hidden shadow-sm">
          
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white z-10">
            <span className="text-[13px] font-bold text-gray-500">
              {filteredJobs.length} {searchTitle ? `results for "${searchTitle}"` : 'jobs'}
            </span>
            
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
                className={`text-[13px] font-bold text-gray-700 hover:text-blue-600 cursor-pointer flex items-center rounded-md px-2 py-1 transition-all ${
                  activeDropdown === 'sort' ? 'text-blue-600 bg-blue-50' : 'bg-transparent'
                }`}
              >
                {selectedSort} 
                <svg className={`w-3.5 h-3.5 ml-1 transition-transform ${activeDropdown === 'sort' ? 'rotate-180 text-blue-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {activeDropdown === 'sort' && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {['Most recent', 'Most relevant'].map(sort => (
                      <div 
                        key={sort} 
                        onClick={() => { setSelectedSort(sort); setActiveDropdown(null); }} 
                        className="px-5 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center text-[14px] font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        {sort}
                        {selectedSort === sort && <span className="text-blue-600 font-bold">✓</span>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-white [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            {filteredJobs.length === 0 ? (
              <div className="p-6">
                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-4 text-center">
                   <span className="text-blue-600 text-2xl mb-2 block">🔍</span>
                   <p className="text-[14px] text-gray-700 font-medium">
                     Your filters returned no results. Try adjusting them!
                   </p>
                 </div>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const jobSal = { min: job.salary_min || 100, max: job.salary_max || 150 };
                const isSelected = activeJob?.id === job.id;
                const isSaved = savedJobIds.includes(job.id);
                const mockRating = 3.0 + (job.company.length % 3);

                return (
                  <div 
                    key={job.id} 
                    onClick={() => handleJobClick(job)}
                    className={`px-5 py-4 cursor-pointer transition-all duration-200 relative border-b border-gray-100 last:border-b-0 group overflow-hidden ${
                      isSelected 
                        ? 'bg-blue-50/60 z-10 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-blue-600 before:rounded-r-md' 
                        : 'bg-white hover:bg-blue-50/30 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-transparent hover:before:bg-blue-400 before:rounded-r-md before:transition-all'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5 mb-2">
                        {/* 🛠️ IMAGE FALLBACK LOGIC ADDED HERE */}
                        <div className="w-[32px] h-[32px] border border-gray-200 rounded-lg flex items-center justify-center bg-white shadow-sm overflow-hidden text-gray-900 font-black text-[11px]">
                          {job.company_logo_url ? (
                            <img 
                              src={job.company_logo_url} 
                              alt={job.company} 
                              className="w-full h-full object-contain p-0.5" 
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.innerText = job.company.slice(0, 2).toUpperCase();
                                }
                              }}
                            />
                          ) : (
                            job.company.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <span className="text-[13px] font-bold text-gray-800">{job.company}</span>
                        <span className="text-[12px] font-bold text-gray-500 flex items-center bg-gray-100 px-1.5 py-0.5 rounded">
                          {mockRating}.0 <span className="text-amber-400 ml-0.5 text-[10px]">★</span>
                        </span>
                      </div>
                      
                      <button 
                        onClick={(e) => toggleSaveJob(e, job.id)} 
                        className={`cursor-pointer transition-all hover:scale-110 ${isSaved ? 'text-blue-600' : 'text-gray-300 hover:text-gray-400'}`}
                      >
                        <svg className={`w-[22px] h-[22px] ${isSaved ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isSaved ? 0 : 2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>
                    
                    <h2 className={`text-[16px] font-extrabold leading-snug mb-1.5 pr-4 transition-colors duration-200 ${isSelected ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'}`}>
                      {job.title}
                    </h2>
                    
                    <p className="text-[13px] text-gray-500 font-medium truncate mb-1">{job.location.split(';')[0]}</p>
                    <p className="text-[13px] text-gray-900 font-bold mb-0">
                      ${jobSal.min}K -${jobSal.max}K <span className="text-gray-400 font-medium text-[12px]">/yr est.</span>
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column wrapper */}
        <div className="hidden lg:block flex-1 min-w-0 relative">
          <div 
            ref={descriptionScrollRef} 
            className="absolute inset-0 overflow-y-auto pr-3 [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
          >
            {activeJob ? (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col min-h-full transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
                
                <div className="px-8 py-7 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-[40px] h-[40px] border border-gray-200 rounded-xl flex items-center justify-center bg-white shadow-sm overflow-hidden text-gray-900 font-black text-[14px]">
                        {activeJob.company_logo_url ? (
                          <img 
                            src={activeJob.company_logo_url} 
                            alt={activeJob.company} 
                            className="w-full h-full object-contain p-1" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerText = activeJob.company.slice(0, 2).toUpperCase();
                              }
                            }}
                          />
                        ) : (
                          activeJob.company.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <span className="text-[16px] font-bold text-gray-900">{activeJob.company}</span>
                      <span className="text-[13px] font-bold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        {3.0 + (activeJob.company.length % 3)}.0 <span className="text-amber-400 text-[10px]">★</span>
                      </span>
                    </div>
                  </div>

                  <h1 className="text-[26px] font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
                    {activeJob.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg text-[13px] font-bold flex items-center border border-amber-100">
                      <span className="mr-1.5 text-amber-500 text-sm">🏆</span> Best Places to Work
                    </span>
                    <span className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-[13px] font-bold border border-gray-100">
                      {activeJob.location.split(';')[0]}
                    </span>
                    <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-[13px] font-bold border border-green-100">
  ${activeJob.salary_min || 100}K – ${activeJob.salary_max || 150}K <span className="font-medium opacity-80">/yr</span>
</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <a 
                      href={activeJob.apply_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] px-8 py-3 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    >
                      Apply on employer site
                    </a>
                    <button 
                      onClick={(e) => toggleSaveJob(e, activeJob.id)} 
                      className={`w-[46px] h-[46px] border rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                        savedJobIds.includes(activeJob.id) 
                          ? 'border-blue-200 bg-blue-50 text-blue-600' 
                          : 'border-gray-200 bg-white text-gray-400 hover:border-blue-300 hover:text-blue-500'
                      }`}
                    >
                      <svg className={`w-5 h-5 ${savedJobIds.includes(activeJob.id) ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-8 pb-12">
                  <div className="prose prose-slate max-w-none text-gray-700 text-[15px] leading-relaxed prose-headings:font-extrabold prose-headings:text-gray-900 prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-strong:text-gray-900" 
                       dangerouslySetInnerHTML={{ __html: decodeHtml(activeJob.description) }} />
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center min-h-full text-gray-400">
                <span className="text-lg font-bold text-gray-400">Select a job to view details</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}