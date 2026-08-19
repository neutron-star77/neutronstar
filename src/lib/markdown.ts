import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        );
      } catch {
        /* fall through */
      }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  },
});

/** 将 markdown 源码渲染为 HTML（供前端文章页 / 后台实时预览使用） */
export function renderMarkdown(src: string): string {
  return md.render(src ?? '');
}

export interface Heading {
  depth: number;
  text: string;
  slug: string;
}

function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'section';
}

/** 从 markdown 提取 h2/h3 标题，用于右侧 TOC（替代原 render 的 headings） */
export function extractHeadings(src: string): Heading[] {
  const out: Heading[] = [];
  const lines = (src ?? '').split('\n');
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.*)$/.exec(line);
    if (m) {
      const text = m[2].replace(/[#*`]/g, '').trim();
      out.push({ depth: m[1].length, text, slug: slugifyHeading(text) });
    }
  }
  return out;
}

/** 纯文本摘要（去除 markdown 标记），用于列表 description 兜底 */
export function plainExcerpt(src: string, len = 120): string {
  const text = (src ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > len ? text.slice(0, len) + '…' : text;
}
