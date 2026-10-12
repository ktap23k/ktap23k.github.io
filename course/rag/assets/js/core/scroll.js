/**
 * scroll.js — thanh tiến độ đọc và nút "lên đầu trang" cho trang nội dung dài.
 */
function onScroll(handler) {
  window.addEventListener('scroll', handler, { passive: true });
  handler();
}

export function initReadingProgress() {
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  document.body.prepend(bar);

  onScroll(() => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : '0%';
  });
}

export function initBackToTop() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'back-to-top';
  button.textContent = '↑';
  button.setAttribute('aria-label', 'Lên đầu trang');
  document.body.append(button);

  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  onScroll(() => button.classList.toggle('visible', window.scrollY > 400));
}
