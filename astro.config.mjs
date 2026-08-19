// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';
import { vitePreprocess } from '@astrojs/svelte';
import cloudflare from '@astrojs/cloudflare';
import swup from '@swup/astro';

// 运行时渲染(SSR) + Cloudflare D1 数据层：后台写入 D1 → 前端请求时读取，秒级生效
export default defineConfig({
  site: 'https://blog.neutronstar.fun',
  output: 'server',
  adapter: cloudflare({ imageService: 'passthrough' }),
  session: false,
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
        '@lib': '/src/lib',
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
