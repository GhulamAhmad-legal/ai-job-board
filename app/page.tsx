import { createClient } from '@supabase/supabase-js';
import JobFeedClient from './JobFeedClient';

export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function Home() {
  // 🧠 Added .limit(150) to prevent the 28MB payload crash!
  // The 'count' will still accurately return the full 2,500+ number for your header.
  const { data: jobs, count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(150); 

  return (
    <JobFeedClient 
      initialJobs={jobs || []} 
      totalCount={count || 0} 
    />
  );
}