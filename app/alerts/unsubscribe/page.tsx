import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Unsubscribe from job alerts', robots: { index: false, follow: false } };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function UnsubscribeAlert({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let ok = false;

  if (token && /^[a-f0-9]{16,128}$/i.test(token)) {
    const { data } = await supabase.rpc('unsubscribe_alert', { p_token: token });
    ok = data === true;
  }

  return (
    <main className="min-h-screen bg-[#F5F6F8] font-sans px-4 py-20">
      <div className="max-w-[520px] mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
        <h1 className="text-[26px] font-extrabold text-gray-900 mb-3">
          {ok ? 'You are unsubscribed' : 'Nothing to unsubscribe'}
        </h1>
        <p className="text-[16px] text-gray-600 leading-relaxed mb-6">
          {ok
            ? 'That job alert has been deleted, along with your email address for it. You will not get more emails from it.'
            : 'This link has already been used, or the alert no longer exists. You will not get further emails from it.'}
        </p>
        <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl">
          Back to jobs
        </Link>
      </div>
    </main>
  );
}
