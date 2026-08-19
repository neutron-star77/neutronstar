import { getDB } from './db';
import { getSetting } from './settings';

/** sha256 hex 编码 */
export async function sha256Hex(s: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** 生成随机一次性 token（64 位 hex），返回原始 token + 存库用的哈希 */
async function newResetToken(): Promise<{ token: string; hash: string }> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const token = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return { token, hash: await sha256Hex(token) };
}

/** 校验邮箱是否后台登记的「忘记密码」邮箱（不区分大小写、去空白） */
export async function isResetEmail(email: string): Promise<boolean> {
  const registered = (await getSetting('reset_email', '')).trim().toLowerCase();
  return registered !== '' && email.trim().toLowerCase() === registered;
}

/** 登记的重置邮箱是否已配置 */
export async function hasResetEmail(): Promise<boolean> {
  return (await getSetting('reset_email', '')).trim() !== '';
}

/**
 * 创建并落库一个 15 分钟有效的重置 token，返回原始 token（用于拼装邮件链接）。
 * 同一时刻只保留最近一个有效 token：先作废历史未用 token 再插入。
 */
export async function createResetToken(): Promise<string> {
  const db = getDB();
  const { token, hash } = await newResetToken();
  await db.prepare('DELETE FROM password_resets WHERE used = 0').run();
  await db
    .prepare("INSERT INTO password_resets (token_hash, expires_at) VALUES (?, datetime('now', '+15 minutes'))")
    .bind(hash)
    .run();
  return token;
}

/** 消费 token 重置密码；成功返回 true（token 必须未用且未过期，用后立即作废） */
export async function consumeResetToken(token: string, newPassword: string): Promise<boolean> {
  const db = getDB();
  const hash = await sha256Hex(token);
  const row = await db
    .prepare(
      "SELECT token_hash FROM password_resets WHERE token_hash = ? AND used = 0 AND expires_at > datetime('now')",
    )
    .bind(hash)
    .first<{ token_hash: string }>();
  if (!row) return false;
  await db.prepare('UPDATE password_resets SET used = 1 WHERE token_hash = ?').bind(hash).run();
  await db
    .prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .bind('admin_password', newPassword)
    .run();
  return true;
}
