/**
 * layout.js — header, footer, menu mobile và theme của trang khoá học.
 * Markup khớp với header/footer của các trang khác trong site (style.css dùng chung).
 */
import { siteHref } from './paths.js';
import { initTheme } from './theme.js';

const NAV = [
  { label: 'Trang chủ', path: 'index.html#home' },
  { label: 'Bài viết',  path: 'index.html#posts' },
  { label: 'Khoá học',  path: 'index.html#courses', cls: 'active' },
  { label: 'Về tôi',    path: 'index.html#about' },
  { label: 'Liên hệ',   path: 'index.html#contact' },
  { label: 'Game',      path: 'game/index.html' },
  { label: 'CV',        path: 'cv.html', cls: 'nav__link--cv' },
];

function headerHTML() {
  const links = NAV.map(({ label, path, cls }) =>
    `<a href="${siteHref(path)}" class="nav__link${cls ? ` ${cls}` : ''}">${label}</a>`).join('');

  return `
    <div class="container header__inner">
      <a href="${siteHref('index.html')}" class="logo">
        <img class="logo__icon" src="${siteHref('avt.jpg')}" alt="" />
        <span class="logo__text">Ktap</span>
      </a>
      <nav class="nav" id="nav">${links}</nav>
      <div class="header__actions">
        <button class="theme-toggle" type="button" aria-label="Chuyển giao diện">
          <span class="theme-toggle__icon">☾</span>
        </button>
        <button class="hamburger" type="button" aria-label="Mở menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>`;
}

function footerHTML() {
  return `
    <div class="container footer__inner">
      <p>© ${new Date().getFullYear()} <strong>tuanta</strong> · Được xây dựng với HTML thuần</p>
      <div class="footer__links">
        <a href="${siteHref('index.html')}">Trang chủ</a>
        <a href="${siteHref('index.html#posts')}">Bài viết</a>
        <a href="${siteHref('index.html#courses')}">Khoá học</a>
        <a href="${siteHref('cv.html')}">CV</a>
      </div>
    </div>`;
}

function initMobileMenu(header) {
  const nav = header.querySelector('.nav');
  const hamburger = header.querySelector('.hamburger');
  const setOpen = open => {
    nav.classList.toggle('open', open);
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  };
  hamburger.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
}

/** Dựng header + footer, gắn menu mobile và nút đổi giao diện. */
export function initPage() {
  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = headerHTML();
  document.body.prepend(header);

  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = footerHTML();
  document.body.append(footer);

  initMobileMenu(header);
  initTheme(header.querySelector('.theme-toggle'));
}
