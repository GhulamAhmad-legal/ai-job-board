'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export type CompanyCard = {
  name: string;
  href: string;
  logoUrl: string;
  industry: string;
  description: string;
  jobCount: number;
  category: string;
};

export default function CompaniesBrowser({
  companies,
  categories,
}: {
  companies: CompanyCard[];
  categories: string[];
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<'roles' | 'name'>('roles');
  const q = query.trim().toLowerCase();

  const list = useMemo(() => {
    const rows = companies.filter(
      (c) =>
        (category === 'All' || c.category === category) &&
        (!q ||
          c.name.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q))
    );
    return rows.sort(
      sort === 'name'
        ? (a, b) => a.name.localeCompare(b.name)
        : (a, b) => b.jobCount - a.jobCount || a.name.localeCompare(b.name)
    );
  }, [companies, category, q, sort]);

  const max = Math.max(...companies.map((c) => c.jobCount), 1);
  const chips = [
    { name: 'All', count: companies.length },
    ...categories.map((name) => ({ name, count: companies.filter((c) => c.category === name).length })),
  ].filter((c) => c.count > 0);

  return (
    <div className="max-w-[1152px] mx-auto px-4">
      {/* ---------- Search and filters ---------- */}
      <div className="-mt-7 relative z-10">
        <div className="max-w-[640px]">
          <label htmlFor="company-filter" className="sr-only">
            Search companies
          </label>
          <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-lg px-5 py-3 focus-within:ring-2 focus-within:ring-indigo-500 transition">
            <svg className="w-5 h-5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              id="company-filter"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by company or field, e.g. robotics or Anthropic"
              className="flex-1 bg-transparent outline-none px-3 text-[15px] text-gray-900 placeholder-gray-400"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[13px] font-bold text-gray-500 hover:text-gray-900"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type of company">
            {chips.map((chip) => (
              <button
                key={chip.name}
                type="button"
                onClick={() => setCategory(chip.name)}
                aria-pressed={category === chip.name}
                className={`text-[13px] font-bold px-4 py-2 rounded-full border transition-colors ${
                  category === chip.name
                    ? 'bg-[#00060C] text-white border-[#00060C]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:text-indigo-700'
                }`}
              >
                {chip.name} <span className={category === chip.name ? 'text-gray-300' : 'text-gray-400'}>{chip.count}</span>
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-[13px] font-bold text-gray-500">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value === 'name' ? 'name' : 'roles')}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-[14px] text-gray-800 font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="roles">Most open roles</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </label>
        </div>

        <p className="mt-3 text-[13px] text-gray-500" aria-live="polite">
          Showing {list.length} of {companies.length} companies
        </p>
      </div>

      {/* ---------- Cards ---------- */}
      {list.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((company) => (
            <Link key={company.name} href={company.href} className="block group h-full">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-500 hover:-translate-y-0.5 transition-all flex flex-col h-full">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-[56px] h-[56px] border border-gray-100 rounded-xl flex items-center justify-center bg-white shadow-sm overflow-hidden p-2 shrink-0 text-gray-900 font-black text-[16px]">
                    {company.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={company.logoUrl}
                        alt={`${company.name} logo`}
                        width={56}
                        height={56}
                        loading="lazy"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      company.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="text-[12px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 truncate max-w-[180px]">
                    {company.industry}
                  </span>
                </div>

                <h2 className="text-[20px] font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {company.name}
                </h2>

                <p className="text-[14px] text-gray-500 leading-relaxed mb-5 line-clamp-3 flex-1">
                  {company.description}
                </p>

                <div className="mt-auto">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3" aria-hidden="true">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                      style={{ width: `${Math.max(4, Math.round((company.jobCount / max) * 100))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-gray-700">
                      {company.jobCount.toLocaleString()} open {company.jobCount === 1 ? 'role' : 'roles'}
                    </span>
                    <span className="text-[13px] font-bold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      View jobs →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
          <p className="text-[18px] font-extrabold text-gray-900">No companies match “{query.trim()}”</p>
          <p className="mt-2 text-[15px] text-gray-500">Try another name or field, or clear the filters.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory('All');
            }}
            className="inline-block mt-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] px-6 py-3 rounded-xl transition-colors"
          >
            Show all companies
          </button>
        </div>
      )}
    </div>
  );
}
