import { env } from 'cloudflare:workers';

/**
 * 获取 Cloudflare D1 数据库句柄。
 * 通过 `cloudflare:workers` 虚拟模块读取运行时注入的 env（不经过
 * `@astrojs/cloudflare` 包入口，避免把 wrangler CLI 依赖拖进 worker bundle）。
 */
export function getDB(): D1Database {
  return env.DB as D1Database;
}
