/**
 * lesson.js — điểm vào của trang bài học.
 * HTML bài học chỉ chứa nội dung; giáo trình, vị trí bài, nút hoàn thành và
 * điều hướng trước/sau đều sinh từ course.json để không phải sửa tay từng file.
 */
import { initPage } from '../core/layout.js';
import { initReadingProgress, initBackToTop } from '../core/scroll.js';
import { loadCourse } from '../core/data.js';
import { isCurrentPage, courseHref } from '../core/paths.js';
import { esc } from '../core/dom.js';
import { buildTOC } from '../core/toc.js';
import { flattenLessons } from './syllabus.js';
import { createProgress } from './progress.js';
import { renderSidebar } from './sidebar.js';

function renderEyebrow(course, lesson) {
  const eyebrow = document.createElement('p');
  eyebrow.className = 'lesson-header__eyebrow';
  eyebrow.innerHTML = `
    <a href="${courseHref('index.html')}">${esc(course.title)}</a>
    <span>Module ${lesson.moduleNo}: ${esc(lesson.module.title)}</span>
    <span>Bài ${lesson.lessonNo}/${lesson.module.lessons.length}</span>
    <span>⏱ ${lesson.minutes} phút</span>`;
  document.querySelector('.lesson-header').prepend(eyebrow);
}

function navItemHTML(lesson, label, modifier = '') {
  if (!lesson) return '';
  return `
    <a href="${lesson.url}" class="post-nav__item ${modifier}">
      <span class="post-nav__label">${label}</span>
      <span class="post-nav__title">${esc(lesson.title)}</span>
    </a>`;
}

function renderFooter({ lessons, index, progress, onChange }) {
  const lesson = lessons[index];
  const footer = document.createElement('footer');
  footer.className = 'lesson-footer';
  footer.innerHTML = `
    <div class="lesson-complete">
      <p></p>
      <button type="button" class="btn"></button>
    </div>
    <nav class="post-nav" aria-label="Điều hướng bài học">
      ${navItemHTML(lessons[index - 1], '← Bài trước')}
      ${navItemHTML(lessons[index + 1], 'Bài tiếp theo →', 'post-nav__item--next')}
    </nav>`;
  document.querySelector('.lesson').append(footer);

  const box = footer.querySelector('.lesson-complete');
  const button = box.querySelector('button');
  const paint = () => {
    const done = progress.isDone(lesson.id);
    box.classList.toggle('is-done', done);
    box.querySelector('p').textContent = done ? '✓ Bạn đã hoàn thành bài này.' : 'Đã nắm được nội dung bài này?';
    button.textContent = done ? 'Bỏ đánh dấu' : '✓ Đánh dấu đã học';
    button.className = done ? 'btn btn--ghost' : 'btn btn--primary';
  };

  button.addEventListener('click', () => {
    progress.set(lesson.id, !progress.isDone(lesson.id));
    paint();
    onChange();
  });
  paint();
}

async function init() {
  const course = await loadCourse();
  const lessons = flattenLessons(course);
  const index = lessons.findIndex(l => isCurrentPage(l.url));
  if (index === -1) throw new Error('Trang này chưa được khai báo trong course/rag/course.json');

  const progress = createProgress(course.id);
  const toc = buildTOC([...document.querySelectorAll('.lesson .article-body h2')]);
  const sidebar = renderSidebar({
    container: document.getElementById('syllabus'),
    course, lessons, current: lessons[index], progress, toc,
  });

  renderEyebrow(course, lessons[index]);
  renderFooter({ lessons, index, progress, onChange: sidebar.refresh });
}

initPage({ active: 'course' });
initReadingProgress();
initBackToTop();
init().catch(err => console.error(err));
