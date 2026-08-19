import type { APIRoute } from 'astro';
import { hasResetEmail, isResetEmail, createResetToken } from '@lib/reset';
import { sendPasswordResetEmail } from '@lib/mail';

/**
 * 忘记密码：提交登记邮箱 → 校验匹配后生成一次性 token 并发重置邮件。
 * 防枚举：无论邮箱是否登记，均返回相同提示。
 */
export const POST: APIRoute = async ({ request, url }) => {
  let email = '';
  try {
    const body = await request.json();
    email = typeof body?.email === 'string' ? body.email.trim() : '';
  } catch {
    /* ignore */
  }

  if (email && (await hasResetEmail()) && (await isResetEmail(email))) {
    const token = await createResetToken();
    const link = `${url.origin}/admin/reset?token=${token}`;
    await sendPasswordResetEmail(email, link);
  }

  return new Response(
    JSON.stringify({
      ok: true,
      message: '如果该邮箱已登记，重置链接已发送到邮箱，15 分钟内有效。',
    }),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
};

export const GET: APIRoute = async () => {
  return new Response('Use POST with { email }', { status: 405 });
};
