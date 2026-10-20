import fs from 'fs';
import path from 'path';
import { siteConfig } from './siteConfig';

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
};

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export function getPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_DIR);
  const mdFiles = files.filter((file) => file.endsWith('.md'));

  const posts: PostMeta[] = [];

  for (const filename of mdFiles) {
    const slug = filename.replace(/\.md$/, '');
    const filePath = path.join(BLOG_DIR, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // 1. Check for YAML frontmatter (between --- and ---)
    const frontmatterMatch = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);

    let title = '';
    let description = '';
    let date = '';
    let tags: string[] = [];
    let updated: string | undefined = undefined;

    if (frontmatterMatch) {
      const yaml = frontmatterMatch[1];
      for (const line of yaml.split('\n')) {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) continue;
        const key = line.slice(0, colonIndex).trim().toLowerCase();
        const val = line.slice(colonIndex + 1).trim().replace(/^['"]|['"]$/g, '');

        if (key === 'title') title = val;
        if (key === 'description') description = val;
        if (key === 'date') date = val;
        if (key === 'updated') updated = val;
        if (key === 'tags') {
          tags = val
            .replace(/^\[\vert{}\]$/g, '')
            .split(',')
            .map((t) => t.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean);
        }
      }
    }

    // 2. Clean content without frontmatter for fallbacks
    const cleanContent = fileContent.replace(/^---\r?\n[\s\S]*?\r?\n---/, '').trim();

    // Fallback: If no title in frontmatter, grab the first # Heading or use filename
    if (!title) {
      const headingMatch = cleanContent.match(/^#+\s+(.+)$/m);
      if (headingMatch) {
        title = headingMatch[1].trim();
      } else {
        title = slug
          .split(/[-_]/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }

    // Fallback: If no description, take the first paragraph of text
    if (!description) {
      const paragraphs = cleanContent
        .split(/\r?\n\r?\n/)
        .map((p) => p.trim())
        .filter(
          (p) =>
            p &&
            !p.startsWith('#') &&
            !p.startsWith('!') &&
            !p.startsWith('*') &&
            !p.startsWith('-')
        );

      if (paragraphs.length > 0) {
        description = paragraphs[0]
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // strip markdown links
          .slice(0, 160)
          .trim();
        if (paragraphs[0].length > 160) description += '...';
      } else {
        description = `Read our latest article on ${siteConfig.name}.`;
      }
    }

    // Fallback: If no date, use file timestamp or today
    if (!date) {
      try {
        const stats = fs.statSync(filePath);
        date = stats.mtime.toISOString().split('T')[0];
      } catch {
        date = new Date().toISOString().split('T')[0];
      }
    }

    if (tags.length === 0) {
      tags = ['Data Report'];
    }

    // Replace {{SITE_NAME}} if present
    title = title.replace(/\{\{SITE_NAME\}\}/g, siteConfig.name);
    description = description.replace(/\{\{SITE_NAME\}\}/g, siteConfig.name);

    posts.push({
      slug,
      title,
      description,
      date,
      updated,
      tags,
    });
  }

  // Sort newest first
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

// Backwards compatibility for any file importing `posts`
export const posts: PostMeta[] = getPosts();

export function getPostMeta(slug: string): PostMeta | undefined {
  return getPosts().find((p) => p.slug === slug);
}