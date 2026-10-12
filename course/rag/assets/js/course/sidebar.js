/**
 * sidebar.js — giáo trình bên trái trang bài học: tiến độ, danh sách bài, mục lục bài đang học.
 */
import { esc } from '../core/dom.js';
import { courseHref } from '../core/paths.js';

const DESKTOP = matchMedia('(min-width: 961px)');

function lessonHTML(lesson, currentId, progress) {
  const classes = ['syllabus__lesson'];
  if (lesson.id === currentId) classes.push('is-current');
  if (progress.isDone(lesson.id)) classes.push('is-done');
  const aria = lesson.id === currentId ? ' aria-current="page"' : '';
  return `
    <li class="${classes.join(' ')}" data-lesson="${esc(lesson.id)}">
      <a href="${lesson.url}"${aria}><span class="syllabus__check">✓</span>${esc(lesson.title)}</a>
    </li>`;
}

function modulesHTML(course, lessons, currentId, progress) {
  return course.modules.map((module, m) => `
    <li>
      <p class="syllabus__module-title">${m + 1}. ${esc(module.title)}</p>
      <ol class="syllabus__lessons">
        ${lessons.filter(l => l.module === module).map(l => lessonHTML(l, currentId, progress)).join('')}
      </ol>
    </li>`).join('');
}

/**
 * Vẽ sidebar vào `container`. Trả về { refresh } để vẽ lại khi tiến độ thay đổi.
 * `toc` (nếu có) được lồng ngay dưới bài đang học.
 */
export function renderSidebar({ container, course, lessons, current, progress, toc }) {
  let open = DESKTOP.matches;

  function render() {
    const done = progress.count(lessons);
    const percent = Math.round((done / lessons.length) * 100);
    container.innerHTML = `
      <details class="syllabus__box"${open ? ' open' : ''}>
        <summary class="syllabus__head">
          <a href="${courseHref('index.html')}">Giáo trình</a>
          <span class="syllabus__count">${done}/${lessons.length} bài</span>
        </summary>
        <div class="meter" aria-hidden="true"><div class="meter__fill" style="width:${percent}%"></div></div>
        <ol class="syllabus__modules">${modulesHTML(course, lessons, current.id, progress)}</ol>
      </details>`;

    const details = container.querySelector('details');
    details.addEventListener('toggle', () => { open = details.open; });
    if (toc) container.querySelector('.is-current')?.append(toc);
  }

  render();
  return { refresh: render };
}
