// Helpers that turn a job's location text into the shapes Google's JobPosting markup accepts.
//   - Remote jobs need applicantLocationRequirements made of Country or State objects (nothing else).
//   - Office jobs need jobLocation with an address that includes addressCountry where we can tell it.
// When we can't work out a valid place, the helpers return nothing and the page leaves the JobPosting
// markup out, rather than sending Google something invalid.

type Parsed = { locality?: string; region?: string; country?: string };

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
};

// Well-known cities where the country is obvious. US cities also carry their state.
const US_CITIES: Record<string, string> = {
  'san francisco': 'CA', 'mountain view': 'CA', sunnyvale: 'CA', 'san jose': 'CA', 'palo alto': 'CA',
  'menlo park': 'CA', 'redwood city': 'CA', 'santa clara': 'CA', 'los angeles': 'CA', 'san diego': 'CA',
  oakland: 'CA', irvine: 'CA', 'santa monica': 'CA', fremont: 'CA', 'new york': 'NY', 'new york city': 'NY',
  brooklyn: 'NY', seattle: 'WA', bellevue: 'WA', kirkland: 'WA', austin: 'TX', dallas: 'TX', houston: 'TX',
  boston: 'MA', chicago: 'IL', denver: 'CO', atlanta: 'GA', miami: 'FL', phoenix: 'AZ', pittsburgh: 'PA',
  philadelphia: 'PA', 'salt lake city': 'UT', detroit: 'MI', raleigh: 'NC', nashville: 'TN',
  minneapolis: 'MN', 'las vegas': 'NV',
};

const WORLD_CITIES: Record<string, string> = {
  london: 'GB', manchester: 'GB', edinburgh: 'GB', dublin: 'IE', paris: 'FR', berlin: 'DE', munich: 'DE',
  hamburg: 'DE', amsterdam: 'NL', zurich: 'CH', 'zürich': 'CH', geneva: 'CH', stockholm: 'SE',
  copenhagen: 'DK', oslo: 'NO', helsinki: 'FI', warsaw: 'PL', madrid: 'ES', barcelona: 'ES', lisbon: 'PT',
  milan: 'IT', rome: 'IT', vienna: 'AT', prague: 'CZ', brussels: 'BE', 'tel aviv': 'IL', tokyo: 'JP',
  osaka: 'JP', seoul: 'KR', singapore: 'SG', bengaluru: 'IN', bangalore: 'IN', hyderabad: 'IN',
  mumbai: 'IN', delhi: 'IN', 'new delhi': 'IN', pune: 'IN', gurgaon: 'IN', gurugram: 'IN', sydney: 'AU',
  melbourne: 'AU', toronto: 'CA', vancouver: 'CA', montreal: 'CA', ottawa: 'CA', waterloo: 'CA',
  calgary: 'CA', 'sao paulo': 'BR', 'são paulo': 'BR', 'mexico city': 'MX', dubai: 'AE',
  'abu dhabi': 'AE', riyadh: 'SA', 'hong kong': 'HK', taipei: 'TW', shanghai: 'CN', beijing: 'CN',
  jakarta: 'ID', 'kuala lumpur': 'MY', manila: 'PH', bangkok: 'TH', nairobi: 'KE', lagos: 'NG',
  'cape town': 'ZA', johannesburg: 'ZA',
};

const stateByName = new Map<string, string>(
  Object.entries(US_STATES).map(([abbr, name]) => [name.toLowerCase(), abbr])
);
const provinceByName = new Map<string, string>(
  Object.entries(CA_PROVINCES).map(([abbr, name]) => [name.toLowerCase(), abbr])
);

// "Mountain View, California (HQ)"  ->  { locality: 'Mountain View', region: 'CA', country: 'US' }
export function parsePlace(text: string): Parsed {
  const cleaned = String(text ?? '').replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return {};

  const parts = cleaned.split(',').map((p) => p.trim()).filter(Boolean);
  let country: string | undefined;
  let region: string | undefined;

  const last = parts[parts.length - 1]?.toLowerCase();
  if (last && COUNTRIES[last]) {
    country = COUNTRIES[last];
    parts.pop();
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
    } else if (stateByName.has(lower) && (!country || country === 'US')) {
      region = stateByName.get(lower); country = 'US'; parts.pop();
    } else if (provinceByName.has(lower) && (!country || country === 'CA')) {
      region = provinceByName.get(lower); country = 'CA'; parts.pop();
    } else if (country && hasCity) {
      // e.g. "Munich, Bavaria, Germany": the middle part is the region
      region = tail;
      parts.pop();
    }
  }

  let locality = parts.join(', ') || undefined;

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

type Place = {
  '@type': 'Place';
  address: { '@type': 'PostalAddress'; addressLocality?: string; addressRegion?: string; addressCountry?: string };
};

// For a job done in an office: a list of Places (only ones we could read).
export function officePlaces(placeTexts: string[]): Place[] {
  const seen = new Set<string>();
  const places: Place[] = [];
  for (const text of placeTexts) {
    const p = parsePlace(text);
    if (!p.locality && !p.country) continue;
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

type Target = { '@type': 'Country' | 'State'; name: string };

// For a fully remote job: the Country / State objects Google accepts. Anything we can't tie to
// a real country ("EMEA", "Worldwide", "Europe") produces no target, so the markup is left out.
export function remoteTargets(regionText: string): Target[] {
  const tokens = String(regionText ?? '')
    .split(/[|;/]|\s+or\s+|\s+and\s+/i)
    .map((t) => t.trim())
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

  for (const token of tokens) {
    const p = parsePlace(token);
    if (!p.country) continue;
    if (p.region && !p.locality) {
      const stateName = p.country === 'US' ? US_STATES[p.region] : CA_PROVINCES[p.region];
      const countryName = p.country === 'US' ? 'USA' : 'Canada';
      add({ '@type': 'State', name: `${stateName}, ${countryName}` });
    } else {
      add({ '@type': 'Country', name: p.country });
    }
  }
  return out.slice(0, 10);
}

// Only say a job is full-time / an internship etc. when the posting says so.
export function inferEmploymentType(title: string, description: string): string | undefined {
  if (/\b(intern|interns|internship|co-?op)\b/i.test(title)) return 'INTERN';
  if (/\b(contractor|contract|freelance)\b/i.test(title)) return 'CONTRACTOR';
  if (/\b(temporary|temp)\b/i.test(title)) return 'TEMPORARY';
  if (/\bpart[- ]time\b/i.test(title)) return 'PART_TIME';
  if (/\bfull[- ]time\b/i.test(description)) return 'FULL_TIME';
  return undefined;
}