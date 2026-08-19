import { getSetting } from './settings';

export const ADMIN_COOKIE = 'ns_admin';

function bufToHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** 计算会话令牌：admin 密码的 sha256。与 cookie 比对即完成鉴权（个人博客，无状态） */
export async function sessionToken(): Promise<string> {
  const pw = await getSetting('admin_password', 'neutronstar');
  const data = new TextEncoder().encode('neutronstar::' + pw);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bufToHex(digest);
}

export async function verifyPassword(pw: string): Promise<boolean> {
  const stored = await getSetting('admin_password', 'neutronstar');
  return pw === stored;
}

export async function isAuthed(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  return cookieValue === (await sessionToken());
}

/** API 鉴权：未登录返回 401 JSON。返回是否通过。 */
export async function requireApiAuth(context: {
  cookies: { get(name: string): { value?: string } | undefined };
}): Promise<boolean> {
  return isAuthed(context.cookies.get(ADMIN_COOKIE)?.value);
}
