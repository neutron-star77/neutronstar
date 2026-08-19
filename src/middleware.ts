import { defineMiddleware } from 'astro/middleware';
import { isAuthed, ADMIN_COOKIE } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies } = context;
  if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
    const ok = await isAuthed(cookies.get(ADMIN_COOKIE)?.value);
    if (!ok) return context.redirect('/admin/login');
  }
  return next();
});
