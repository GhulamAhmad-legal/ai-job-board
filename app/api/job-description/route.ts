import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cleanDescription } from '../../lib/cleanDescription';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/job-description?id=<job uuid>
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') ?? '';
  if (!UUID.test(id)) return NextResponse.json({ description: '' }, { status: 400 });

  const { data, error } = await supabase
    .from('jobs')
    .select('description, company')
    .eq('id', id)
    .eq('status', 'active')
    .maybeSingle();

  if (error) return NextResponse.json({ description: '' }, { status: 500 });
  if (!data) return NextResponse.json({ description: '' }, { status: 404 });

  const description = cleanDescription(data.description ?? '', {
    company: data.company,
    stripIntro: true,
  });

  return NextResponse.json(
    { description },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
  );
}