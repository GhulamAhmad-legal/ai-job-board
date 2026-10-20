import { createClient } from '@supabase/supabase-js';
import JobFeedClient from './JobFeedClient';
import { cleanDescription } from './lib/cleanDescription';
// Add this block to define the canonical URL for the homepage
export const metadata = {
  alternates: {
    canonical: 'https://www.coretechroles.com',
  },
};

export const revalidate = 3600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FEED_SIZE = 150; // jobs sent to the page
const POOL_SIZE = 1000; // newest jobs considered (light columns only)

type Slim = { id: string; company: string; created_at: string | null };

// Round-robin across companies: 1st job of each company, then 2nd of each, etc.
function diversify<T extends { company: string }>(rows: T[], size: number): T[] {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const list = groups.get(row.company);
    if (list) list.push(row);
    else groups.set(row.company, [row]);
  }

  const queues = Array.from(groups.values());
  const out: T[] = [];

  for (let round = 0; out.length < size; round++) {
    let added = false;
    for (const queue of queues) {
      if (round < queue.length) {
        out.push(queue[round]);
        added = true;
        if (out.length >= size) break;
      }
    }
    if (!added) break;
  }

  return out;
}

export default async function Home() {
  // Total active jobs (header count).
  const { count } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');

  // 1. Prefer jobs tagged "AI", spread across companies.
  // `tags` is jsonb, so match with the raw "cs" (contains) operator and a JSON array.
  // (.contains() with a JS array builds a Postgres array literal, which fails on jsonb.)
  const { data: aiPool, error: aiError } = await supabase
    .from('jobs')
    .select('id, company, created_at')
    .eq('status', 'active')
    .filter('tags', 'cs', JSON.stringify(['AI']))
    .order('created_at', { ascending: false })
    .limit(POOL_SIZE);

  if (aiError) console.error('AI jobs query failed:', aiError.message);

  let picked: Slim[] = diversify((aiPool ?? []) as Slim[], FEED_SIZE);

  // 2. If there aren't enough AI jobs, top up with other active jobs.
  if (picked.length < FEED_SIZE) {
    const { data: restPool } = await supabase
      .from('jobs')
      .select('id, company, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(POOL_SIZE);

    const taken = new Set(picked.map((p) => p.id));
    const extra = diversify(
      ((restPool ?? []) as Slim[]).filter((r) => !taken.has(r.id)),
      FEED_SIZE - picked.length
    );
    picked = [...picked, ...extra];
  }

  // 3. Fetch full rows only for the jobs we'll actually show.
  const ids = picked.map((p) => p.id);
  const { data: rows } = ids.length
    ? await supabase.from('jobs').select('*').in('id', ids)
    : { data: [] };

  const byId = new Map((rows ?? []).map((r) => [r.id, r]));
  const jobs = ids
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((j) => ({ ...j, description: cleanDescription(j.description ?? '') }));

  return <JobFeedClient initialJobs={jobs} totalCount={count || 0} />;
}
