import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const POSTS_DIR = path.join(process.cwd(), 'content', 'blog');

// Reads content/blog/<slug>.md and returns safe HTML. Only used while the site is being built.
export function getPostHtml(slug: string): { html: string; words: number } | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  const file = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;

  const markdown = fs.readFileSync(file, 'utf8');
  const raw = marked.parse(markdown, { async: false }) as string;

  const html = sanitizeHtml(raw, {
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'name', 'target', 'rel'],
    },
    transformTags: {
      h1: 'h2', // the page title is the only H1
      a: (tagName, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href || '');
        return {
          tagName: 'a',
          attribs: external ? { ...attribs, target: '_blank', rel: 'noopener noreferrer' } : attribs,
        };
      },
    },
  });

  return { html, words: markdown.split(/\s+/).filter(Boolean).length };
}