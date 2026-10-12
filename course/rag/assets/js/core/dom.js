/**
 * dom.js — tiện ích nhỏ dùng chung: escape HTML, định dạng thời lượng, storage an toàn.
 */
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape giá trị trước khi chèn vào template HTML. */
export const esc = value => String(value).replace(/[&<>"']/g, ch => ESCAPES[ch]);

/** 95 → "1 giờ 35 phút" */
export function formatMinutes(total) {
  const h = Math.floor(total / 60), m = total % 60;
  return [h && `${h} giờ`, m && `${m} phút`].filter(Boolean).join(' ') || '0 phút';
}

/**
 * localStorage có thể bị chặn (chế độ ẩn danh, chặn cookie…) — luôn bọc try/catch
 * để trang vẫn chạy bình thường, chỉ là không nhớ được trạng thái.
 */
export const storage = {
  read(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  write(key, value) {
    try { localStorage.setItem(key, value); } catch { /* không lưu được thì bỏ qua */ }
  },
};
