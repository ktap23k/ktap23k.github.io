/**
 * paths.js — đường dẫn suy ra từ vị trí file này (course/rag/assets/js/core/),
 * nên trang ở bất kỳ độ sâu nào trong khoá học (index.html, lessons/<module>/<bài>.html)
 * đều dùng chung được.
 */
export const SITE_ROOT = new URL('../../../../../', import.meta.url);   // gốc site
export const COURSE_ROOT = new URL('../../../', import.meta.url);       // course/rag/

/** URL tuyệt đối tới `path`, tính từ gốc site. */
export const siteHref = path => new URL(path, SITE_ROOT).href;

/** URL tuyệt đối tới `path`, tính từ thư mục khoá học. */
export const courseHref = path => new URL(path, COURSE_ROOT).href;

/** Bỏ ".html", "/index" và "/" cuối — GitHub Pages phục vụ cả URL không có đuôi. */
const normalize = pathname =>
  decodeURI(pathname).replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '');

/** Trang đang mở có phải là `url` (URL tuyệt đối) không. */
export const isCurrentPage = url => normalize(new URL(url).pathname) === normalize(location.pathname);
