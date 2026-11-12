#!/usr/bin/env node
/**
 * build.js — Tự động scan posts/*.html và tạo lại posts/manifest.json
 *
 * Cách dùng:
 *   node build.js
 *
 * Khi thêm file HTML mới vào posts/, chạy lệnh này để cập nhật manifest.
 * Có thể tích hợp vào pre-commit hook hoặc GitHub Actions.
 */

const fs   = require('fs');
const path = require('path');

const postsDir     = path.join(__dirname, '..', 'posts');
const manifestPath = path.join(postsDir, 'manifest.json');

// ── Helpers ──────────────────────────────────────────────────

/** Lấy nội dung text giữa thẻ HTML (bỏ inner tags) */
function innerText(html, regex) {
  const m = html.match(regex);
  return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
}

/** Parse "dd tháng mm, yyyy" → "yyyy-mm-dd" để sort */
function parseViDate(str) {
  const monthMap = {
    '1':'01','2':'02','3':'03','4':'04','5':'05','6':'06',
    '7':'07','8':'08','9':'09','10':'10','11':'11','12':'12',
  };
  const m = str.match(/(\d+)\s+tháng\s+(\d+),\s+(\d{4})/);
  if (!m) return '0000-00-00';
  const [, d, mo, y] = m;
  return `${y}-${monthMap[mo] || '00'}-${d.padStart(2, '0')}`;
}

// ── Scan posts/ ───────────────────────────────────────────────

const files = fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.html'))
  .sort();

if (!files.length) {
  console.log('Không tìm thấy file HTML nào trong posts/');
  process.exit(0);
}

const posts = files.map(filename => {
  const slug = filename.replace('.html', '');
  const html = fs.readFileSync(path.join(postsDir, filename), 'utf8');

  // Title: từ <h1 class="article-title">
  const title = innerText(html, /<h1[^>]*class="article-title"[^>]*>([\s\S]*?)<\/h1>/) || slug;

  // Excerpt: từ <meta name="description" content="...">
  const excerptM = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  const excerpt  = excerptM ? excerptM[1] : '';

  // Tags: từ <div class="article-header__tags"> ... </div>
  const tagsBlockM = html.match(/<div class="article-header__tags">([\s\S]*?)<\/div>/);
  const tags = [];
  if (tagsBlockM) {
    const tagRe = /<span[^>]*class="tag[^"]*"[^>]*>([^<]+)<\/span>/g;
    let tm;
    while ((tm = tagRe.exec(tagsBlockM[1])) !== null) {
      const t = tm[1].trim();
      if (t !== 'Nổi bật') tags.push(t);   // bỏ badge "Nổi bật"
    }
  }

  // Featured: kiểm tra tag--featured
  const featured = html.includes('class="tag tag--featured"');

  // Date: tìm "X tháng Y, YYYY" trong bài
  const dateM = html.match(/<span>(\d+\s+tháng\s+\d+,\s+\d{4})<\/span>/);
  const date  = dateM ? dateM[1] : '';
  const dateISO = parseViDate(date);

  // Read time: "⏱ X phút"
  const rtM     = html.match(/⏱\s*(\d+)\s+phút/);
  const readTime = rtM ? parseInt(rtM[1], 10) : 5;

  return { slug, title, excerpt, date, dateISO, readTime, tags, featured };
});

// Sort: featured trước, sau đó mới nhất đến cũ nhất
posts.sort((a, b) => {
  if (a.featured && !b.featured) return -1;
  if (!a.featured && b.featured) return  1;
  return b.dateISO.localeCompare(a.dateISO);
});

// ── Ghi manifest ──────────────────────────────────────────────

const manifest = {
  generated: new Date().toISOString().split('T')[0],
  posts,
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

console.log(`✓ manifest.json đã cập nhật — ${posts.length} bài viết`);
posts.forEach(p =>
  console.log(`  ${p.featured ? '★' : '·'} [${p.dateISO}] ${p.slug}`)
);

// ── Sitemap & RSS ─────────────────────────────────────────────

const SITE_URL  = 'https://ktap23k.github.io';
const rootDir   = path.join(__dirname, '..');
const byDateDesc = [...posts].sort((a, b) => b.dateISO.localeCompare(a.dateISO));

const xmlEscape = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** Liệt kê đệ quy các file index.html / bài học trong một thư mục (vd: course/, game/) */
function listPages(dir) {
  const abs = path.join(rootDir, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'assets' || entry.name === 'pdfs') continue;
      out.push(...listPages(rel));
    } else if (entry.name.endsWith('.html')) {
      out.push(rel);
    }
  }
  return out;
}

const staticPages = ['', 'cv.html', ...listPages('game'), ...listPages('course')]
  .map(p => p.replace(/(^|\/)index\.html$/, '$1'))
  .sort();

const sitemapUrls = [
  ...staticPages.map(p => `  <url><loc>${SITE_URL}/${p}</loc></url>`),
  ...byDateDesc.map(p =>
    `  <url><loc>${SITE_URL}/posts/${p.slug}.html</loc>` +
    (p.dateISO !== '0000-00-00' ? `<lastmod>${p.dateISO}</lastmod>` : '') +
    `</url>`),
];

fs.writeFileSync(
  path.join(rootDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join('\n')}\n</urlset>\n`,
  'utf8'
);
console.log(`✓ sitemap.xml — ${sitemapUrls.length} URL`);

const rssDate = iso => new Date(`${iso}T08:00:00+07:00`).toUTCString();
const rssItems = byDateDesc
  .filter(p => p.dateISO !== '0000-00-00')
  .map(p => {
    const url = `${SITE_URL}/posts/${p.slug}.html`;
    return [
      '    <item>',
      `      <title>${xmlEscape(p.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${rssDate(p.dateISO)}</pubDate>`,
      ...p.tags.map(t => `      <category>${xmlEscape(t)}</category>`),
      `      <description>${xmlEscape(p.excerpt)}</description>`,
      '    </item>',
    ].join('\n');
  });

fs.writeFileSync(
  path.join(rootDir, 'feed.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ktap Blog</title>
    <link>${SITE_URL}/</link>
    <description>Bài viết thực chiến về Backend, Data Engineering và AI/LLM.</description>
    <language>vi</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${byDateDesc.length ? `<lastBuildDate>${rssDate(byDateDesc[0].dateISO)}</lastBuildDate>` : ''}
${rssItems.join('\n')}
  </channel>
</rss>
`,
  'utf8'
);
console.log(`✓ feed.xml — ${rssItems.length} bài`);
