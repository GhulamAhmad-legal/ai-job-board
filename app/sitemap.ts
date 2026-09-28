import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'http://localhost:3000'; // Change to your live domain later (e.g., https://aijobs.com)

  // 1. Fetch all active jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, created_at, company')
    .eq('status', 'active');

  // 2. Generate individual Job URLs
  const jobUrls = (jobs || []).map((job) => ({
    url: `${baseUrl}/job/${job.id}`,
    lastModified: new Date(job.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // 3. 🧠 Extract unique companies for the Category Pages
  const uniqueCompanies = Array.from(new Set((jobs || []).map(j => j.company)));
  const companyUrls = uniqueCompanies.map((company) => ({
    url: `${baseUrl}/companies/${encodeURIComponent(company)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8, // Ranked slightly higher than individual jobs!
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/post-job`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...companyUrls,
    ...jobUrls,
  ];
}