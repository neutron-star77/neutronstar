import type { APIRoute } from 'astro';
import { getSettings, setSettingsBatch } from '@lib/settings';
import { requireApiAuth } from '@lib/auth';
import { DEFAULT_SETTINGS, COMPONENT_TOGGLES } from '@lib/types';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

/** 允许写入的 key 白名单 */
const ALLOWED = new Set<string>([
  ...Object.keys(DEFAULT_SETTINGS),
  ...COMPONENT_TOGGLES.map((t) => t.key),
]);

export const GET: APIRoute = async ({ cookies }) => {
  if (!(await requireApiAuth({ cookies }))) return json({ error: '未登录' }, 401);
  const settings = await getSettings(false);
  return json({ settings });
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!(await requireApiAuth({ cookies }))) return json({ error: '未登录' }, 401);
  let body: any = null;
  try {
    body = await request.json();
  } catch {
    return json({ error: '无效的请求体' }, 400);
  }
  if (!body || typeof body !== 'object') return json({ error: '无效的请求体' }, 400);
  const map: Record<string, string> = {};
  for (const [k, v] of Object.entries(body)) {
    if (ALLOWED.has(k) && typeof v === 'string') map[k] = v;
  }
  if (Object.keys(map).length) await setSettingsBatch(map);
  return json({ ok: true });
};
