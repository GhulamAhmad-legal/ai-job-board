import sanitizeHtml from 'sanitize-html';

// Greenhouse sends descriptions as ESCAPED html (&lt;p&gt;...), Ashby sends real html (<p>...).
// Only decode when the text has no real tags yet, then sanitize either way so
// scraped descriptions can never inject scripts.
function decodeHtml(html: string) {
  if (!html) return '';
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export type CleanOptions = {
  // Company name, used to spot an "About <Company>" opening section.
  company?: string;
  // Drop the long "About <Company>" opening and start at the role itself. Meant for the
  // homepage preview panel. Job pages keep the full text (Google wants the complete posting).
  stripIntro?: boolean;
};

// ---------- helpers (plain string work, run before sanitizing) ----------

// Plain text of an html string, for measuring how much real content there is.
const textOf = (html: string) =>
  html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

// Start of the block element (div, p, heading, list) that contains position `pos`.
function blockStart(html: string, pos: number): number {
  let start = 0;
  const re = /<(?:div|p|h[1-6]|li|ul|ol)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && m.index < pos) start = m.index;
  return start;
}

// Legal / privacy boilerplate employers paste at the very end of a posting.
const LEGAL_MARKERS: RegExp[] = [
  /global data privacy notice/i,
  /privacy notice for (?:job )?(?:candidates|applicants)/i,
  /applicant arbitration agreement/i,
  /by clicking\s+[“"'‘]?\s*submit application/i,
  /candidate privacy (?:notice|policy)/i,
];

// Cuts the legal footer. Only acts when the marker sits in the second half of the posting and
// plenty of real content remains, so a mention near the top can never wipe out the role.
function stripLegalFooter(html: string): string {
  let cut = -1;
  for (const re of LEGAL_MARKERS) {
    const m = re.exec(html);
    if (m && (cut === -1 || m.index < cut)) cut = m.index;
  }
  if (cut < html.length * 0.5) return html;
  const kept = html.slice(0, blockStart(html, cut));
  return textOf(kept).length >= 400 ? kept : html;
}

// "About <Company>" style openings.
const INTRO_A = /^(?:about (?:us|the company|our company)\b|who we are\b|our (?:company|mission|story)\b)/i;
const INTRO_B = /^About\s+(?!(?:[Tt]he|[Tt]his|[Yy]our|[Yy]ou)\b)[A-Z0-9]/;
// Headings that mark where the actual role starts.
const ROLE_HEADING =
  /^(?:about (?:the|this|your) (?:role|job|position|opportunity|team)|the (?:role|opportunity|position)|role overview|(?:job|position|role) (?:description|summary|overview)|what you['’]ll (?:do|be doing|work on)|your (?:role|impact)|in this role)\s*[:：]?$/i;

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Removes the company marketing intro when the posting starts with one and a clear
// "About the role" style heading follows. Anything unclear is left untouched.
function stripCompanyIntro(html: string, company?: string): string {
  const full = textOf(html);
  const startsWithIntro =
    INTRO_A.test(full) ||
    INTRO_B.test(full) ||
    (!!company && new RegExp(`^about\\s+${escapeRe(company.trim())}\\b`, 'i').test(full));
  if (!startsWithIntro) return html;

  for (const m of html.matchAll(/>([^<>]{2,120})</g)) {
    const text = (m[1] ?? '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text || !ROLE_HEADING.test(text)) continue;

    const pos = (m.index ?? 0) + 1;
    const before = textOf(html.slice(0, pos)).length;
    if (before < 400) continue; // too short to be a company intro

    const start = blockStart(html, pos);
    const removed = textOf(html.slice(0, start)).length;
    const kept = full.length - removed;
    if (removed > full.length * 0.7 || kept < 400) return html;
    return html.slice(start);
  }
  return html;
}

// ---------- helpers (run after sanitizing) ----------

// Removes the empty <div> </div> spacers and wrappers left behind, and long runs of <br>.
function dropEmptyBlocks(html: string): string {
  const empty = /<(div|p|span|strong|em|b|i|li|ul|ol)>(?:\s|&nbsp;|<br\s*\/?>)*<\/\1>/gi;
  let out = html;
  let prev: string;
  do {
    prev = out;
    out = out.replace(empty, '');
  } while (out !== prev);
  return out.replace(/(?:<br\s*\/?>\s*){3,}/gi, '<br /><br />').trim();
}

export function cleanDescription(raw: string, opts: CleanOptions = {}) {
  const hasRealTags = /<(p|div|ul|ol|li|h[1-6]|br|strong|em|b|a|span)[\s>/]/i.test(raw || '');
  let html = hasRealTags ? raw : decodeHtml(raw);

  try {
    html = stripLegalFooter(html);
    html = html.replace(/#LI-[A-Za-z0-9_-]+/g, ''); // recruiter tags like #LI-HYBRID
    if (opts.stripIntro) html = stripCompanyIntro(html, opts.company);
  } catch {
    // if any cleanup step fails, fall back to the original text
  }

  const safe = sanitizeHtml(html, {
    transformTags: {
      h1: 'h2', // keep exactly one H1 per page
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'noopener noreferrer nofollow',
        target: '_blank',
      }),
    },
  });

  return dropEmptyBlocks(safe);
}