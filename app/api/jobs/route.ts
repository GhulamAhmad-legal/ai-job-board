import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cleanDescription } from '../../lib/cleanDescription';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAGE_SIZE = 150;

// Strip characters that have special meaning inside a PostgREST filter string.
function clean(input: string | null, max = 80) {
  return (input ?? '').replace(/[,()"'\\%_*]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

// GET /api/jobs?page=0&remote=1&q=machine learning&loc=london
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const raw = Number(sp.get('page') ?? 0);
  const page = Number.isFinite(raw) ? Math.min(Math.max(Math.floor(raw), 0), 100) : 0;
  const from = page * PAGE_SIZE;

  const remote = sp.get('remote') === '1';
  const q = clean(sp.get('q'));
  const loc = clean(sp.get('loc'));

  let query = supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .eq('status', 'active');

  // Fully remote roles are tagged "Remote" by the scraper.
  if (remote) query = query.filter('tags', 'cs', JSON.stringify(['Remote']));
  if (q) query = query.or(`title.ilike.*${q}*,company.ilike.*${q}*`);
  if (loc) query = query.ilike('location', `%${loc}%`);

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .order('id', { ascending: true })
    .range(from, from + PAGE_SIZE - 1);

  if (error) {
    return NextResponse.json({ jobs: [], total: 0 }, { status: 500 });
  }

  const jobs = (data ?? []).map((j) => ({
    ...j,
    description: cleanDescription(j.description ?? ''),
  }));

  return NextResponse.json(
    { jobs, total: count ?? jobs.length },
    { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' } }
  );
}