/**
 * theme-init.js — chạy đồng bộ trong <head> để đặt data-theme TRƯỚC khi trang render,
 * tránh hiện tượng "nháy trắng" khi người dùng đang dùng dark mode.
 */
(function () {
  var theme;
  try { theme = localStorage.getItem('theme'); } catch (e) { /* storage bị chặn */ }
  if (theme !== 'dark' && theme !== 'light') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
