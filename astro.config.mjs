// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import swup from '@swup/astro';

// 静态构建，部署到 Cloudflare Pages（构建输出 dist，无需服务端适配器）
export default defineConfig({
  site: 'https://blog.neutronstar.fun',
  trailingSlash: 'ignore',
  server: { port: 8080 },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  integrations: [
    swup({
      animationClass: 'transition-swup',
      containers: ['main'],
      cache: true,
      preload: true,
      globalInstance: true,
    }),
  ],
});
