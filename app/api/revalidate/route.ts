import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Called by the scraper after each run so the live site shows fresh data immediately.
// Protected by a secret: set REVALIDATE_SECRET in Vercel and in job-scraper/.env.
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const provided = req.headers.get('x-revalidate-secret');

  if (!secret || provided !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  revalidatePath('/');
  revalidatePath('/companies');
  revalidatePath('/companies/[name]', 'page');
  revalidatePath('/job/[id]', 'page');
  revalidatePath('/sitemap.xml');

  return NextResponse.json({ ok: true, refreshedAt: new Date().toISOString() });
}
