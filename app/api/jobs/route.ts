import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cleanDescription } from '../../lib/cleanDescription';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAGE_SIZE = 150;

export async function GET(req: NextRequest) {
  const raw = Number(req.nextUrl.searchParams.get('page') ?? 0);
  const page = Number.isFinite(raw) ? Math.min(Math.max(Math.floor(raw), 0), 100) : 0;
  const from = page * PAGE_SIZE;

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .order('id', { ascending: true })
    .range(from, from + PAGE_SIZE - 1);

  if (error) {
    return NextResponse.json({ jobs: [] }, { status: 500 });
  }

  const jobs = (data ?? []).map((j) => ({
    ...j,
    description: cleanDescription(j.description ?? ''),
  }));

  return NextResponse.json(
    { jobs },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
  );
}