// Plain statistics about a group of job listings (all computed from the listings, none typed by hand).
// Used by the company pages and the landing pages.

import { cityOf } from './locationLabel';
import { officePlaces, remoteTargets, remoteRegionOf, allInUS } from './jobSchema';

export type Count = { name: string; count: number };

// "Senior Software Engineer, Backend (Remote)" -> "Software Engineer"
const SENIORITY = /\b(senior|sr\.?|staff|principal|junior|jr\.?|lead|associate|distinguished|entry[- ]level|early career|new grad|ii|iii|iv)\b/gi;
export function roleFamily(title: string | null | undefined): string {
  const head = String(title ?? '').split(/\s[-–—]\s|[,(|:]/)[0];
  return head.replace(SENIORITY, ' ').replace(/\s+/g, ' ').trim();
}

// Counts values and returns the `limit` most common ones that occur at least `min` times.
export function topCounts(values: (string | null)[], limit = 3, min = 2): Count[] {
  const counts = new Map<string, Count>();
  for (const v of values) {
    if (!v) continue;
    const key = v.toLowerCase();
    const row = counts.get(key);
    if (row) row.count++;
    else counts.set(key, { name: v, count: 1 });
  }
  return Array.from(counts.values())
    .filter((r) => r.count >= min)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

// True when every place in the location text is in the United States (pay is shown in USD only then).
export function isUsOnly(location: string | null | undefined): boolean {
  const text = String(location ?? '').trim();
  if (!text) return false;
  const region = remoteRegionOf(text);
  if (region !== null) return allInUS([], remoteTargets(region));
  return allInUS(officePlaces([text]), []);
}

export type ListingRow = {
  title: string | null;
  location: string | null;
  tags?: unknown;
  salary_min: number | null;
  salary_max: number | null;
};

export type ListingSummary = {
  roles: number;
  topTitles: Count[];
  topPlaces: Count[];
  remotePct: number;
  aiPct: number;
  payPct: number;
  // Median posted range, only from listings located in the US, and only with at least 5 of them.
  usPay: { listings: number; minMedian: number; maxMedian: number } | null;
};

export function summarizeListings(rows: ListingRow[]): ListingSummary {
  const total = Math.max(rows.length, 1);
  const hasTag = (r: ListingRow, tag: string) => Array.isArray(r.tags) && (r.tags as unknown[]).includes(tag);
  const statesPay = (r: ListingRow) =>
    typeof r.salary_min === 'number' && typeof r.salary_max === 'number' && r.salary_min > 0 && r.salary_max >= r.salary_min;

  // With only a few roles, "most common" would just repeat the list, so a title or city may appear once.
  const min = rows.length >= 10 ? 2 : 1;

  const usPaid = rows.filter((r) => statesPay(r) && isUsOnly(r.location));
  return {
    roles: rows.length,
    topTitles: topCounts(rows.map((r) => roleFamily(r.title) || null), 4, min),
    topPlaces: topCounts(rows.map((r) => cityOf(r.location)), 3, min),
    remotePct: Math.round((rows.filter((r) => hasTag(r, 'Remote')).length / total) * 100),
    aiPct: Math.round((rows.filter((r) => hasTag(r, 'AI')).length / total) * 100),
    payPct: Math.round((rows.filter(statesPay).length / total) * 100),
    usPay:
      usPaid.length >= 5
        ? {
            listings: usPaid.length,
            minMedian: median(usPaid.map((r) => r.salary_min as number)),
            maxMedian: median(usPaid.map((r) => r.salary_max as number)),
          }
        : null,
  };
}