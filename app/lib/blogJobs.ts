import { createClient } from '@supabase/supabase-js';
import type { JobWidget } from './blogIndex';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type JobCard = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
};

// Remove characters that have a special meaning in LIKE patterns and filters.
const clean = (s: string) => s.replace(/[%_,()\\]/g, ' ').trim();

// Returns a handful of current openings that match a widget, spread across companies
// (at most 2 per company) so one employer never fills the whole list.
export async function getJobsForWidget(w: JobWidget, limit = 6): Promise<JobCard[]> {
  try {
    let q = supabase
      .from('jobs')
      .select('id, title, company, location, salary_min, salary_max')
      .eq('status', 'active');

    if (w.tags?.length) q = q.filter('tags', 'cs', JSON.stringify(w.tags));
    if (w.titleContains) q = q.ilike('title', `%${clean(w.titleContains)}%`);
    if (w.locationContains) q = q.ilike('location', `%${clean(w.locationContains)}%`);
    if (w.descriptionContains) q = q.ilike('description', `%${clean(w.descriptionContains)}%`);
    if (w.salaryOnly) q = q.not('salary_min', 'is', null);

    const { data, error } = await q
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .limit(80);

    if (error || !data) return [];

    const perCompany = new Map<string, number>();
    const picked: JobCard[] = [];
    for (const row of data as JobCard[]) {
      const n = perCompany.get(row.company) ?? 0;
      if (n >= 2) continue;
      perCompany.set(row.company, n + 1);
      picked.push(row);
      if (picked.length >= limit) break;
    }
    return picked;
  } catch (err) {
    console.error('blog jobs widget failed:', err);
    return [];
  }
}
