// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';
import { vitePreprocess } from '@astrojs/svelte';
import swup from '@swup/astro';

// 静态构建，部署到 Cloudflare Pages（构建输出 dist，无需服务端适配器）
export default defineConfig({
  site: 'https://blog.neutronstar.fun',
  trailingSlash: 'ignore',
  server: { port: 8080 },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@components': '/src/components',
        '@layouts': '/src/layouts',
        '@utils': '/src/utils',
        '@constants': '/src/constants',
        '@config': '/src/config',
        '@i18n': '/src/i18n',
      },
    },
  },
  svelte: {
    preprocess: vitePreprocess(),
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  integrations: [
    svelte(),
    swup({
      animationClass: 'transition-swup',
      containers: ['main'],
      cache: true,
      preload: true,
      globalInstance: true,
    }),
  ],
});
