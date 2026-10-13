import sanitizeHtml from 'sanitize-html';

// Decode HTML entities, then sanitize so scraped descriptions can't inject scripts.
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
  return sanitizeHtml(decodeHtml(raw), {
    transformTags: {
      h1: 'h2', // keep exactly one H1 per page
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'noopener noreferrer nofollow',
        target: '_blank',
      }),
    },
  });
}