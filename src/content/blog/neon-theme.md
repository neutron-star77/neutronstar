---
title: 深色霓虹与玻璃拟态设计笔记
description: 用 CSS 变量 + Tailwind v4 搭建一套克制而有科技感的视觉系统。
pubDate: 2026-08-17
updatedDate: 2026-08-18
tags: [设计, CSS, Tailwind]
---

# 设计令牌

我用一组 CSS 变量统一定义主题色与字体，再交给 Tailwind v4 的 `@theme` 暴露为工具类。

## 克制地使用 Three.js

整站只在首页 Hero 放了一处 Three.js 星场粒子，其余界面保持纯 CSS。这样既保留氛围，又不牺牲性能。

- 尊重 `prefers-reduced-motion`，降级为静态一帧
- 限制粒子数量（约 900）与像素比（≤2）
- 窗口缩放时重算相机宽高比

## 玻璃拟态

```css
.glass {
  background: rgba(17, 20, 42, 0.55);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(120, 140, 220, 0.18);
}
```

玻璃质感让卡片在深色星场背景上浮动，既轻盈又不抢内容。
