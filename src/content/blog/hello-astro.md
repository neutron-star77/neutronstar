---
title: 用 Astro 7 重铸星舰博客
description: 从零搭建一个静态、快速、可版本化的技术博客，部署到 Cloudflare Pages。
pubDate: 2026-08-18
tags: [Astro, 前端, Cloudflare]
---

# 为什么是 Astro

在试过多个方案后，我最终选择了 **Astro 7**：默认零 JS、内容集合原生支持 Markdown、构建产物是纯静态文件，完美契合 Cloudflare Pages。

## 内容即数据

所有文章以 Markdown 存放在 `src/content` 下，由 `src/content.config.ts` 中的 `glob` loader 自动收集，并用 zod 做类型校验。

```ts
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({ title: z.string(), pubDate: z.coerce.date() }),
});
```

## 部署

只需一条命令：

```bash
npm run build   # 输出到 dist/
```

然后在 Cloudflare Pages 选择 `dist` 作为构建目录即可。

> 内容存于 Git，可版本化、可迁移，是长期主义的写法。
