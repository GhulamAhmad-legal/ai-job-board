// Short, readable location text for cards, so long multi-place strings don't spill across the page:
//   "Remote - London | Dublin | New York | Germany | Poland"  ->  "Remote - London" + 4 more
//   "Mountain View, California, United States, San Francisco, California, United States"
//        ->  "Mountain View, California, United States" + 1 more
// Pure text work, safe to use in server and client components.

// A comma that follows a country name starts a new place ("..., United States, San Francisco, ...").
const COUNTRY_END =
  '(?:United States|United Kingdom|USA|Canada|Germany|France|Ireland|Netherlands|Spain|Italy|Poland|Sweden|Switzerland|India|Japan|Singapore|Australia|Brazil|Israel|Serbia|Qatar)';
const PLACE_BREAK = new RegExp(`[;|•·/]|\\s+or\\s+|\\s+&\\s+|(?<=\\b${COUNTRY_END}),\\s*(?=[A-Za-z])`, 'i');

// Parts that say how someone works, not where.
const NOT_WHERE = /^(?:remote[- ]?friendly|hybrid|on-?site|in-?office|office)$/i;

const CITY_ALIASES: Record<string, string> = {
  sf: 'San Francisco',
  'sf bay area': 'San Francisco',
  'san francisco bay area': 'San Francisco',
  'bay area': 'San Francisco',
  nyc: 'New York',
  'new york city': 'New York',
};

function placeParts(location: string | null | undefined): string[] {
  let text = String(location ?? '');
  // "Hybrid - San Francisco, New York City, Austin": here the commas separate cities
  text = text.replace(/^\s*hybrid\s*-\s*(.+)$/i, (_m, rest: string) => rest.replace(/,\s*/g, ' | '));

  const seen = new Set<string>();
  const parts: string[] = [];
  for (const raw of text.split(PLACE_BREAK)) {
    let part = raw.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim().replace(/\s+office$/i, '');
    part = CITY_ALIASES[part.toLowerCase()] ?? part; // "SF" -> "San Francisco"
    if (!part || NOT_WHERE.test(part)) continue;
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    parts.push(part);
  }
  return parts;
}

// First place plus how many others the listing mentions.
export function shortLocation(location: string | null | undefined): { label: string; more: number } {
  const parts = placeParts(location);
  if (parts.length === 0) return { label: String(location ?? '').trim().slice(0, 60), more: 0 };
  return { label: parts[0], more: parts.length - 1 };
}

// "London, United Kingdom +3 more". `extraMore` = other postings of the same role (group size - 1);
// the larger of the two numbers is shown, so places are never counted twice.
export function locationWithMore(location: string | null | undefined, extraMore = 0): string {
  const { label, more } = shortLocation(location);
  const n = Math.max(more, extraMore);
  return n > 0 ? `${label} +${n} more` : label;
}

// The city a job is in, for "most openings are in ..." statistics. Remote roles have no city.
export function cityOf(location: string | null | undefined): string | null {
  const first = placeParts(location)[0];
  if (!first || /^remote/i.test(first)) return null;
  const city = first.split(',')[0].trim();
  if (!city) return null;
  return CITY_ALIASES[city.toLowerCase()] ?? city;
}