/**
 * toc.js — tự sinh mục lục từ các heading và tô sáng mục đang đọc.
 */

/** Đánh dấu heading gần nhất vừa cuộn qua đầu màn hình. */
function spyActive(list, headings) {
  const links = new Map([...list.querySelectorAll('a')].map(a => [decodeURIComponent(a.hash.slice(1)), a]));
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting);
    if (!visible.length) return;
    links.forEach(a => a.classList.remove('active'));
    links.get(visible[0].target.id)?.classList.add('active');
  }, { rootMargin: '-64px 0px -75% 0px' });
  headings.forEach(h => observer.observe(h));
}

/**
 * Tạo <ul class="toc__list"> từ danh sách heading (h2/h3).
 * Heading chưa có id sẽ được gán "heading-<n>". Trả về null nếu không có heading.
 */
export function buildTOC(headings) {
  if (!headings.length) return null;

  const list = document.createElement('ul');
  list.className = 'toc__list';

  headings.forEach((heading, i) => {
    heading.id ||= `heading-${i}`;
    const item = document.createElement('li');
    const link = document.createElement('a');
    if (heading.tagName === 'H3') item.className = 'toc-h3';
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    item.append(link);
    list.append(item);
  });

  spyActive(list, headings);
  return list;
}
