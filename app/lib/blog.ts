import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { siteConfig } from './siteConfig';

const POSTS_DIR = path.join(process.cwd(), 'content', 'blog');

export function getPostHtml(slug: string): { html: string; words: number } | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  const file = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;

  const markdown = fs.readFileSync(file, 'utf8').replace(/\{\{SITE_NAME\}\}/g, siteConfig.name);
  
  // FIX: This line strips the --- frontmatter block so it doesn't render on the screen
  const cleanMarkdown = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---/, '').trim();
  
  const raw = marked.parse(cleanMarkdown, { async: false }) as string;

  const html = sanitizeHtml(raw, {
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'name', 'target', 'rel'],
    },
    transformTags: {
      h1: 'h2',
      a: (tagName, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href || '');
        return {
          tagName: 'a',
          attribs: external ? { ...attribs, target: '_blank', rel: 'noopener noreferrer' } : attribs,
        };
      },
    },
  });

  return { html, words: cleanMarkdown.split(/\s+/).filter(Boolean).length };
}