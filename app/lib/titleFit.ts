// Google shows roughly the first 60 characters of a page title. These helpers keep the useful
// words (role, company, place, pay, count) and drop the least useful ones (brand name) when needed,
// instead of letting the end of the title be cut off mid-word.

export const TITLE_MAX = 62;

// Returns the first candidate that fits, or the shortest one if none do.
// List candidates from most to least informative.
export function fitTitle(candidates: string[], max = TITLE_MAX): string {
  const clean = candidates.map((c) => c.replace(/\s+/g, ' ').trim()).filter(Boolean);
  return clean.find((c) => c.length <= max) ?? clean.reduce((a, b) => (b.length < a.length ? b : a), clean[0] ?? '');
}

// Cuts text at a whole word and adds an ellipsis.
export function clipWords(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const at = cut.lastIndexOf(' ');
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[ ,.;:–-]+$/, '')}…`;
}