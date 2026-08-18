// 全站集中配置（站点 / 导航 / 社交 / 看板娘）
// 页面布局参考 Mizuki（https://mizuki.mysqil.com）

export interface NavItem {
	text: string;
	link: string;
	icon?: string;
}

export const SITE = {
	title: "NeutronStar",
	subtitle: "星舰 · 技术博客",
	description: "NeutronStar 的个人博客 —— 科技、阅读、杂谈与一切值得记录的东西。",
	author: "NeutronStar",
	lang: "zh-CN",
	url: "https://blog.neutronstar.fun",
	// Mizuki 设计令牌：主色相（MD3 用 --hue 驱动 --primary 等）
	hue: 270,
	// 首页 Banner 背景图（Mizuki 标志性横幅）
	banner: "https://cdn.jsdelivr.net/gh/neutron-star77/fastimage@main/2026/08/559.webp",
};

// 一级导航（icon 为 Material Symbols Rounded 名称，对齐 Mizuki 顶栏）
export const NAV: NavItem[] = [
	{ text: "首页", link: "/", icon: "home" },
	{ text: "说说", link: "/diary", icon: "auto_stories" },
	{ text: "书架", link: "/bookshelf", icon: "menu_book" },
	{ text: "杂谈", link: "/blog", icon: "forum" },
	{ text: "友链", link: "/friends", icon: "link" },
	{ text: "归档", link: "/archive", icon: "archive" },
	{ text: "关于", link: "/about", icon: "person" },
];

// 社交链接
export const SOCIAL = {
	github: "https://github.com/",
	email: "mailto:hello@neutronstar.fun",
	rss: "/rss.xml",
};

// ===== 自建图床素材：鬼刀背景图（GitHub + jsDelivr CDN） =====
// 仓库：neutron-star77/fastimage ｜ 管理页：https://neutron-star77.github.io/fastimage/
const GUITAO_BASE = "https://cdn.jsdelivr.net/gh/neutron-star77/fastimage@main/2026/08";
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

// 看板娘（Live2D）。默认模型为 NOIR（开箱即用）。
// 想换成「风铃公主」：把模型文件放到 public/pio/models/fengling/fengling.model3.json，
// 然后把下面 model 改为 "/pio/models/fengling/fengling.model3.json" 即可。
export const PIO = {
	enable: true,
	model: "/pio/models/NOIR/noir.model3.json",
	position: "right" as "left" | "right", // 显示在右下角
	width: 280,
	hiddenOnMobile: true,
	dialog: {
		// 首次加载的欢迎语
		welcome: ["欢迎来到 NeutronStar 的小站~", "书架上有不少好书，去看看吧！"],
		// 点击模型时的随机台词
		touch: [
			"主人今天也要加油哦！",
			"要不要去书架翻翻新书？",
			"风铃在耳边轻轻响……",
			"写点什么吧，灵感不会自己来~",
		],
	},
	menus: {
		items: [
			{ icon: "home", label: "去主页", action: "home" },
			{ icon: "top", label: "回到顶部", action: "scrollToTop" },
		],
		align: "right" as "left" | "right",
	},
};
