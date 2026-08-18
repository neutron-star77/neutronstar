// 全站集中配置（导航、社交、作者等）
export interface NavItem {
  text: string;
  link: string;
  icon?: string;
}

export const SITE = {
  title: 'NeutronStar',
  subtitle: '星舰 · 技术博客',
  description: '一个关于代码、宇宙与日常的星舰航行日志。',
  author: 'NeutronStar',
  lang: 'zh-CN',
  url: 'https://blog.neutronstar.fun',
};

export const NAV: NavItem[] = [
  { text: '首页', link: '/', icon: '🏠' },
  { text: '博客', link: '/blog', icon: '📡' },
  { text: '日记', link: '/diary', icon: '🌌' },
  { text: '项目', link: '/projects', icon: '🛰️' },
  { text: '标签', link: '/tags', icon: '🏷️' },
  { text: '关于', link: '/about', icon: '👤' },
];

export const SOCIAL = {
  github: 'https://github.com/',
  email: 'mailto:hello@neutronstar.fun',
  rss: '/rss.xml',
};

// ===== 自建图床素材：鬼刀背景图（GitHub + jsDelivr CDN） =====
// 仓库：neutron-star77/fastimage ｜ 管理页：https://neutron-star77.github.io/fastimage/
const GUITAO_BASE = 'https://cdn.jsdelivr.net/gh/neutron-star77/fastimage@main/2026/08';
export const GUITAO: string[] = [
  `${GUITAO_BASE}/433.webp`,
  `${GUITAO_BASE}/451.webp`,
  `${GUITAO_BASE}/469.webp`,
  `${GUITAO_BASE}/487.webp`,
  `${GUITAO_BASE}/505.webp`,
  `${GUITAO_BASE}/523.webp`,
  `${GUITAO_BASE}/541.webp`,
  `${GUITAO_BASE}/559.webp`,
  `${GUITAO_BASE}/577.webp`,
  `${GUITAO_BASE}/595.webp`,
  `${GUITAO_BASE}/613.webp`,
  `${GUITAO_BASE}/631.webp`,
  `${GUITAO_BASE}/649.webp`,
  `${GUITAO_BASE}/666.webp`,
];
// 首页 Hero 背景图
export const HERO_IMAGE = `${GUITAO_BASE}/559.webp`;

// 由 id 稳定地挑一张鬼刀图（同一篇文章每次都拿到同一张）
export function bannerFor(id: string): string {
  let h = 7;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return GUITAO[Math.abs(h) % GUITAO.length];
}
