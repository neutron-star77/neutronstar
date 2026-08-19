import type { APIRoute } from 'astro';
import { consumeResetToken } from '@lib/reset';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

/** 重置密码：使用一次性 token + 新密码 */
export const POST: APIRoute = async ({ request }) => {
  let token = '';
  let password = '';
  try {
    const body = await request.json();
    token = typeof body?.token === 'string' ? body.token : '';
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    return json({ ok: false, error: '无效的请求体' }, 400);
  }

  if (!token) return json({ ok: false, error: '重置链接无效，请重新发起重置' }, 400);
  if (password.length < 6) return json({ ok: false, error: '新密码至少 6 位' }, 400);

  const ok = await consumeResetToken(token, password);
  if (!ok) return json({ ok: false, error: '重置链接无效或已过期，请重新发起重置' }, 400);

  return json({ ok: true, message: '密码已重置，请使用新密码登录。' });
};

export const GET: APIRoute = async () => {
  return new Response('Use POST with { token, password }', { status: 405 });
};
