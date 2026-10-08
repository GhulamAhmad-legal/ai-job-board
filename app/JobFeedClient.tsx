'use client';

import { useState, useRef, useEffect } from 'react';

function decodeHtml(html: string) {
  if (!html) return '';
  return html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'").replace(/&nbsp;/g, ' ');
}

function getEstimatedSalary(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes('fellow') || lower.includes('intern')) return { min: 90, max: 130, median: 110 };
  if (lower.includes('lead') || lower.includes('director') || lower.includes('manager')) return { min: 180, max: 275, median: 220 };
  if (lower.includes('research') || lower.includes('scientist') || lower.includes('security')) return { min: 160, max: 245, median: 195 };
  return { min: 130, max: 195, median: 160 };
}

interface Props {
  initialJobs: any[];
  totalCount: number;
}

export default function JobFeedClient({ initialJobs, totalCount }: Props) {
  // 🧠 Initialize state DIRECTLY with the server-rendered jobs! No loading time!
  const [jobs] = useState<any[]>(initialJobs);
  const [activeJob, setActiveJob] = useState<any | null>(initialJobs[0] || null);
  
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false); 
  const [easyApplyOnly, setEasyApplyOnly] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('Any time');
  const [selectedRating, setSelectedRating] = useState('Any');
  const [selectedSort, setSelectedSort] = useState('Most recent');
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertSubmitted, setAlertSubmitted] = useState(false);

  const descriptionScrollRef = useRef<HTMLDivElement>(null);

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
    const matchesTitle = searchTitle === '' ? true : (
      job.title.toLowerCase().includes(searchTitle.toLowerCase()) || 
      job.company.toLowerCase().includes(searchTitle.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(searchTitle.toLowerCase()))
    );
    const matchesLocation = searchLocation === '' ? true : (job.location.toLowerCase().includes(searchLocation.toLowerCase()));
    const matchesRemote = remoteOnly ? job.location.toLowerCase().includes('remote') : true;
    const matchesEasyApply = easyApplyOnly ? job.title.toLowerCase().includes('engineer') : true;

    let matchesDate = true;
    if (selectedDate !== 'Any time' && job.created_at) {
      const jobDate = new Date(job.created_at);
      const diffDays = (new Date().getTime() - jobDate.getTime()) / (1000 * 3600 * 24);
      if (selectedDate === 'Last day') matchesDate = diffDays <= 1;
      if (selectedDate === 'Last 3 days') matchesDate = diffDays <= 3;
      if (selectedDate === 'Last week') matchesDate = diffDays <= 7;
      if (selectedDate === 'Last 2 weeks') matchesDate = diffDays <= 14;
      if (selectedDate === 'Last month') matchesDate = diffDays <= 30;
    }

    let matchesRating = true;
    if (selectedRating !== 'Any') {
      const mockRating = 3.0 + (job.company.length % 3); 
      matchesRating = mockRating >= parseFloat(selectedRating);
    }
    return matchesTitle && matchesLocation && matchesRemote && matchesEasyApply && matchesDate && matchesRating;
  });

  return (
    <main className="min-h-screen flex flex-col bg-[#F5F6F8] text-[#181818] font-sans w-full">
      <section className="relative bg-white pt-20 pb-12 lg:pt-24 lg:pb-16 border-b border-gray-200 shadow-sm z-40 shrink-0 overflow-visible">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6">
            Find your next role in <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Artificial Intelligence</span>
          </h1>
          <p className="mx-auto max-w-2xl text-[17px] leading-8 text-gray-500 mb-10 font-medium">
            Browse over {totalCount.toLocaleString()}+ active roles at top AI startups and enterprise tech companies.
          </p>

          <div className="mx-auto max-w-4xl flex flex-col md:flex-row items-center bg-white rounded-3xl md:rounded-full p-2 shadow-xl shadow-gray-200/50 ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-indigo-600 transition-all mb-8">
            <div className="flex-1 flex items-center px-4 w-full border-r border-gray-200">
              <input type="text" placeholder="Search by role, keywords..." className="w-full border-none focus:ring-0 text-[15px] py-3 outline-none bg-transparent" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} />
            </div>
            <div className="flex-1 flex items-center px-4 w-full">
              <input type="text" placeholder="City, state, or 'remote'" className="w-full border-none focus:ring-0 text-[15px] py-3 outline-none bg-transparent" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} />
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-full shadow-md w-full md:w-auto">Search Jobs</button>
          </div>
          
          {/* Include your exact filter buttons below here (easyApply, remote, dropdowns) */}
          <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-3">
             <button onClick={() => setEasyApplyOnly(!easyApplyOnly)} className={`px-5 py-2 text-[13px] font-bold rounded-full border transition-all ${easyApplyOnly ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'}`}>Easy Apply only</button>
             <button onClick={() => setRemoteOnly(!remoteOnly)} className={`px-5 py-2 text-[13px] font-bold rounded-full border transition-all ${remoteOnly ? 'bg-indigo-50 text-indigo-700 border-indigo-500' : 'bg-white text-gray-600 border-gray-300'}`}>Remote only</button>
          </div>
        </div>
      </section>

      <div className="flex-1 max-w-[1152px] w-full mx-auto px-4 flex items-start gap-5 py-6">
        {/* Left Column Feed */}
        <div className="w-full lg:w-[420px] flex flex-col shrink-0">
          <div className="mb-4 flex items-center justify-between shrink-0">
            <span className="text-[14px] font-bold text-gray-500">{filteredJobs.length} active roles</span>
          </div>
          
          <div className="flex flex-col pb-10">
            {filteredJobs.map((job) => (
              <div key={job.id} onClick={() => handleJobClick(job)} className={`p-5 mb-4 cursor-pointer border rounded-2xl ${activeJob?.id === job.id ? 'bg-indigo-50/50 border-indigo-300 shadow-md border-l-4 border-l-indigo-600' : 'bg-white border-gray-200 hover:shadow-xl hover:border-indigo-500'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-[36px] h-[36px] border border-gray-200 rounded-lg flex items-center justify-center font-black text-[12px]">
                    {job.company_logo_url ? <img src={job.company_logo_url} className="w-full h-full object-contain p-0.5" alt={job.company} /> : job.company.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[14px] font-bold text-gray-900">{job.company}</span>
                </div>
                <h2 className="text-[17px] font-extrabold mb-3 text-gray-900">{job.title}</h2>
                <div className="flex gap-2">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 border border-indigo-200 truncate">{job.location.split(';')[0]}</span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">${job.salary_min \vert{}\vert{} 100}K –${job.salary_max || 150}K</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column Sticky Details */}
        <div className="hidden lg:block flex-1 min-w-0 sticky top-6 h-[calc(100vh-48px)]">
          <div ref={descriptionScrollRef} className="h-full overflow-y-auto pr-2 pb-10">
            {activeJob && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
                <div className="px-8 py-8 border-b border-gray-100">
                  <h1 className="text-[28px] font-extrabold text-gray-900 mb-5">{activeJob.title}</h1>
                  <a href={activeJob.apply_url} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[15px] px-8 py-3.5 rounded-xl shadow-md">Apply on employer site</a>
                </div>
                <div className="p-8 pb-16 prose max-w-none" dangerouslySetInnerHTML={{ __html: decodeHtml(activeJob.description) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}