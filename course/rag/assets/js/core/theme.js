/**
 * theme.js — dark/light mode, nhớ lựa chọn của người đọc.
 */
import { storage } from './dom.js';

const KEY = 'theme';
const root = document.documentElement;

function apply(theme, icon) {
  root.dataset.theme = theme;
  icon.textContent = theme === 'dark' ? '☼' : '☾';
}

/** Khôi phục theme đã lưu (mặc định theo hệ điều hành) và gắn sự kiện cho nút chuyển. */
export function initTheme(button) {
  const icon = button.querySelector('.theme-toggle__icon');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  apply(storage.read(KEY) || systemTheme, icon);

  button.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next, icon);
    storage.write(KEY, next);
  });
}
