// 将 src/content/{blog,diary,project}/*.md 存量内容导入 D1 的 posts 表
// 用法: node scripts/import-content.mjs [out.sql]
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentRoot = join(root, 'src', 'content');
const outFile = process.argv[2] ? resolve(process.argv[2]) : join(root, 'scripts', 'import.sql');
const types = ['blog', 'diary', 'project'];

const esc = (s) => String(s ?? '').replace(/'/g, "''");

function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: md };
  const fmText = m[1];
  const body = (m[2] ?? '').replace(/^\r?\n/, '');
  const fm = {};
  const lines = fmText.split(/\r?\n/);
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (!key) continue;
    // 数组: [a, b] 或 ["a", "b"]
    if (val.startsWith('[')) {
      const inner = val.slice(1, val.lastIndexOf(']')).trim();
      val = inner
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
        .join(', ');
    } else {
      val = val.replace(/^["']|["']$/g, '').trim();
    }
    fm[key] = val;
  }
  return { fm, body };
}

const rows = [];
for (const type of types) {
  const dir = join(contentRoot, type);
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  } catch {
    continue;
  }
  for (const f of files) {
    const md = readFileSync(join(dir, f), 'utf-8');
    const { fm, body } = parseFrontmatter(md);
    const slug = f.replace(/\.md$/, '');
    const date = (fm.pubDate || fm.date || '').slice(0, 10);
    rows.push({
      type,
      slug,
      title: fm.title || slug,
      description: fm.description || '',
      content: body,
      tags: fm.tags || '',
      category: fm.category || '',
      date,
      draft: fm.draft === 'true' || fm.draft === '1' ? 1 : 0,
    });
  }
}

const lines = [];
const CHUNK = 10_000; // 单条 SQL 正文块上限（字符），规避 D1 的语句长度限制
lines.push('-- 由 scripts/import-content.mjs 生成，勿手改');
for (const r of rows) {
  lines.push(
    `INSERT OR IGNORE INTO posts (type, slug, title, description, cover, content, tags, category, date, draft) VALUES ('${esc(r.type)}', '${esc(r.slug)}', '${esc(r.title)}', '${esc(r.description)}', '', '', '${esc(r.tags)}', '${esc(r.category)}', '${esc(r.date)}', ${r.draft});`
  );
  // 超长正文分块追加，避免单条 SQL 超过 D1 的语句长度上限
  if (r.content.length > CHUNK) {
    const chunks = [];
    for (let i = 0; i < r.content.length; i += CHUNK) chunks.push(r.content.slice(i, i + CHUNK));
    for (let i = 0; i < chunks.length; i++) {
      const op = i === 0 ? `UPDATE posts SET content = '${esc(chunks[i])}' WHERE slug = '${esc(r.slug)}' AND type = '${esc(r.type)}';` : `UPDATE posts SET content = content || '${esc(chunks[i])}' WHERE slug = '${esc(r.slug)}' AND type = '${esc(r.type)}';`;
      lines.push(op);
    }
  } else if (r.content.length > 0) {
    lines.push(
      `UPDATE posts SET content = '${esc(r.content)}' WHERE slug = '${esc(r.slug)}' AND type = '${esc(r.type)}';`
    );
  }
}
lines.push('INSERT INTO settings (key, value) VALUES (\'seed_imported\', datetime(\'now\')) ON CONFLICT(key) DO UPDATE SET value = excluded.value;');

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, lines.join('\n') + '\n', 'utf-8');
console.log(`✅ 生成 ${outFile}：${rows.length} 篇内容`);
for (const r of rows) console.log(`  - [${r.type}] ${r.slug} → ${r.title}`);
