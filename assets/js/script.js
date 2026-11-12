/* =========================================
   CONSTANTS & STATE
   ========================================= */
const PAGE_SIZE = 6;   // số bài hiển thị mỗi lần

let allPosts      = []; // toàn bộ bài (kể cả featured)
let listPosts     = []; // bài không featured — danh sách mặc định
let filteredPosts = []; // sau khi search/filter
let shownCount    = 0;
let activeFilter  = '';

/* =========================================
   DOM REFS
   ========================================= */
const featuredEl   = document.getElementById('featuredPost');
const postList     = document.getElementById('postList');
const noResults    = document.getElementById('noResults');
const loadMoreBtn  = document.getElementById('loadMoreBtn');
const searchInput  = document.getElementById('searchInput');
const resultStatus = document.getElementById('resultStatus');
const tagButtons   = document.querySelectorAll('.tag--link[data-filter]');

/* =========================================
   HELPERS
   ========================================= */
const escapeHTML = str => String(str).replace(/[&<>"']/g, ch => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[ch]));

/** Bỏ dấu tiếng Việt để tìm "toi uu" vẫn ra "Tối ưu" */
const normalize = str => String(str)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/đ/g, 'd');

const postUrl = post => `posts/${encodeURIComponent(post.slug)}.html`;

/* =========================================
   FETCH MANIFEST & BOOTSTRAP
   ========================================= */
async function init() {
  updateCourseStat();
  try {
    const res  = await fetch('posts/manifest.json');
    if (!res.ok) throw new Error('manifest not found');
    const data = await res.json();

    allPosts  = data.posts;
    listPosts = allPosts.filter(p => !p.featured);
    filteredPosts = [...listPosts];

    renderFeatured(allPosts.find(p => p.featured));
    renderBatch(true);
    updateStats(allPosts);
  } catch (err) {
    console.error('Không thể tải manifest:', err);
    if (featuredEl) featuredEl.innerHTML =
      '<p class="load-error">Không thể tải bài viết nổi bật.</p>';
    if (postList) postList.innerHTML =
      '<p class="load-error">Không thể tải danh sách bài viết. Thử tải lại trang nhé.</p>';
  }
}

/* =========================================
   RENDER: featured card
   ========================================= */
function renderFeatured(post) {
  if (!featuredEl) return;
  if (!post) { featuredEl.innerHTML = ''; return; }
  featuredEl.innerHTML = `
    <article class="featured-card">
      <div class="featured-card__meta">
        <span class="tag tag--featured">★ Nổi bật</span>
        ${post.tags.map(t => `<span class="tag tag--cat">${escapeHTML(t)}</span>`).join('')}
      </div>
      <h3 class="featured-card__title">
        <a href="${postUrl(post)}">${escapeHTML(post.title)}</a>
      </h3>
      <p class="featured-card__excerpt">${escapeHTML(post.excerpt)}</p>
      <div class="featured-card__footer">
        <time class="post-date" datetime="${escapeHTML(post.dateISO || '')}">${escapeHTML(post.date)}</time>
        <span class="read-time">${post.readTime} phút đọc</span>
        <span class="read-more" aria-hidden="true">Đọc tiếp →</span>
      </div>
    </article>`;
}

/* =========================================
   RENDER: one post card
   ========================================= */
function createPostCard(post) {
  const card = document.createElement('article');
  card.className = 'post-card';
  card.innerHTML = `
    <div class="post-card__tags">
      ${post.tags.map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('')}
    </div>
    <h3 class="post-card__title">
      <a href="${postUrl(post)}">${escapeHTML(post.title)}</a>
    </h3>
    <p class="post-card__excerpt">${escapeHTML(post.excerpt)}</p>
    <div class="post-card__footer">
      <time class="post-date" datetime="${escapeHTML(post.dateISO || '')}">${escapeHTML(post.date)}</time>
      <span aria-hidden="true">·</span>
      <span class="read-time">${post.readTime} phút đọc</span>
    </div>`;
  return card;
}

/* =========================================
   RENDER: batch of posts (load-more)
   ========================================= */
function renderBatch(reset = false) {
  if (reset) {
    postList.innerHTML = '';
    shownCount = 0;
  }

  const batch = filteredPosts.slice(shownCount, shownCount + PAGE_SIZE);
  batch.forEach((post, i) => {
    const card = createPostCard(post);
    card.style.animationDelay = (i * 0.05) + 's';
    postList.appendChild(card);
  });
  shownCount += batch.length;

  const remaining = filteredPosts.length - shownCount;
  loadMoreBtn.hidden = remaining <= 0;
  if (remaining > 0) loadMoreBtn.textContent = `Xem thêm ${Math.min(remaining, PAGE_SIZE)} bài`;
  noResults.hidden = filteredPosts.length !== 0;
}

/* =========================================
   FILTER: search + tag
   ========================================= */
function isFiltering() {
  return Boolean(searchInput.value.trim() || activeFilter);
}

function applyFilter() {
  const query = normalize(searchInput.value.trim());
  const filtering = isFiltering();

  // Khi đang lọc: tìm trên toàn bộ bài (kể cả bài nổi bật) và ẩn card nổi bật
  const source = filtering ? allPosts : listPosts;
  filteredPosts = source.filter(post => {
    const haystack = normalize([post.title, post.excerpt, ...post.tags].join(' '));
    const matchQuery = !query || haystack.includes(query);
    const matchTag = !activeFilter ||
      post.tags.some(t => normalize(t).includes(activeFilter));
    return matchQuery && matchTag;
  });

  if (featuredEl) featuredEl.hidden = filtering;
  resultStatus.textContent = filtering
    ? `${filteredPosts.length} bài phù hợp`
    : '';

  renderBatch(true);
}

function setActiveTag(filter) {
  activeFilter = filter;
  tagButtons.forEach(btn => {
    const on = btn.dataset.filter === filter;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', String(on));
  });
}

/* =========================================
   STATS
   ========================================= */
function updateStats(posts) {
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  setText('statPosts', posts.length);
  setText('statTags', new Set(posts.flatMap(p => p.tags.map(t => t.toLowerCase()))).size);
}

function updateCourseStat() {
  const el = document.getElementById('statCourses');
  if (el) el.textContent = document.querySelectorAll('.course-card').length;
}

/* =========================================
   EVENTS: blog
   ========================================= */
let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(applyFilter, 120);
});

loadMoreBtn.addEventListener('click', () => renderBatch(false));

tagButtons.forEach(btn => {
  btn.setAttribute('aria-pressed', 'false');
  btn.addEventListener('click', () => {
    setActiveTag(activeFilter === btn.dataset.filter ? '' : btn.dataset.filter);
    applyFilter();
    document.getElementById('posts').scrollIntoView({ block: 'start' });
  });
});

document.getElementById('clearFilters').addEventListener('click', () => {
  searchInput.value = '';
  setActiveTag('');
  applyFilter();
  searchInput.focus();
});

/* =========================================
   DARK MODE
   ========================================= */
const ICON_MOON = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
const ICON_SUN  = '<svg viewBox="0 0 24 24" width="18" height="18"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></g></svg>';

const html        = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = themeToggle.querySelector('.theme-toggle__icon');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  themeIcon.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
  themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
}
applyTheme(html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

themeToggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
});

/* =========================================
   MOBILE MENU
   ========================================= */
const hamburger = document.getElementById('hamburger');
const nav       = document.getElementById('nav');

function setMenu(open) {
  nav.classList.toggle('open', open);
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
}
hamburger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.querySelectorAll('.nav__link').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
document.addEventListener('click', e => {
  if (nav.classList.contains('open') && !nav.contains(e.target) && !hamburger.contains(e.target)) setMenu(false);
});

/* =========================================
   SCROLL SPY
   ========================================= */
const navLinks = [...document.querySelectorAll('.nav__link[href^="#"]')];
const spyObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link =>
      link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id)
    );
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(sec => spyObserver.observe(sec));

/* =========================================
   CONTACT FORM → mailto
   (GitHub Pages không có backend, nên mở ứng dụng email với nội dung soạn sẵn)
   ========================================= */
const contactForm = document.getElementById('contactForm');
const formError   = document.getElementById('formError');

contactForm.addEventListener('submit', e => {
  e.preventDefault();
  // Dùng form.elements: `form.name` là thuộc tính name của chính <form>, không phải ô input
  const fields  = contactForm.elements;
  const name    = fields.namedItem('name').value.trim();
  const subject = fields.namedItem('subject').value.trim();
  const message = fields.namedItem('message').value.trim();

  if (!name || !message) {
    formError.hidden = false;
    fields.namedItem(name ? 'message' : 'name').focus();
    return;
  }
  formError.hidden = true;

  const mailSubject = subject || `Liên hệ từ blog — ${name}`;
  const body = `${message}\n\n— ${name}`;
  window.location.href =
    `mailto:ktap23k@gmail.com?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;
});

/* =========================================
   KICK OFF
   ========================================= */
init();
