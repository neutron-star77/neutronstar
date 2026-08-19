import type { APIRoute } from 'astro';
import { renderMarkdown } from '@lib/markdown';

/** 后台编辑器实时预览：接收 markdown，返回渲染后的 HTML */
export const POST: APIRoute = async ({ request }) => {
  let content = '';
  try {
    const body = await request.json();
    content = typeof body?.content === 'string' ? body.content : typeof body?.markdown === 'string' ? body.markdown : '';
  } catch {
    content = '';
  }
  const html = renderMarkdown(content);
  return new Response(JSON.stringify({ html }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
};

export const GET: APIRoute = async () => {
  return new Response('Use POST with { content }', { status: 405 });
};
