// Short, readable job URLs:  /job/release-manager-ai-models-wayve-4821
// The number at the end is the job's `seq` column (see the SQL migration). Old URLs
// (/job/<uuid> and the long slug form) still resolve and are redirected to the new one.

const UUID_AT_END = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SEQ_AT_END = /(?:^|-)(\d{1,12})$/;

export function slugify(text: string, max = 45): string {
  const full = String(text ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (full.length <= max) return full;
  // cut at a whole word, not in the middle of one
  const cut = full.slice(0, max);
  const atBoundary = full[max] === '-';
  const trimmed = atBoundary ? cut : cut.slice(0, Math.max(cut.lastIndexOf('-'), 0)) || cut;
  return trimmed.replace(/-+$/g, '');
}

type SlugJob = { id: string; seq?: number | string | null; title: string; company: string };

// "/job/<title>-<company>-<seq>"  (falls back to the UUID if a row has no seq yet)
export function jobPath(job: SlugJob): string {
  const words = slugify(`${job.title} ${job.company}`);
  const key = job.seq != null && job.seq !== '' ? String(job.seq) : job.id;
  return `/job/${words ? `${words}-` : ''}${key}`;
}

export type JobRef = { kind: 'id'; value: string } | { kind: 'seq'; value: number };

// Reads the id out of a URL segment: new short slug, long slug, or bare UUID.
export function parseJobRef(param: string): JobRef | null {
  let value = param;
  try {
    value = decodeURIComponent(param);
  } catch {}
  const uuid = value.match(UUID_AT_END);
  if (uuid) return { kind: 'id', value: uuid[0].toLowerCase() };
  const seq = value.match(SEQ_AT_END);
  if (seq) return { kind: 'seq', value: Number(seq[1]) };
  return null;
}