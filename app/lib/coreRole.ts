// Which job pages we ask Google to index.
//
// Every job stays on the site: people can find it by searching, browsing the company page, or alerts.
// But a site called an AI and tech job board should only put its on-topic roles in front of Google.
// Roles that are not tech work (sales, recruiting, finance, legal, facilities, shift or warehouse
// work ...) are left out of the sitemap and marked noindex.
//
// Set to false to ask Google to index every job page again.
export const INDEX_ONLY_CORE_ROLES = true;

// Always non-core, whatever else the title says.
const ALWAYS_NON_CORE =
  /\b(recruit\w*|sourcer|talent (acquisition|partner|programs?|operations|experience)|candidate experience|account (executive|manager|director|coordinator|associate)|sales|business development|bdr|sdr|marketing|partnerships?|customer success|success manager|(customer|community|product) support (specialist|associate|representative|lead)|people (partner|operations|ops|business partner|analytics?|lead)|human resources|payroll|accountant|accounting|counsel|attorney|paralegal|legal|facilities|workplace|office manager|executive assistants?|administrative|chief of staff|express your interest|hiring event|technician|operator|welder|machinist|fabricator|warehouse|material handler|dispatch|logistics|inventory|shift (lead|supervisor)|supervisor|production lead|data cent(er|re) (manager|operations|technician)|government affairs|deal (desk|operations)|sales operations|revenue operations)\b/i;

// Non-core unless the title is clearly technical ("Software Engineer, Finance Engineering" stays core).
const SOFT_NON_CORE =
  /\b(finance|financial|treasury|tax|procurement|supply chain|strategic sourcing|compliance|regulatory|compensation|total rewards|communications? (manager|lead|director|specialist|partner)|internal communications|public (relations|affairs)|events? (manager|lead|marketing|producer|coordinator|specialist)|brand|creative (director|strategist)|copywriter|content (strategist|writer|marketing)|community manager|investor relations)\b/i;

const TECHNICAL = /\b(engineer|engineering|developer|software|scientist|researcher|research|architect)\b/i;

export function isCoreRole(title: string): boolean {
  const t = String(title ?? '');
  if (ALWAYS_NON_CORE.test(t)) return false;
  if (SOFT_NON_CORE.test(t) && !TECHNICAL.test(t)) return false;
  return true;
}

// Use this for the sitemap and for each job page's robots setting.
export function shouldIndexJob(title: string): boolean {
  return !INDEX_ONLY_CORE_ROLES || isCoreRole(title);
}
