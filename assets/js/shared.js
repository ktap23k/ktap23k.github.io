/**
 * shared.js — dùng chung cho tất cả trang bài viết (posts/)
 * Tự động inject: header, footer, progress bar, back-to-top, TOC, dark mode
 */

const path = location.pathname;
const ROOT = /\/game\/[^/]+\//.test(path) ? '../../'
           : /\/(posts|game)\//.test(path) ? '../'
           : './';

// Game nav link needs special handling to avoid /game/game/index.html
const GAME_LINK = /\/game\/(index\.html)?$/.test(path) ? './index.html'
                : ROOT + 'game/index.html';
const AVATAR_SRC = ROOT + 'avt.jpg';
const FAVICON_SRC = ROOT + 'favicon.svg';

/* ── FAVICON ───────────────────────────────────────────────── */
function initFavicon() {
  let link = document.querySelector('link[rel~="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = FAVICON_SRC;
}

/* ── RENDER HEADER ─────────────────────────────────────────── */
function renderHeader() {
  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = `
    <div class="container header__inner">
      <a href="${ROOT}index.html" class="logo" aria-label="Ktap — Trang chủ">
        <img class="logo__icon" src="${AVATAR_SRC}" alt="" width="28" height="28" />
        <span class="logo__text">Ktap</span>
      </a>
      <nav class="nav" id="nav" aria-label="Điều hướng chính">
        <a href="${ROOT}index.html"         class="nav__link">Trang chủ</a>
        <a href="${ROOT}index.html#posts"   class="nav__link">Bài viết</a>
        <a href="${ROOT}index.html#courses" class="nav__link">Khoá học</a>
        <a href="${ROOT}index.html#about"   class="nav__link">Về tôi</a>
        <a href="${ROOT}index.html#contact" class="nav__link">Liên hệ</a>
        <a href="${GAME_LINK}"              class="nav__link">Game</a>
        <a href="${ROOT}cv.html"            class="nav__link nav__link--cv">CV</a>
      </nav>
      <div class="header__actions">
        <button class="theme-toggle" id="themeToggle" type="button" aria-label="Chuyển giao diện sáng/tối">
          <span class="theme-toggle__icon" aria-hidden="true"></span>
        </button>
        <button class="hamburger" id="hamburger" type="button" aria-label="Mở menu" aria-controls="nav" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>`;
  document.body.prepend(header);

  // Skip link cho người dùng bàn phím / screen reader
  const main = document.querySelector('main');
  if (main) {
    if (!main.id) main.id = 'main';
    const skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = '#' + main.id;
    skip.textContent = 'Bỏ qua, tới nội dung chính';
    document.body.prepend(skip);
  }
}

/* ── RENDER FOOTER ─────────────────────────────────────────── */
function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="container footer__inner">
      <p>© 2026 <strong>Trần Anh Tuấn</strong> · Xây bằng HTML/CSS/JS thuần, host trên GitHub Pages</p>
      <div class="footer__links">
        <a href="${ROOT}index.html#posts">← Tất cả bài viết</a>
        <a href="${ROOT}feed.xml">RSS</a>
        <a href="${ROOT}index.html">Trang chủ</a>
      </div>
    </div>`;
  document.body.appendChild(footer);
}

/* ── DARK MODE ─────────────────────────────────────────────── */
const ICON_MOON = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
const ICON_SUN  = '<svg viewBox="0 0 24 24" width="18" height="18"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></g></svg>';

function initDarkMode() {
  const html        = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon   = themeToggle.querySelector('.theme-toggle__icon');

  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) { /* ignore */ }
  if (saved !== 'dark' && saved !== 'light') {
    saved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  apply(saved);
  themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
  });

  function apply(theme) {
    html.setAttribute('data-theme', theme);
    themeIcon.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  }
}

/* ── MOBILE MENU ───────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('nav');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
  };
  hamburger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('.nav__link').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
}

/* ── READING PROGRESS BAR ──────────────────────────────────── */
function initProgressBar() {
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.body.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
  }, { passive: true });
}

/* ── BACK TO TOP ───────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className   = 'back-to-top';
  btn.type        = 'button';
  btn.textContent = '↑';
  btn.setAttribute('aria-label', 'Lên đầu trang');
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── TABLE OF CONTENTS (auto-generate) ────────────────────── */
function initTOC() {
  const tocEl = document.getElementById('toc');
  if (!tocEl) return;

  const headings = document.querySelectorAll('.article-body h2, .article-body h3');
  if (!headings.length) return;

  const list = document.createElement('ul');
  list.className = 'toc__list';

  headings.forEach((h, i) => {
    if (!h.id) h.id = 'heading-' + i;
    const li   = document.createElement('li');
    const a    = document.createElement('a');
    li.className = h.tagName === 'H3' ? 'toc-h3' : '';
    a.href        = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    list.appendChild(li);
  });

  tocEl.appendChild(list);

  // Active heading spy
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id  = entry.target.id;
      const link = tocEl.querySelector(`a[href="#${id}"]`);
      if (link) link.classList.toggle('active', entry.isIntersecting);
    });
  }, { rootMargin: '-64px 0px -80% 0px' });

  headings.forEach(h => observer.observe(h));
}

/* ── INIT ALL ──────────────────────────────────────────────── */
(function init() {
  initFavicon();
  renderHeader();
  renderFooter();
  initDarkMode();
  initMobileMenu();
  initProgressBar();
  initBackToTop();
  initTOC();
})();
