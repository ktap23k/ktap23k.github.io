/**
 * overview.js — điểm vào trang giới thiệu khoá học: số liệu, nút học tiếp, danh sách module.
 */
import { initPage } from '../core/layout.js';
import { loadCourse } from '../core/data.js';
import { esc, formatMinutes } from '../core/dom.js';
import { flattenLessons, totalMinutes, nextLesson } from './syllabus.js';
import { createProgress } from './progress.js';

const $ = id => document.getElementById(id);

function statHTML(value, label) {
  return `<div><span class="stat__value">${value}</span><span class="stat__label">${label}</span></div>`;
}

function renderHero(course, lessons, progress) {
  const done = progress.count(lessons);
  const next = nextLesson(lessons, progress);
  const cta = $('courseCta');

  $('courseStats').innerHTML = [
    statHTML(course.modules.length, 'module'),
    statHTML(lessons.length, 'bài học'),
    statHTML(formatMinutes(totalMinutes(lessons)), 'thời lượng đọc'),
  ].join('');

  cta.href = (next || lessons[0]).url;
  cta.textContent = !done ? 'Bắt đầu học →' : next ? 'Tiếp tục học →' : 'Ôn lại từ đầu ↺';
  $('courseMeter').style.width = `${Math.round((done / lessons.length) * 100)}%`;
  $('courseProgressLabel').textContent = done
    ? `Đã hoàn thành ${done}/${lessons.length} bài${next ? ` · Bài tiếp: ${next.title}` : ' — xuất sắc!'}`
    : 'Chưa bắt đầu — tiến độ được lưu ngay trên trình duyệt của bạn.';
}

function lessonRowHTML(lesson, progress) {
  const done = progress.isDone(lesson.id);
  return `
    <li class="lesson-row${done ? ' is-done' : ''}">
      <a href="${lesson.url}">
        <span class="lesson-row__mark" aria-hidden="true">✓</span>
        <span>${lesson.moduleNo}.${lesson.lessonNo} · ${esc(lesson.title)}${done ? '<span class="sr-only"> (đã học)</span>' : ''}</span>
        <span class="lesson-row__time">${lesson.minutes} phút</span>
      </a>
    </li>`;
}

function renderModules(course, lessons, progress) {
  $('moduleList').innerHTML = course.modules.map((module, m) => {
    const items = lessons.filter(l => l.module === module);
    return `
      <li class="module-card" style="animation-delay:${m * 0.06}s">
        <div class="module-card__head">
          <div>
            <h3 class="module-card__title">Module ${m + 1} — ${esc(module.title)}</h3>
            <p class="module-card__summary">${esc(module.summary)}</p>
          </div>
          <span class="module-card__meta">${items.length} bài · ${formatMinutes(totalMinutes(items))}</span>
        </div>
        <ol class="lesson-rows">${items.map(l => lessonRowHTML(l, progress)).join('')}</ol>
      </li>`;
  }).join('');
}

async function init() {
  const course = await loadCourse();
  const lessons = flattenLessons(course);
  const progress = createProgress(course.id);
  renderHero(course, lessons, progress);
  renderModules(course, lessons, progress);
}

initPage({ active: 'course' });
init().catch(err => {
  console.error(err);
  $('moduleList').innerHTML = '<li class="muted-note">Không tải được giáo trình. Hãy mở trang qua một web server (không mở trực tiếp file).</li>';
});
