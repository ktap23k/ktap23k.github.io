#!/usr/bin/env node
/**
 * check-rag-course.js — kiểm tra khoá học course/rag/. Thoát với mã 1 nếu có vi phạm.
 *
 *   1. Mỗi file text ≤ 200 dòng.
 *   2. Mỗi thư mục ≤ 7 mục (file + thư mục con; bỏ qua mục ẩn như .DS_Store).
 *   3. course.json khớp với lessons/: bài nào khai báo cũng có file, <h1> trùng tiêu đề,
 *      và không có file bài học nào bị "mồ côi" (có file nhưng chưa khai báo).
 *
 * Cách dùng (từ thư mục gốc): node tools/check-rag-course.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COURSE_DIR = path.join(ROOT, 'course', 'rag');
const MAX_LINES = 200;
const MAX_ENTRIES = 7;
const TEXT_FILES = /\.(html|css|js|json|md)$/;

const rel = file => path.relative(ROOT, file).split(path.sep).join('/');
const read = file => fs.readFileSync(file, 'utf8');
const visible = dir => fs.readdirSync(dir, { withFileTypes: true }).filter(e => !e.name.startsWith('.'));
const countLines = text => (text.endsWith('\n') ? text.slice(0, -1) : text).split('\n').length;

/** Mọi thư mục con (đệ quy), gồm cả `dir`. */
const walkDirs = dir => [
  dir,
  ...visible(dir).filter(e => e.isDirectory()).flatMap(e => walkDirs(path.join(dir, e.name))),
];

const walkFiles = dir =>
  walkDirs(dir).flatMap(d => visible(d).filter(e => e.isFile()).map(e => path.join(d, e.name)));

function checkLineLimit() {
  return walkFiles(COURSE_DIR)
    .filter(file => TEXT_FILES.test(file))
    .map(file => [rel(file), countLines(read(file))])
    .filter(([, lines]) => lines > MAX_LINES)
    .map(([file, lines]) => `${file}: ${lines} dòng (tối đa ${MAX_LINES})`);
}

function checkFolderSize() {
  return walkDirs(COURSE_DIR)
    .map(dir => [rel(dir), visible(dir).length])
    .filter(([, count]) => count > MAX_ENTRIES)
    .map(([dir, count]) => `${dir}/: ${count} mục (tối đa ${MAX_ENTRIES})`);
}

const lessonTitle = html =>
  (html.match(/<h1[^>]*class="lesson-title"[^>]*>([\s\S]*?)<\/h1>/) || [])[1]?.replace(/<[^>]+>/g, '').trim();

function checkSyllabus() {
  const errors = [];
  const course = JSON.parse(read(path.join(COURSE_DIR, 'course.json')));
  const lessonsDir = path.join(COURSE_DIR, 'lessons');
  const declared = new Set();

  for (const module of course.modules) {
    for (const lesson of module.lessons) {
      const file = `${module.id}/${lesson.slug}.html`;
      const full = path.join(lessonsDir, file);
      declared.add(file);
      if (!fs.existsSync(full)) {
        errors.push(`lessons/${file}: khai báo trong course.json nhưng chưa có file`);
        continue;
      }
      const title = lessonTitle(read(full));
      if (title !== lesson.title) errors.push(`lessons/${file}: <h1> "${title}" ≠ course.json "${lesson.title}"`);
      if (!(lesson.minutes > 0)) errors.push(`lessons/${file}: "minutes" phải > 0`);
    }
  }

  for (const file of walkFiles(lessonsDir).filter(f => f.endsWith('.html'))) {
    const key = path.relative(lessonsDir, file).split(path.sep).join('/');
    if (!declared.has(key)) errors.push(`lessons/${key}: có file nhưng chưa khai báo trong course.json`);
  }
  return errors;
}

const checks = [
  ['Số dòng mỗi file', checkLineLimit],
  ['Số mục mỗi thư mục', checkFolderSize],
  ['Giáo trình (course.json ↔ lessons/)', checkSyllabus],
];

let failed = 0;
for (const [name, run] of checks) {
  const errors = run();
  failed += errors.length;
  console.log(`${errors.length ? '✗' : '✓'} ${name}`);
  errors.forEach(error => console.log(`    - ${error}`));
}

console.log(failed ? `\n${failed} vi phạm.` : '\nKhoá học RAG đạt mọi quy ước.');
process.exit(failed ? 1 : 0);
