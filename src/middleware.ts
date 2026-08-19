import { defineMiddleware } from 'astro/middleware';
import { isAuthed, ADMIN_COOKIE } from './lib/auth';

/** 无需登录即可访问的后台路径 */
const PUBLIC_ADMIN = new Set(['/admin/login', '/admin/reset']);

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies } = context;
  if (url.pathname.startsWith('/admin') && !PUBLIC_ADMIN.has(url.pathname)) {
    const ok = await isAuthed(cookies.get(ADMIN_COOKIE)?.value);
    if (!ok) return context.redirect('/admin/login');
  }
  return next();
});
