// 书架数据：放你的电子书（pdf / txt / epub）。
// 字段说明：
//   title      书名（必填）
//   author     作者
//   cover      封面图 URL（可选；留空则用「书名首字渐变占位」自动生成好看的封面）
//   format     'pdf' | 'txt' | 'epub'
//   file       阅读/下载链接，建议把文件放进 public/books/ 下，例如 "/books/xxx.pdf"
//   status     'reading' 在读 | 'finished' 读完 | 'planned' 想读（徽章）
//   description 一句话简介
//   year       出版/购入年份
//   rating     评分 1-5（可选）
//   tags       标签
//
// 想加书：直接往下面数组追加一项即可。封面图建议放进 public/books/covers/。

export interface Book {
	title: string;
	author?: string;
	cover?: string;
	format: "pdf" | "txt" | "epub";
	file: string;
	status?: "reading" | "finished" | "planned";
	description?: string;
	year?: string;
	rating?: number;
	tags?: string[];
}

export const books: Book[] = [
	{
		title: "示例：三体",
		author: "刘慈欣",
		format: "pdf",
		file: "/books/santi.pdf",
		status: "finished",
		description: "黑暗森林中的宇宙文明博弈，硬科幻里程碑。",
		year: "2008",
		rating: 5,
		tags: ["科幻", "经典"],
	},
	{
		title: "示例：活着",
		author: "余华",
		format: "txt",
		file: "/books/huozhe.txt",
		status: "reading",
		description: "一个人和他命运之间的友情，苦难里的温柔。",
		year: "1993",
		rating: 5,
		tags: ["小说", "当代"],
	},
	{
		title: "示例：人类简史",
		author: "尤瓦尔·赫拉利",
		format: "epub",
		file: "/books/sapiens.epub",
		status: "planned",
		description: "从认知革命到科学革命的宏大叙事。",
		year: "2011",
		rating: 4,
		tags: ["历史", "人类学"],
	},
];
