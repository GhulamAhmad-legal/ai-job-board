import { createClient } from '@supabase/supabase-js';
import JobFeedClient from './JobFeedClient';

// Cache the page for 1 hour so the database isn't hit on every single visit
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function Home() {
  // 🧠 1. Fetch the exact count and the latest jobs instantly on the server
  const { data: jobs, count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // 🧠 2. Pass the data directly into your Client UI
  return (
    <JobFeedClient 
      initialJobs={jobs || []} 
      totalCount={count || 0} 
    />
  );
}