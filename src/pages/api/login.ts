import type { APIRoute } from 'astro';
import { verifyPassword, sessionToken, ADMIN_COOKIE } from '@lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  let pw = '';
  try {
    const body = await request.json();
    pw = typeof body?.password === 'string' ? body.password : '';
  } catch {
    /* ignore */
  }
  if (!pw || !(await verifyPassword(pw))) {
    return new Response(JSON.stringify({ ok: false, error: '密码错误' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
  cookies.set(ADMIN_COOKIE, await sessionToken(), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 天
  });
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};

export const GET: APIRoute = async () => {
  return new Response('Use POST with { password }', { status: 405 });
};
