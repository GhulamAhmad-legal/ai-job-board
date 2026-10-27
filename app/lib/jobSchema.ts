// Helpers that turn a job's location text into the shapes Google's JobPosting markup accepts.
//   - Remote jobs need applicantLocationRequirements made of Country or State objects (nothing else).
//   - Office jobs need jobLocation with an address that includes addressCountry where we can tell it.
// When we can't work out a valid place, the helpers return nothing and the page leaves the JobPosting
// markup out, rather than sending Google something invalid.

export type Parsed = { locality?: string; region?: string; country?: string };

const US_STATES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
  CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
  KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts',
  MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico',
  NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
  TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

const CA_PROVINCES: Record<string, string> = {
  AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador', NS: 'Nova Scotia', NT: 'Northwest Territories', NU: 'Nunavut',
  ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Quebec', SK: 'Saskatchewan', YT: 'Yukon',
};

// Text -> ISO country code. Includes 3-letter codes (IND, CAN) and the 2-letter codes that
// can't be confused with a US state or Canadian province (IE, GB, JP...).
const COUNTRIES: Record<string, string> = {
  'united states': 'US', 'united states of america': 'US', usa: 'US', us: 'US', 'u.s.': 'US', 'u.s.a.': 'US',
  canada: 'CA', 'united kingdom': 'GB', uk: 'GB', 'u.k.': 'GB', 'great britain': 'GB', england: 'GB',
  scotland: 'GB', wales: 'GB', ireland: 'IE', germany: 'DE', france: 'FR', spain: 'ES', italy: 'IT',
  netherlands: 'NL', 'the netherlands': 'NL', belgium: 'BE', switzerland: 'CH', austria: 'AT',
  sweden: 'SE', norway: 'NO', denmark: 'DK', finland: 'FI', poland: 'PL', portugal: 'PT',
  'czech republic': 'CZ', czechia: 'CZ', romania: 'RO', greece: 'GR', hungary: 'HU', estonia: 'EE',
  lithuania: 'LT', latvia: 'LV', luxembourg: 'LU', ukraine: 'UA', israel: 'IL', india: 'IN',
  japan: 'JP', 'south korea': 'KR', korea: 'KR', 'republic of korea': 'KR', singapore: 'SG',
  australia: 'AU', 'new zealand': 'NZ', brazil: 'BR', mexico: 'MX', argentina: 'AR', colombia: 'CO',
  chile: 'CL', peru: 'PE', 'costa rica': 'CR', china: 'CN', taiwan: 'TW', 'hong kong': 'HK',
  'united arab emirates': 'AE', uae: 'AE', 'saudi arabia': 'SA', turkey: 'TR', 'türkiye': 'TR',
  'south africa': 'ZA', nigeria: 'NG', kenya: 'KE', egypt: 'EG', philippines: 'PH', vietnam: 'VN',
  thailand: 'TH', indonesia: 'ID', malaysia: 'MY', pakistan: 'PK',
  serbia: 'RS', qatar: 'QA', bulgaria: 'BG', croatia: 'HR', slovakia: 'SK', slovenia: 'SI',
  iceland: 'IS', malta: 'MT', cyprus: 'CY',
  // 3-letter codes
  ind: 'IN', can: 'CA', gbr: 'GB', deu: 'DE', fra: 'FR', irl: 'IE', jpn: 'JP', kor: 'KR', sgp: 'SG',
  aus: 'AU', bra: 'BR', mex: 'MX', nld: 'NL', che: 'CH', swe: 'SE', pol: 'PL', isr: 'IL', are: 'AE',
  qat: 'QA',
  // 2-letter codes that don't clash with US states / Canadian provinces
  ie: 'IE', gb: 'GB', jp: 'JP', kr: 'KR', sg: 'SG', au: 'AU', nz: 'NZ', br: 'BR', mx: 'MX', ae: 'AE', fr: 'FR',
};

// ISO code -> the name Google expects in Country objects (applicantLocationRequirements).
const COUNTRY_NAMES: Record<string, string> = {
  US: 'USA', CA: 'Canada', GB: 'United Kingdom', IE: 'Ireland', DE: 'Germany', FR: 'France',
  ES: 'Spain', IT: 'Italy', NL: 'Netherlands', BE: 'Belgium', CH: 'Switzerland', AT: 'Austria',
  SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland', PL: 'Poland', PT: 'Portugal',
  CZ: 'Czechia', RO: 'Romania', GR: 'Greece', HU: 'Hungary', EE: 'Estonia', LT: 'Lithuania',
  LV: 'Latvia', LU: 'Luxembourg', UA: 'Ukraine', IL: 'Israel', IN: 'India', JP: 'Japan',
  KR: 'South Korea', SG: 'Singapore', AU: 'Australia', NZ: 'New Zealand', BR: 'Brazil',
  MX: 'Mexico', AR: 'Argentina', CO: 'Colombia', CL: 'Chile', PE: 'Peru', CR: 'Costa Rica',
  CN: 'China', TW: 'Taiwan', HK: 'Hong Kong', AE: 'United Arab Emirates', SA: 'Saudi Arabia',
  TR: 'Turkey', ZA: 'South Africa', NG: 'Nigeria', KE: 'Kenya', EG: 'Egypt', PH: 'Philippines',
  VN: 'Vietnam', TH: 'Thailand', ID: 'Indonesia', MY: 'Malaysia', PK: 'Pakistan',
  RS: 'Serbia', QA: 'Qatar', BG: 'Bulgaria', HR: 'Croatia', SK: 'Slovakia', SI: 'Slovenia',
  IS: 'Iceland', MT: 'Malta', CY: 'Cyprus',
};

// Well-known cities where the country is obvious. US cities also carry their state.
const US_CITIES: Record<string, string> = {
  'san francisco': 'CA', 'mountain view': 'CA', sunnyvale: 'CA', 'san jose': 'CA', 'palo alto': 'CA',
  'menlo park': 'CA', 'redwood city': 'CA', 'santa clara': 'CA', 'los angeles': 'CA', 'san diego': 'CA',
  oakland: 'CA', irvine: 'CA', 'santa monica': 'CA', fremont: 'CA', 'san mateo': 'CA', 'foster city': 'CA',
  'south san francisco': 'CA', cupertino: 'CA', pasadena: 'CA', 'el segundo': 'CA',
  'new york': 'NY', 'new york city': 'NY', brooklyn: 'NY', seattle: 'WA', bellevue: 'WA', kirkland: 'WA',
  austin: 'TX', dallas: 'TX', houston: 'TX', boston: 'MA', chicago: 'IL', denver: 'CO', boulder: 'CO',
  atlanta: 'GA', miami: 'FL', phoenix: 'AZ', tempe: 'AZ', pittsburgh: 'PA', philadelphia: 'PA',
  'salt lake city': 'UT', detroit: 'MI', raleigh: 'NC', nashville: 'TN', memphis: 'TN', southaven: 'MS',
  minneapolis: 'MN', 'las vegas': 'NV',
};

const WORLD_CITIES: Record<string, string> = {
  london: 'GB', manchester: 'GB', edinburgh: 'GB', dublin: 'IE', paris: 'FR', berlin: 'DE', munich: 'DE',
  hamburg: 'DE', leonberg: 'DE', amsterdam: 'NL', zurich: 'CH', 'zürich': 'CH', geneva: 'CH',
  stockholm: 'SE', copenhagen: 'DK', oslo: 'NO', helsinki: 'FI', warsaw: 'PL', madrid: 'ES',
  barcelona: 'ES', lisbon: 'PT', milan: 'IT', rome: 'IT', vienna: 'AT', prague: 'CZ', brussels: 'BE',
  belgrade: 'RS', budapest: 'HU', bucharest: 'RO', athens: 'GR', tallinn: 'EE', kyiv: 'UA',
  istanbul: 'TR', 'tel aviv': 'IL', herzliya: 'IL', tokyo: 'JP', yokohama: 'JP', osaka: 'JP', seoul: 'KR',
  singapore: 'SG', bengaluru: 'IN', bangalore: 'IN', hyderabad: 'IN', mumbai: 'IN', delhi: 'IN',
  'new delhi': 'IN', pune: 'IN', chennai: 'IN', gurgaon: 'IN', gurugram: 'IN', sydney: 'AU',
  melbourne: 'AU', toronto: 'CA', vancouver: 'CA', montreal: 'CA', ottawa: 'CA', waterloo: 'CA',
  calgary: 'CA', 'sao paulo': 'BR', 'são paulo': 'BR', 'mexico city': 'MX', dubai: 'AE',
  'abu dhabi': 'AE', doha: 'QA', riyadh: 'SA', 'hong kong': 'HK', taipei: 'TW', shanghai: 'CN',
  beijing: 'CN', jakarta: 'ID', 'kuala lumpur': 'MY', manila: 'PH', bangkok: 'TH', nairobi: 'KE',
  lagos: 'NG', 'cape town': 'ZA', johannesburg: 'ZA',
  halifax: 'CA', 'ciudad de méxico': 'MX', 'ciudad de mexico': 'MX', cdmx: 'MX',
};

// Short names / area names -> the city we report.
const ALIASES: Record<string, string> = {
  sf: 'San Francisco',
  'sf bay area': 'San Francisco',
  'san francisco bay area': 'San Francisco',
  'bay area': 'San Francisco',
  nyc: 'New York City',
};

const stateByName = new Map<string, string>(
  Object.entries(US_STATES).map(([abbr, name]) => [name.toLowerCase(), abbr])
);
const provinceByName = new Map<string, string>(
  Object.entries(CA_PROVINCES).map(([abbr, name]) => [name.toLowerCase(), abbr])
);

// Splits one location field into separate places: ; | • · / "or" "and" "&"
const SPLIT_RE = /[;|•·\/]|\s+or\s+|\s+and\s+|\s+&\s+/i;

function isKnownCity(s: string): boolean {
  const k = s.toLowerCase();
  return !!(US_CITIES[k] || WORLD_CITIES[k] || ALIASES[k]);
}

// Removes the noise around a place name: (HQ), Hybrid, Office, Remote, U.S. -> US, D.C. -> DC ...
function tidy(s: string): string {
  return String(s ?? '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\bU\.S\.A\.?/gi, 'USA')
    .replace(/\bU\.S\.?/gi, 'US')
    .replace(/\bD\.C\.?/gi, 'DC')
    .replace(/\bremote[\s-]*friendly\b/gi, ' ')
    .replace(/\bremote\b/gi, ' ')
    .replace(/\b(hybrid|on-?site|in-?office|office|travel[\s-]*required)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,\-–—:]+|[\s,\-–—:]+$/g, '')
    .trim();
}

// "Hybrid - San Francisco, New York City, Austin" -> three places. Left alone when it is
// "City, State" or anything we don't recognise.
function expandCities(token: string): string[] {
  const parts = token.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return [token];
  const hasStateOrProvince = parts.some((p) => {
    const lower = p.toLowerCase();
    const upper = p.toUpperCase();
    return stateByName.has(lower) || provinceByName.has(lower) || !!US_STATES[upper] || !!CA_PROVINCES[upper];
  });
  if (hasStateOrProvince) return [token];
  return parts.every(isKnownCity) ? parts : [token];
}

// Words that are not places (or are too broad for an address): such a part is dropped, and a job
// whose whole location is like this gets no JobPosting markup instead of a made-up address.
const NOT_A_PLACE =
  /^(?:perm(?:anent)?|tbd|tba|none|na|various|multiple(?: locations)?|anywhere|flexible|global|worldwide|nationwide|tier\s*\d|asia|emea|apac|latam|europe|north america|west coast|east coast)$/i;

// One location field -> a clean list of single places. "Remote" parts are dropped.
export function splitPlaces(text: string): string[] {
  const prepared = String(text ?? '')
    .replace(/\bN\/A\b/gi, ' ') // "PERM - N/A" must not be split at the slash
    .replace(/\bUSCA\b/gi, 'United States and Canada');
  const out: string[] = [];
  for (const raw of prepared.split(SPLIT_RE)) {
    const t = tidy(raw);
    if (!t || NOT_A_PLACE.test(t)) continue;
    out.push(...expandCities(t));
  }
  return out;
}

// If the location says the job is fully remote, returns the region text ("United States", "U.S.",
// "Canada - Remote"...), otherwise null. Handles "Remote - X", "Remote, X" and "Remote (X)".
// "Remote-Friendly ..." is NOT fully remote.
export function remoteRegionOf(location: string): string | null {
  const t = String(location ?? '').trim();
  const m = t.match(/^remote(?:\s+-\s+|\s*,\s*)(.+)$/i) || t.match(/^remote\s*\(([^)]+)\)\s*$/i);
  return m ? m[1].trim() : null;
}

// "Mountain View, California (HQ)"  ->  { locality: 'Mountain View', region: 'CA', country: 'US' }
export function parsePlace(text: string): Parsed {
  const cleaned = tidy(String(text ?? ''));
  if (!cleaned) return {};

  const parts = cleaned.split(',').map((p) => p.trim()).filter(Boolean);
  let country: string | undefined;
  let region: string | undefined;
  let cityFromCountryToken: string | undefined;

  // "Sunnyvale, California USA": the country is stuck to the last part with no comma
  if (parts.length) {
    const lastRaw = parts[parts.length - 1];
    const glued = lastRaw.match(/^(.+?)\s+(USA|US)$/i);
    if (glued && !COUNTRIES[lastRaw.toLowerCase()]) {
      parts[parts.length - 1] = glued[1].trim();
      country = 'US';
    }
  }

  // "Northeast - United States": keep the country, drop an area name we don't know
  if (!country && parts.length) {
    const segs = parts[parts.length - 1].split(/\s+[-–—]\s+/);
    if (segs.length > 1) {
      const c = COUNTRIES[segs[segs.length - 1].toLowerCase()];
      if (c) {
        country = c;
        const prefix = segs.slice(0, -1).join(' - ');
        if (isKnownCity(prefix)) parts[parts.length - 1] = prefix;
        else parts.pop();
      }
    }
  }

  if (!country) {
    const last = parts[parts.length - 1]?.toLowerCase();
    if (last && COUNTRIES[last]) {
      country = COUNTRIES[last];
      // city-states like "Singapore" / "Hong Kong" are also the locality
      if (parts.length === 1 && WORLD_CITIES[last]) cityFromCountryToken = parts[0];
      parts.pop();
    }
  }

  if (parts.length) {
    const tail = parts[parts.length - 1];
    const upper = tail.toUpperCase();
    const lower = tail.toLowerCase();
    const hasCity = parts.length > 1;

    if (hasCity && US_STATES[upper] && (!country || country === 'US')) {
      region = upper; country = 'US'; parts.pop();
    } else if (hasCity && CA_PROVINCES[upper] && (!country || country === 'CA')) {
      region = upper; country = 'CA'; parts.pop();
    } else if (stateByName.has(lower) && (!country || country === 'US') && !(parts.length === 1 && isKnownCity(tail))) {
      // (a lone "New York" is the city, not the state)
      region = stateByName.get(lower); country = 'US'; parts.pop();
    } else if (provinceByName.has(lower) && (!country || country === 'CA')) {
      region = provinceByName.get(lower); country = 'CA'; parts.pop();
    } else if (country && hasCity) {
      // e.g. "Munich, Bavaria, Germany": the middle part is the region
      region = tail;
      parts.pop();
    }
  }

  let locality = parts.join(', ') || cityFromCountryToken || undefined;

  // Short names: "SF", "NYC", "San Francisco Bay Area" -> the real city
  if (locality) {
    const alias = ALIASES[locality.toLowerCase()];
    if (alias) locality = alias;
  }

  // City alone, no country written: use the well-known list
  if (!country && locality) {
    const key = locality.toLowerCase();
    if (US_CITIES[key]) {
      country = 'US';
      region = region ?? US_CITIES[key];
    } else if (WORLD_CITIES[key]) {
      country = WORLD_CITIES[key];
    } else if (key === 'washington, dc' || key === 'washington dc') {
      country = 'US'; region = 'DC'; locality = 'Washington';
    }
  }

  return { locality, region, country };
}

export type Place = {
  '@type': 'Place';
  address: { '@type': 'PostalAddress'; addressLocality?: string; addressRegion?: string; addressCountry?: string };
};

// For a job done in an office. Pass the raw location text(s); each may hold several places
// ("San Francisco | New York", "NYC / Sunnyvale"). Returns only the places we could read.
export function officePlaces(placeTexts: string[]): Place[] {
  const parsed: Parsed[] = [];
  for (const text of placeTexts) {
    for (const piece of splitPlaces(text)) {
      const p = parsePlace(piece);
      if (!p.locality && !p.country) continue;
      parsed.push(p);
    }
  }

  // A bare "United States" next to real US cities adds nothing, so skip it.
  const countriesWithDetail = new Set(parsed.filter((p) => p.locality || p.region).map((p) => p.country));

  const seen = new Set<string>();
  const places: Place[] = [];
  for (const p of parsed) {
    if (!p.locality && !p.region && p.country && countriesWithDetail.has(p.country)) continue;
    const key = `${p.locality}|${p.region}|${p.country}`;
    if (seen.has(key)) continue;
    seen.add(key);
    places.push({
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        ...(p.locality ? { addressLocality: p.locality } : {}),
        ...(p.region ? { addressRegion: p.region } : {}),
        ...(p.country ? { addressCountry: p.country } : {}),
      },
    });
    if (places.length >= 25) break;
  }
  return places;
}

export type Target = { '@type': 'Country' | 'State'; name: string };

// True for "Ontario, Canada", "California", "US", "Japan": a country or state with no city.
function isRegionOnly(s: string): boolean {
  const p = parsePlace(s);
  return !!p.country && !p.locality;
}

// For a fully remote job: the Country / State objects Google accepts. Anything we can't tie to
// a real country ("EMEA", "Worldwide", "Europe") produces no target, so the markup is left out.
export function remoteTargets(regionText: string): Target[] {
  const tokens = String(regionText ?? '')
    .split(/[|;•\/]|\s+or\s+|\s+and\s+/i)
    .map((t) => tidy(t))
    .filter(Boolean);

  const out: Target[] = [];
  const seen = new Set<string>();
  const add = (t: Target) => {
    const k = `${t['@type']}|${t.name}`;
    if (!seen.has(k)) {
      seen.add(k);
      out.push(t);
    }
  };

  // "US, UK" is two countries; "Ontario, Canada" is one province; "San Francisco, CA" is one city.
  const candidates: string[] = [];
  for (const t of tokens) {
    const whole = parsePlace(t);
    const pieces = t.split(',').map((s) => s.trim()).filter(Boolean);
    const isStateInCountry = !!whole.region && !whole.locality;
    if (pieces.length > 1 && !isStateInCountry && pieces.every(isRegionOnly)) candidates.push(...pieces);
    else candidates.push(t);
  }

  for (const token of candidates) {
    const p = parsePlace(token);
    if (!p.country) continue;
    if (p.region && !p.locality) {
      const stateName = p.country === 'US' ? US_STATES[p.region] : CA_PROVINCES[p.region];
      const countryName = p.country === 'US' ? 'USA' : 'Canada';
      add({ '@type': 'State', name: `${stateName}, ${countryName}` });
    } else {
      add({ '@type': 'Country', name: COUNTRY_NAMES[p.country] ?? p.country });
    }
  }
  return out.slice(0, 10);
}

// True only when every place we found is in the United States. Used to decide whether it is
// safe to label a salary as USD (the jobs table has no currency column).
export function allInUS(places: Place[], targets: Target[]): boolean {
  const countries = [
    ...places.map((p) => p.address.addressCountry),
    ...targets.map((t) => (t['@type'] === 'Country' ? (t.name === 'USA' ? 'US' : t.name) : /, USA$/.test(t.name) ? 'US' : t.name)),
  ];
  return countries.length > 0 && countries.every((c) => c === 'US');
}

// Picks the employment type from the title/description. Falls back to FULL_TIME when nothing says otherwise.
export function inferEmploymentType(title: string, description: string): string {
  if (/\b(intern|interns|internship|co-?op)\b/i.test(title)) return 'INTERN';
  if (/\b(contractor|contract|freelance)\b/i.test(title)) return 'CONTRACTOR';
  if (/\b(temporary|temp)\b/i.test(title)) return 'TEMPORARY';
  if (/\bpart[- ]?time\b/i.test(title)) return 'PART_TIME';
  if (/\bfull[- ]?time\b|\bpermanent\b/i.test(description)) return 'FULL_TIME';
  // Fallback: the title shows no other type, so assume the usual case.
  return 'FULL_TIME';
}