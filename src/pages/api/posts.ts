import type { APIRoute } from 'astro';
import { listPosts, createPost } from '@lib/posts';
import { requireApiAuth } from '@lib/auth';
import type { PostInput, PostType } from '@lib/types';

const TYPES: PostType[] = ['blog', 'diary', 'project'];

function parseInput(body: any): PostInput | null {
  if (!body || typeof body !== 'object') return null;
  const type = TYPES.includes(body.type) ? body.type : 'blog';
  if (typeof body.title !== 'string' || !body.title.trim()) return null;
  if (typeof body.content !== 'string') return null;
  const input: PostInput = {
    type,
    slug: typeof body.slug === 'string' ? body.slug : '',
    title: body.title.trim(),
    content: body.content,
    description: typeof body.description === 'string' ? body.description : '',
    cover: typeof body.cover === 'string' ? body.cover : '',
    category: typeof body.category === 'string' ? body.category : '',
    date: typeof body.date === 'string' ? body.date : '',
    draft: body.draft === true || body.draft === 1,
    tags: Array.isArray(body.tags) ? body.tags.map(String) : typeof body.tags === 'string' ? body.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
  };
  return input;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

export const GET: APIRoute = async ({ url, cookies }) => {
  if (!(await requireApiAuth({ cookies }))) return json({ error: '未登录' }, 401);
  const type = url.searchParams.get('type') as PostType | null;
  const withDrafts = url.searchParams.get('drafts') !== '0';
  const posts = await listPosts(type && TYPES.includes(type) ? type : undefined, {
    drafts: withDrafts,
  });
  return json({ posts });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await requireApiAuth({ cookies }))) return json({ error: '未登录' }, 401);
  let body: any = null;
  try {
    body = await request.json();
  } catch {
    return json({ error: '无效的请求体' }, 400);
  }
  const input = parseInput(body);
  if (!input) return json({ error: '缺少必填字段（标题/内容）' }, 400);
  const id = await createPost(input);
  return json({ ok: true, id }, 201);
};
