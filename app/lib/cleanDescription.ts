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

export function cleanDescription(raw: string) {
  const hasRealTags = /<(p|div|ul|ol|li|h[1-6]|br|strong|em|b|a|span)[\s>/]/i.test(raw || '');
  const html = hasRealTags ? raw : decodeHtml(raw);

  return sanitizeHtml(html, {
    transformTags: {
      h1: 'h2', // keep exactly one H1 per page
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'noopener noreferrer nofollow',
        target: '_blank',
      }),
    },
  });
}