/// <reference types="astro/client" />

// Cloudflare Runtime / D1 绑定类型
declare namespace App {
  interface RuntimeEnv {
    DB: D1Database;
  }
}
