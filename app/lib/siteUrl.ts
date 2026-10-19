// Used only if NEXT_PUBLIC_SITE_URL is missing or invalid. Must be your real, final domain.
const FALLBACK = 'https://www.coretechroles.com';

// Reads NEXT_PUBLIC_SITE_URL safely. Handles empty values, a missing "https://",
// and trailing slashes, so a typo in the env var can never break the build.
export function getSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || '').trim();
  if (!raw) return FALLBACK;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return FALLBACK;
  }
}