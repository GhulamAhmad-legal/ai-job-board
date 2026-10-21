import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Confirm job alert', robots: { index: false, follow: false } };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function ConfirmAlert({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let ok = false;

  if (token && /^[a-f0-9]{16,128}$/i.test(token)) {
    const { data } = await supabase.rpc('confirm_alert', { p_token: token });
    ok = data === true;
  }

  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans px-4 py-20">
      <div className="max-w-[520px] mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
        <h1 className="text-[26px] font-extrabold text-gray-900 mb-3">
          {ok ? 'Your job alert is on' : 'This link is not valid'}
        </h1>
        <p className="text-[16px] text-gray-600 leading-relaxed mb-6">
          {ok
            ? 'Thanks for confirming. We will email you when new roles match your alert, at most once a day. Every email has an unsubscribe link.'
            : 'The link may have already been used, or it may have expired. If your alert is not working, create it again from the job search.'}
        </p>
        <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl">
          Browse jobs
        </Link>
      </div>
    </main>
  );
}
