import { env } from 'cloudflare:workers';
import { getSetting } from './settings';

/**
 * 通过 Resend API 发送后台密码重置邮件。
 * 需要已配置 RESEND_API_KEY（wrangler secret put RESEND_API_KEY）。
 * Cloudflare Workers 不允许直连 SMTP 端口（25/465/587 被平台封禁），
 * 因此统一走 Resend 的 REST API（免费额度 100 封/月，个人博客足够）。
 */
export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
  const apiKey = (env as unknown as { RESEND_API_KEY?: string }).RESEND_API_KEY;
  if (!apiKey) return false;

  const siteTitle = (await getSetting('site_title', 'NeutronStar')) || 'NeutronStar';
  const from =
    (await getSetting('reset_email_from', '')).trim() || 'NeutronStar <onboarding@resend.dev>';

  const html = `<!doctype html>
<html lang="zh-CN">
<body style="margin:0;padding:32px 16px;background:#0a0e1a;font-family:ui-sans-serif,system-ui,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;color:#e6ecf7">
  <div style="max-width:520px;margin:0 auto;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:32px">
    <h1 style="margin:0 0 8px;font-size:20px;color:#22d3ee">${siteTitle} · 后台密码重置</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#8a94ad">
      我们收到了你的密码重置请求。点击下方按钮设置新密码，链接 15 分钟内有效。
      <br/>如果这不是你的操作，请忽略本邮件，你的密码不会发生变化。
    </p>
    <p style="margin:0 0 24px;text-align:center">
      <a href="${resetLink}" style="display:inline-block;padding:11px 28px;background:linear-gradient(90deg,#22d3ee,#0ea5c4);color:#04141c;font-weight:700;font-size:14px;border-radius:10px;text-decoration:none">重置密码</a>
    </p>
    <p style="margin:0;font-size:12px;color:#8a94ad;word-break:break-all">
      若按钮无法点击，请复制以下链接到浏览器打开：<br/><a href="${resetLink}" style="color:#22d3ee">${resetLink}</a>
    </p>
  </div>
</body>
</html>`;

  const text = `${siteTitle} · 后台密码重置\n\n我们收到了你的密码重置请求。请在 15 分钟内打开以下链接设置新密码（若非本人操作请忽略）：\n${resetLink}`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to: [to], subject: `【${siteTitle}】后台密码重置`, html, text }),
    });
    if (!res.ok) {
      console.error('Resend 发送失败:', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (e) {
    console.error('Resend 发送异常:', e);
    return false;
  }
}
