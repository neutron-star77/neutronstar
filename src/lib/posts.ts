import { getDB } from './db';
import type { Post, PostInput, PostType, TagCount } from './types';

interface PostRow {
  id: number;
  type: string;
  slug: string;
  title: string;
  description: string | null;
  cover: string | null;
  content: string | null;
  tags: string | null;
  category: string | null;
  date: string | null;
  draft: number;
  created_at: string;
  updated_at: string;
}

function rowToPost(r: PostRow): Post {
  return {
    id: r.id,
    type: r.type as PostType,
    slug: r.slug,
    title: r.title,
    description: r.description ?? '',
    cover: r.cover ?? '',
    content: r.content ?? '',
    tags: r.tags ? r.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    category: r.category ?? '',
    date: r.date ?? r.created_at,
    draft: !!r.draft,
  };
}

/** 列出文章。默认仅公开稿；传 drafts:true 含草稿（后台用）。 */
export async function listPosts(
  type?: PostType,
  opts: { drafts?: boolean } = {},
): Promise<Post[]> {
  const db = getDB();
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (type) {
    where.push('type = ?');
    params.push(type);
  }
  if (!opts.drafts) {
    where.push('draft = 0');
  }
  const sql =
    'SELECT * FROM posts' +
    (where.length ? ' WHERE ' + where.join(' AND ') : '') +
    ' ORDER BY datetime(COALESCE(date, created_at)) DESC, created_at DESC';
  const res = await db.prepare(sql).bind(...params).all<PostRow>();
  return (res.results ?? []).map(rowToPost);
}

export async function getPost(type: PostType, slug: string): Promise<Post | null> {
  const db = getDB();
  const r = await db
    .prepare('SELECT * FROM posts WHERE type = ? AND slug = ?')
    .bind(type, slug)
    .first<PostRow>();
  return r ? rowToPost(r) : null;
}

export async function getPostById(id: number): Promise<Post | null> {
  const db = getDB();
  const r = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first<PostRow>();
  return r ? rowToPost(r) : null;
}

export async function allTags(): Promise<TagCount[]> {
  const posts = await listPosts();
  const map = new Map<string, number>();
  for (const p of posts) for (const t of p.tags) map.set(t, (map.get(t) ?? 0) + 1);
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export async function recentPosts(limit = 5): Promise<Post[]> {
  const all = await listPosts('blog');
  return all.slice(0, limit);
}

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || `post-${Date.now()}`;
}

export async function createPost(input: PostInput): Promise<number> {
  const db = getDB();
  const slug = input.slug?.trim() || slugify(input.title);
  const tags = (input.tags ?? []).join(',');
  const res = await db
    .prepare(
      `INSERT INTO posts (type, slug, title, description, cover, content, tags, category, date, draft, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    )
    .bind(
      input.type,
      slug,
      input.title,
      input.description ?? '',
      input.cover ?? '',
      input.content,
      tags,
      input.category ?? '',
      input.date || new Date().toISOString().slice(0, 10),
      input.draft ? 1 : 0,
    )
    .run();
  return Number((res.meta as any)?.last_row_id ?? 0);
}

export async function updatePost(id: number, input: PostInput): Promise<void> {
  const db = getDB();
  const slug = input.slug?.trim() || slugify(input.title);
  const tags = (input.tags ?? []).join(',');
  await db
    .prepare(
      `UPDATE posts SET type=?, slug=?, title=?, description=?, cover=?, content=?, tags=?, category=?, date=?, draft=?, updated_at=datetime('now') WHERE id=?`,
    )
    .bind(
      input.type,
      slug,
      input.title,
      input.description ?? '',
      input.cover ?? '',
      input.content,
      tags,
      input.category ?? '',
      input.date || new Date().toISOString().slice(0, 10),
      input.draft ? 1 : 0,
      id,
    )
    .run();
}

export async function deletePost(id: number): Promise<void> {
  const db = getDB();
  await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
}
