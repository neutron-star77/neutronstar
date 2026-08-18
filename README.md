# NeutronStar

一个基于 **Astro 7** 的静态技术博客，深色霓虹 + 玻璃拟态风格，部署于 **Cloudflare Pages**。
Three.js 仅用于首页 Hero 星场（克制使用），内容全部以 Markdown 存于 Git。

## 技术栈

- Astro 7（静态构建，零运行时框架）
- Tailwind CSS v4（`@tailwindcss/vite`）
- Three.js（仅首页装饰性星场）
- Cloudflare Pages（构建输出 `dist/`）

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
```

## 构建

```bash
npm run build    # 输出到 dist/
npm run preview  # 本地预览构建结果
```

## 部署到 Cloudflare Pages

1. 在 Cloudflare Pages 新建项目，连接 Git 仓库；
2. 构建命令：`npm run build`；
3. 构建输出目录：`dist`；
4. 推送后自动部署，无需任何服务端适配器（纯静态）。

`public/_headers` 已配置静态资源长缓存策略。

## 内容结构

```
src/content/
  blog/     技术文章（.md）
  diary/    航行日志（.md）
  project/  项目展示（.md）
src/config.ts        全站导航 / 社交等配置
src/content.config.ts 内容集合 schema
```

新增文章只需在对应目录新建 `.md` 并填写 frontmatter，路由会自动生成。
