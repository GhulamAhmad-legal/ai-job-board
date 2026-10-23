'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export type BrowseItem = { slug: string; label: string; count: number };
export type BrowseGroup = {
  id: string;
  title: string;
  blurb: string;
  icon: 'spark' | 'pin' | 'briefcase';
  featured?: boolean;
  items: BrowseItem[];
};

const ICON_PATHS = {
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16z" />,
  pin: (
    <>
      <path d="M12 21s-7-5.6-7-11a7 7 0 1 1 14 0c0 5.4-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
    </>
  ),
};

function Icon({ name, className = 'w-5 h-5' }: { name: keyof typeof ICON_PATHS; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

// Colours for the three big "popular" cards (full class names so Tailwind can see them).
const FEATURE_STYLES = [
  { bar: 'from-indigo-500 to-blue-500', chip: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  { bar: 'from-emerald-500 to-teal-500', chip: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { bar: 'from-violet-500 to-fuchsia-500', chip: 'bg-violet-50 text-violet-700 border-violet-100' },
];

export default function JobsBrowser({ groups }: { groups: BrowseGroup[] }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const visible = useMemo(
    () =>
      groups
        .map((g) => ({ ...g, items: q ? g.items.filter((i) => i.label.toLowerCase().includes(q)) : g.items }))
        .filter((g) => g.items.length > 0),
    [groups, q]
  );
  const matches = visible.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="max-w-[1152px] mx-auto px-4">
      {/* ---------- Filter ---------- */}
      <div className="-mt-7 relative z-10 max-w-[640px] mx-auto md:mx-0">
        <label htmlFor="browse-filter" className="sr-only">
          Filter job searches by city or role
        </label>
        <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-lg px-5 py-3 focus-within:ring-2 focus-within:ring-indigo-500 transition">
          <svg className="w-5 h-5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            id="browse-filter"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by city or role, e.g. London or Data Scientist"
            className="flex-1 bg-transparent outline-none px-3 text-[15px] text-gray-900 placeholder-gray-400"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-[13px] font-bold text-gray-500 hover:text-gray-900"
              aria-label="Clear filter"
            >
              Clear
            </button>
          )}
        </div>
        <p className="mt-2 px-2 text-[13px] text-gray-500" aria-live="polite">
          {q ? `${matches} ${matches === 1 ? 'match' : 'matches'}` : 'Pick a group to see its open roles.'}
        </p>
      </div>

      {/* ---------- Groups ---------- */}
      <div className="mt-10 space-y-12">
        {visible.map((group) => {
          const max = Math.max(...group.items.map((i) => i.count), 1);
          return (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                  <Icon name={group.icon} />
                </span>
                <div>
                  <h2 id={`group-${group.id}`} className="text-[20px] font-extrabold text-gray-900 leading-tight">
                    {group.title}
                  </h2>
                  <p className="text-[14px] text-gray-500">{group.blurb}</p>
                </div>
              </div>

              {group.featured ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {group.items.map((item, i) => {
                    const style = FEATURE_STYLES[i % FEATURE_STYLES.length];
                    return (
                      <Link
                        key={item.slug}
                        href={`/jobs/${item.slug}`}
                        className="group relative block bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden"
                      >
                        <span className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${style.bar}`} />
                        <span className={`inline-block text-[12px] font-bold px-3 py-1 rounded-full border ${style.chip}`}>
                          Open roles
                        </span>
                        <div className="mt-3 text-[40px] leading-none font-black text-gray-900 tracking-tight">
                          {item.count.toLocaleString()}
                        </div>
                        <div className="mt-2 text-[17px] font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {item.label}
                        </div>
                        <div className="mt-4 inline-flex items-center gap-1 text-[14px] font-bold text-blue-600">
                          View jobs
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/jobs/${item.slug}`}
                      className="group block bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm hover:shadow-lg hover:border-indigo-400 hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-bold text-[15px] text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                          {item.label}
                        </span>
                        <span className="text-[13px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 shrink-0">
                          {item.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden" aria-hidden="true">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                          style={{ width: `${Math.max(6, Math.round((item.count / max) * 100))}%` }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        })}

        {visible.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
            <p className="text-[18px] font-extrabold text-gray-900">No shortcuts match “{query.trim()}”</p>
            <p className="mt-2 text-[15px] text-gray-500">
              Try a different city or role, or search all roles on the home page.
            </p>
            <Link
              href="/"
              className="inline-block mt-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] px-6 py-3 rounded-xl transition-colors"
            >
              Search all roles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
