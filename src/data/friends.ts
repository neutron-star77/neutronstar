// 友链数据：swap 成你自己的朋友站点即可。
//   name        站点名（必填）
//   url         链接（必填）
//   avatar      头像 URL（可选，留空用首字占位）
//   description 一句简介
//   color       卡片左侧强调色（可选，默认主题蓝）

export interface Friend {
	name: string;
	url: string;
	avatar?: string;
	description?: string;
	color?: string;
}

export const friends: Friend[] = [
	{
		name: "Mizuki",
		url: "https://mizuki.mysqil.com",
		avatar: "https://mizuki.mysqil.com/logo.png",
		description: "参考博客主题的本体，一个漂亮的 Astro 博客。",
		color: "#8b5cf6",
	},
	{
		name: "NeutronStar",
		url: "https://blog.neutronstar.fun",
		description: "本站 —— 科技、阅读与杂谈。",
		color: "#3b82f6",
	},
];
