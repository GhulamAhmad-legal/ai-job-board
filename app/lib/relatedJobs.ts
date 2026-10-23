import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type RelatedJob = {
  id: string;
  seq: number | null;
  title: string;
  company: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
};

type JobRef = { id: string; title: string; company: string; location?: string | null };

const COLUMNS = 'id, seq, title, company, location, salary_min, salary_max';

// ---------- title words ----------

// Words that say nothing about what the job is.
const STOP = new Set([
  'the', 'and', 'for', 'with', 'senior', 'staff', 'principal', 'junior', 'lead', 'head', 'new', 'grad',
  'intern', 'remote', 'hybrid', 'team', 'emea', 'apac', 'latam', 'global', 'based', 'role',
]);
// Job nouns shared by thousands of titles: used only as a second condition, never on their own.
const GENERIC = new Set([
  'engineer', 'engineering', 'manager', 'scientist', 'specialist', 'developer', 'analyst', 'director',
  'associate', 'architect', 'consultant', 'partner', 'coordinator', 'representative', 'researcher',
  'technician', 'operations',
]);
const SHORT_OK = new Set(['ai', 'ml']);

export function titleTokens(title: string, extraStops: string[] = []) {
  const stops = new Set(extraStops.map((w) => w.toLowerCase()));
  const all = Array.from(
    new Set(
      String(title ?? '')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/[^a-z0-9]+/)
        .filter((w) => (w.length >= 3 || SHORT_OK.has(w)) && !STOP.has(w) && !stops.has(w) && !/^\d+$/.test(w))
    )
  );
  const specific = all.filter((w) => !GENERIC.has(w)).sort((a, b) => b.length - a.length);
  const generic = all.filter((w) => GENERIC.has(w));
  return { all, specific, generic };
}

// Orders rows by how many title words they share with the job, keeps the original (newest-first)
// order for ties, and allows at most `perCompany` rows from one employer.
export function rankRelated<T extends { title: string; company: string }>(
  rows: T[],
  tokens: string[],
  perCompany: number,
  limit: number
): T[] {
  const wanted = new Set(tokens);
  const scored = rows
    .map((row, index) => {
      const have = new Set(titleTokens(row.title).all);
      let score = 0;
      wanted.forEach((t) => {
        if (have.has(t)) score++;
      });
      return { row, index, score };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const perOne = new Map<string, number>();
  const out: T[] = [];
  for (const { row } of scored) {
    const n = perOne.get(row.company) ?? 0;
    if (n >= perCompany) continue;
    perOne.set(row.company, n + 1);
    out.push(row);
    if (out.length >= limit) break;
  }
  return out;
}

// ---------- queries ----------

const words = (s: string | null | undefined) =>
  String(s ?? '').toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2);

// Other open roles at the same company, the most alike first.
export async function getMoreFromCompany(
  job: JobRef,
  limit = 5
): Promise<{ jobs: RelatedJob[]; total: number }> {
  try {
    const { data } = await supabase
      .from('jobs')
      .select(COLUMNS)
      .eq('company', job.company)
      .eq('status', 'active')
      .eq('is_primary', true)
      .neq('id', job.id)
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .limit(60);

    const { count } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('company', job.company)
      .eq('status', 'active')
      .eq('is_primary', true);

    const tokens = titleTokens(job.title, [...words(job.company), ...words(job.location)]).all;
    return {
      jobs: rankRelated((data ?? []) as RelatedJob[], tokens, limit, limit),
      total: count ?? 0,
    };
  } catch (err) {
    console.error('more-from-company failed:', err);
    return { jobs: [], total: 0 };
  }
}

// Roles with a similar title at OTHER companies (at most 2 from one employer).
// Looks for the job's most telling title words; if that finds too little, relaxes to the first one.
export async function getSimilarJobs(job: JobRef, limit = 6): Promise<RelatedJob[]> {
  try {
    const t = titleTokens(job.title, [...words(job.company), ...words(job.location)]);

    let attempts: string[][];
    if (t.specific.length >= 2) attempts = [[t.specific[0], t.specific[1]], [t.specific[0]]];
    else if (t.specific.length === 1) {
      attempts = t.generic.length ? [[t.specific[0], t.generic[0]], [t.specific[0]]] : [[t.specific[0]]];
    } else return []; // only generic words (e.g. "Manager"): too vague to call anything similar

    let best: RelatedJob[] = [];
    for (const attempt of attempts) {
      let q = supabase
        .from('jobs')
        .select(COLUMNS)
        .eq('status', 'active')
        .eq('is_primary', true)
        .neq('company', job.company);
      for (const w of attempt) q = q.ilike('title', `%${w}%`); // words are letters/digits only

      const { data } = await q
        .order('created_at', { ascending: false })
        .order('id', { ascending: true })
        .limit(60);

      const picked = rankRelated((data ?? []) as RelatedJob[], t.all, 2, limit);
      if (picked.length > best.length) best = picked;
      if (picked.length >= 4) break;
    }
    return best;
  } catch (err) {
    console.error('similar jobs failed:', err);
    return [];
  }
}