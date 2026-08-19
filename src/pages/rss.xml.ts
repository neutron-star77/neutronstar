import type { APIRoute } from 'astro';
import { listPosts } from '@lib/posts';
import { SITE } from '../config';

export const GET: APIRoute = async () => {
  const posts = (await listPosts('blog')).sort((a, b) => b.date.localeCompare(a.date));

  const items = posts
    .map((p) => {
      const url = `${SITE.url}/blog/${p.slug}`;
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escapeXml(p.description)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <link>${SITE.url}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>zh-CN</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};

function escapeXml(s: string): string {
  return (s ?? '').replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string),
  );
}
