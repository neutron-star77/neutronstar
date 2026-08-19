export type PostType = 'blog' | 'diary' | 'project';

export interface Post {
  id: number;
  type: PostType;
  slug: string;
  title: string;
  description: string;
  cover: string;
  content: string;
  tags: string[];
  category: string;
  date: string;
  draft: boolean;
}

export interface PostInput {
  type: PostType;
  slug: string;
  title: string;
  description?: string;
  cover?: string;
  content: string;
  tags?: string[];
  category?: string;
  date?: string;
  draft?: boolean;
}

export interface TagCount {
  tag: string;
  count: number;
}

export type SettingsMap = Record<string, string>;

/** 前端组件显示开关的默认配置（key → 默认开/关 + 中文标签） */
export const COMPONENT_TOGGLES: { key: string; label: string; default: boolean }[] = [
  { key: 'show_banner', label: '顶部 Banner 横幅', default: true },
  { key: 'show_sidebar', label: '右侧边栏（资料/分类/标签/统计）', default: true },
  { key: 'show_toc', label: '文章目录 TOC', default: true },
  { key: 'show_backtotop', label: '回到顶部按钮', default: true },
  { key: 'show_comments', label: 'Giscus 评论区', default: true },
  { key: 'show_tags_cloud', label: '标签页云', default: true },
  { key: 'show_post_cover', label: '文章列表封面图', default: true },
  { key: 'show_site_stats', label: '侧栏站点统计', default: true },
];

/** 默认设置（首次建库时写入） */
export const DEFAULT_SETTINGS: SettingsMap = {
  site_title: 'NeutronStar',
  site_subtitle: '静默生长，向光而行',
  admin_password: 'neutronstar',
  show_banner: '1',
  show_sidebar: '1',
  show_toc: '1',
  show_backtotop: '1',
  show_comments: '1',
  show_tags_cloud: '1',
  show_post_cover: '1',
  show_site_stats: '1',
  giscus_repo: '',
  giscus_repo_id: '',
  giscus_category: 'Announcements',
  giscus_category_id: '',
  reset_email: '',             // 后台「忘记密码」登记邮箱（留空 = 关闭邮箱重置）
  reset_email_from: '',        // 重置邮件发件人（留空用默认 onboarding@resend.dev）
};
