'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState, useRef } from 'react';

export const dynamic = 'force-dynamic';

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
  
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  
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
        .eq('status', 'active') 
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

  const filteredJobs = jobs.filter(job => {
    // 🧠 UPGRADE 1: Now searches Title, Company, AND Description
    const matchesTitle = searchTitle === '' ? true : (
      job.title.toLowerCase().includes(searchTitle.toLowerCase()) || 
      job.company.toLowerCase().includes(searchTitle.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(searchTitle.toLowerCase()))
    );
    
    const matchesLocation = searchLocation === '' ? true : (
      job.location.toLowerCase().includes(searchLocation.toLowerCase())
    );

    const matchesRemote = remoteOnly ? job.location.toLowerCase().includes('remote') : true;
    const matchesEasyApply = easyApplyOnly ? job.title.toLowerCase().includes('engineer') : true;

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

    let matchesRating = true;
    if (selectedRating !== 'Any') {
      const ratingNum = parseFloat(selectedRating); 
      const mockRating = 3.0 + (job.company.length % 3); 
      matchesRating = mockRating >= ratingNum;
    }

    return matchesTitle && matchesLocation && matchesRemote && matchesEasyApply && matchesDate && matchesRating;
  }).sort((a, b) => {
    if (selectedSort === 'Most recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0; 
  });

  const salary = activeJob ? getEstimatedSalary(activeJob.title) : { min: 120, max: 180, median: 150 };

  return (
    <main className="min-h-screen flex flex-col bg-[#F5F6F8] text-[#181818] font-sans overflow-x-hidden">
  
  {/* PREMIUM HERO SECTION */}
  <section className="relative bg-white pt-20 pb-12 lg:pt-24 lg:pb-16 border-b border-gray-200 shadow-sm z-[100] shrink-0 overflow-visible">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6">
            Find your next role in <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Artificial Intelligence
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-[17px] leading-8 text-gray-500 mb-10 font-medium">
            Browse over 2,500+ active roles at top AI startups and enterprise tech companies. Heavily curated, remote-friendly, and updated daily.
          </p>

          <div className="mx-auto max-w-4xl flex flex-col md:flex-row items-center bg-white rounded-3xl md:rounded-full p-2 shadow-xl shadow-gray-200/50 ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-indigo-600 transition-all mb-8">
            <div className="flex-1 flex items-center px-4 py-2 md:py-0 md:border-r border-gray-200 w-full group">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search by role, keywords, or tech stack..." 
                className="w-full border-none focus:ring-0 text-[15px] font-medium text-gray-900 placeholder-gray-400 ml-3 py-3 outline-none bg-transparent" 
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
            </div>
            
            <div className="flex-1 flex items-center px-4 py-2 md:py-0 w-full group">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="City, state, zipcode, or 'remote'" 
                className="w-full border-none focus:ring-0 text-[15px] font-medium text-gray-900 placeholder-gray-400 ml-3 py-3 outline-none bg-transparent" 
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
            
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-full transition-colors shadow-md w-full md:w-auto mt-2 md:mt-0">
              Search Jobs
            </button>
          </div>

          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button onClick={() => setEasyApplyOnly(!easyApplyOnly)} className={`px-5 py-2 text-[13px] font-bold rounded-full border transition-all cursor-pointer ${easyApplyOnly ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-sm'}`}>Easy Apply only</button>
            <button onClick={() => setRemoteOnly(!remoteOnly)} className={`px-5 py-2 text-[13px] font-bold rounded-full border transition-all cursor-pointer ${remoteOnly ? 'bg-indigo-50 text-indigo-700 border-indigo-500 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-sm'}`}>Remote only</button>
            
            <div className="relative">
              <button onClick={() => setActiveDropdown(activeDropdown === 'rating' ? null : 'rating')} className={`px-5 py-2 text-[13px] font-bold rounded-full border transition-all cursor-pointer flex items-center ${activeDropdown === 'rating' || selectedRating !== 'Any' ? 'bg-indigo-50 text-indigo-700 border-indigo-500 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-sm'}`}>
                Company rating {activeDropdown === 'rating' ? '▴' : '▾'}
              </button>
              {activeDropdown === 'rating' && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                  <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                      <span className="font-extrabold text-[13px] text-gray-500 uppercase tracking-wider">Company rating</span>
                      <button onClick={() => setActiveDropdown(null)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">✕</button>
                    </div>
                    {['Any', '4.0', '3.0', '2.0'].map(stars => (
                      <div key={stars} onClick={() => { setSelectedRating(stars); setActiveDropdown(null); }} className="px-4 py-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center text-[15px] font-medium text-gray-700 transition-colors group">
                        <span className="flex items-center group-hover:text-indigo-600">{stars} {stars !== 'Any' && <><span className="text-amber-400 ml-1 text-sm">★</span><span className="ml-1 text-sm text-gray-500 group-hover:text-indigo-500">and up</span></>}</span>
                        {selectedRating === stars && <span className="text-indigo-600 font-bold">✓</span>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')} className={`px-5 py-2 text-[13px] font-bold rounded-full border transition-all cursor-pointer flex items-center ${activeDropdown === 'date' || selectedDate !== 'Any time' ? 'bg-indigo-50 text-indigo-700 border-indigo-500 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-sm'}`}>
                Date posted {activeDropdown === 'date' ? '▴' : '▾'}
              </button>
              {activeDropdown === 'date' && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                  <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                      <span className="font-extrabold text-[13px] text-gray-500 uppercase tracking-wider">Date posted</span>
                      <button onClick={() => setActiveDropdown(null)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">✕</button>
                    </div>
                    {['Any time', 'Last day', 'Last 3 days', 'Last week', 'Last 2 weeks', 'Last month'].map(time => (
                      <div key={time} onClick={() => { setSelectedDate(time); setActiveDropdown(null); }} className="px-5 py-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center text-[15px] font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                        {time}
                        {selectedDate === time && <span className="text-indigo-600 font-bold">✓</span>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* UPGRADE 3: CREATE ALERT BUTTON LINKED TO MODAL */}
            <button onClick={() => setShowAlertModal(true)} className="ml-auto hidden md:flex items-center text-[13px] font-bold text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer group">
              <svg className="w-4 h-4 mr-1.5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Create job alert
            </button>
          </div>
        </div>
      </section>

      {/* 🧠 UPGRADE 2: NEW STICKY DUEL-PANE LAYOUT */}
      {/* Used items-start to allow the sticky right pane to function perfectly while left pane scrolls */}
      <div className="flex-1 max-w-[1152px] w-full mx-auto px-4 flex items-start gap-5 bg-[#F5F6F8] py-6">
        
        {/* Left Column: Natural scrolling feed */}
        <div className="w-full lg:w-[420px] flex flex-col shrink-0">
          
          <div className="mb-4 flex items-center justify-between shrink-0">
            <span className="text-[14px] font-bold text-gray-500">
              {filteredJobs.length} {searchTitle ? `results for "${searchTitle}"` : 'active roles'}
            </span>
            
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
                className={`text-[13px] font-bold text-gray-700 hover:text-indigo-600 cursor-pointer flex items-center rounded-md transition-all`}
              >
                {selectedSort} 
                <svg className={`w-3.5 h-3.5 ml-1 transition-transform ${activeDropdown === 'sort' ? 'rotate-180 text-indigo-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
                        className="px-5 py-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center text-[14px] font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                      >
                        {sort}
                        {selectedSort === sort && <span className="text-indigo-600 font-bold">✓</span>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-col pb-10">
            {filteredJobs.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
                 <span className="text-indigo-400 text-4xl mb-3 block">🔍</span>
                 <p className="text-[15px] text-gray-600 font-medium">
                   Your filters returned no results. Try adjusting them!
                 </p>
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
                    className={`p-5 mb-4 cursor-pointer transition-all duration-300 relative border rounded-2xl group overflow-hidden ${
                      isSelected 
                        ? 'bg-indigo-50/50 border-indigo-300 shadow-md z-10 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-indigo-600' 
                        : 'bg-white border-gray-200 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-[36px] h-[36px] border border-gray-200 rounded-lg flex items-center justify-center bg-white shadow-sm overflow-hidden text-gray-900 font-black text-[12px]">
                          {job.company_logo_url ? (
                            <img 
                              src={job.company_logo_url} 
                              alt={job.company} 
                              className="w-full h-full object-contain p-0.5" 
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) parent.innerText = job.company.slice(0, 2).toUpperCase();
                              }}
                            />
                          ) : (
                            job.company.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <span className="block text-[14px] font-bold text-gray-900">{job.company}</span>
                          <span className="text-[11px] font-bold text-gray-500 flex items-center mt-0.5">
                            {mockRating}.0 <span className="text-amber-400 ml-0.5 mr-1 text-[10px]">★</span>
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => toggleSaveJob(e, job.id)} 
                        className={`cursor-pointer transition-all hover:scale-110 ${isSaved ? 'text-indigo-600' : 'text-gray-300 hover:text-gray-400'}`}
                      >
                        <svg className={`w-[22px] h-[22px] ${isSaved ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isSaved ? 0 : 2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>
                    
                    <h2 className={`text-[17px] font-extrabold leading-snug mb-3 pr-2 transition-colors duration-200 ${isSelected ? 'text-indigo-700' : 'text-gray-900 group-hover:text-indigo-600'}`}>
                      {job.title}
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-auto">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 border border-indigo-200 truncate max-w-full">
                        {job.location.split(';')[0]}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        ${jobSal.min}K –${jobSal.max}K /yr
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Sticky to viewport */}
        <div className="hidden lg:block flex-1 min-w-0 sticky top-6 h-[calc(100vh-48px)]">
          <div 
            ref={descriptionScrollRef} 
            className="h-full overflow-y-auto pr-2 pb-10 [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
          >
            {activeJob ? (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col min-h-full transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
                
                <div className="px-8 py-8 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-[48px] h-[48px] border border-gray-200 rounded-xl flex items-center justify-center bg-white shadow-sm overflow-hidden text-gray-900 font-black text-[16px]">
                        {activeJob.company_logo_url ? (
                          <img 
                            src={activeJob.company_logo_url} 
                            alt={activeJob.company} 
                            className="w-full h-full object-contain p-1" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) parent.innerText = activeJob.company.slice(0, 2).toUpperCase();
                            }}
                          />
                        ) : (
                          activeJob.company.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <span className="block text-[18px] font-extrabold text-gray-900">{activeJob.company}</span>
                        <span className="text-[13px] font-bold text-gray-500 mt-0.5 block">
                          {3.0 + (activeJob.company.length % 3)}.0 <span className="text-amber-400">★</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <h1 className="text-[28px] font-extrabold text-gray-900 leading-tight mb-5 tracking-tight">
                    {activeJob.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2.5 mb-8">
                    <span className="inline-flex items-center bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-full text-[13px] font-bold border border-amber-200 shadow-sm">
                      <span className="mr-1.5 text-amber-500 text-sm">🏆</span> Best Places to Work
                    </span>
                    <span className="inline-flex items-center bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full text-[13px] font-bold border border-indigo-200 shadow-sm">
                      {activeJob.location.split(';')[0]}
                    </span>
                    <span className="inline-flex items-center bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-full text-[13px] font-bold border border-emerald-200 shadow-sm">
${activeJob.salary_min || 100}K – ${activeJob.salary_max || 150}K <span className="font-medium opacity-70 ml-1">/yr</span>                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <a 
                      href={activeJob.apply_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[15px] px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                      Apply on employer site
                    </a>
                    <button 
                      onClick={(e) => toggleSaveJob(e, activeJob.id)} 
                      className={`w-[50px] h-[50px] border rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                        savedJobIds.includes(activeJob.id) 
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-600' 
                          : 'border-gray-200 bg-white text-gray-400 hover:border-indigo-300 hover:text-indigo-500'
                      }`}
                    >
                      <svg className={`w-6 h-6 ${savedJobIds.includes(activeJob.id) ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-8 pb-16">
                  <div className="prose prose-slate max-w-none text-gray-600 text-[16px] leading-relaxed prose-headings:font-extrabold prose-headings:text-gray-900 prose-headings:tracking-tight prose-a:text-indigo-600 hover:prose-a:text-indigo-700 prose-strong:text-gray-900" 
                       dangerouslySetInnerHTML={{ __html: decodeHtml(activeJob.description) }} />
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center justify-center min-h-[600px] text-gray-400">
                <span className="text-lg font-bold text-gray-400">Select a job to view details</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 🧠 UPGRADE 3: JOB ALERT MODAL UI COMPONENT */}
      {showAlertModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-gray-100">
            <button 
              onClick={() => setShowAlertModal(false)} 
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1.5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-8">
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h2 className="text-[22px] font-extrabold text-gray-900 mb-2 tracking-tight">Never miss a role</h2>
              <p className="text-gray-500 text-[15px] mb-7 font-medium">Get personalized AI job alerts sent directly to your inbox the moment they are posted.</p>
              
              {alertSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
                  <span className="text-emerald-600 mt-0.5 text-lg">✓</span>
                  <p className="text-[14px] text-emerald-800 font-bold leading-snug">Success! We will email you when new roles match your criteria.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium text-[15px]"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                  />
                  <button 
                    onClick={() => setAlertSubmitted(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg"
                  >
                    Create Alert
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}