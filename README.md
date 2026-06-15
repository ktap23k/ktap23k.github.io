<div align="center">

# ✦ Ktap Blog

**Blog cá nhân của tuanta — chia sẻ về backend, DevOps, AI/LLM và cuộc sống của một developer.**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-blue?logo=github)](https://ktap23k.github.io)
[![HTML](https://img.shields.io/badge/HTML-vanilla-orange?logo=html5)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/CSS-vanilla-blue?logo=css3)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-yellow?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

</div>

---

## 🚀 Giới thiệu

Đây là mã nguồn blog cá nhân được xây dựng hoàn toàn bằng **HTML/CSS/JavaScript thuần** (không framework), tối ưu cho tốc độ tải và đơn giản trong bảo trì. Blog được host miễn phí trên **GitHub Pages**.

### Tính năng nổi bật

- ⚡ **Tốc độ cao** — HTML tĩnh, không phụ thuộc backend.
- 🌙 **Dark mode** — tự động theo hệ điều hành hoặc lựa chọn của ngườidùng.
- 🔍 **Tìm kiếm & lọc tag** ngay trên trang chủ.
- 📱 **Responsive** — hiển thị tốt trên desktop, tablet và mobile.
- 📝 **Bài viết markdown-style** với Table of Contents tự động.
- 📄 **Trang CV song ngữ** Anh/Việt có thể tải PDF.
- ✨ **Hiệu ứng particle** nhẹ nhàng trên trang chủ.

---

## 🗂️ Cấu trúc thư mục

```text
ktap23k.github.io/
├── index.html                 # Trang chủ
├── cv.html                    # Trang CV song ngữ
├── posts/                     # Các bài viết HTML
│   ├── manifest.json          # Metadata bài viết (tự động sinh)
│   └── *.html
├── assets/
│   ├── css/
│   │   └── style.css          # Toàn bộ stylesheet
│   ├── js/
│   │   ├── script.js          # Logic trang chủ
│   │   ├── shared.js          # Header/footer/TOC/dark mode dùng chung cho posts
│   │   ├── antigravity.js     # Hiệu ứng particle
│   │   ├── cv.js              # Logic trang CV
│   │   └── cv-data.js         # Dữ liệu CV song ngữ
│   └── images/                # Hình ảnh (để dành)
├── tools/
│   └── build.js               # Script sinh posts/manifest.json
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🛠️ Công nghệ

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Font:** Inter, Merriweather (Google Fonts)
- **PDF Export:** html2pdf.js
- **Build:** Node.js (chỉ dùng để sinh `manifest.json`)
- **Hosting:** GitHub Pages

---

## 🏃 Chạy local

Vì đây là site tĩnh, bạn có thể mở trực tiếp `index.html` bằng trình duyệt. Tuy nhiên, để các request `fetch()` hoạt động đúng (ví dụ tải `posts/manifest.json`), nên dùng một local server:

```bash
# Cách 1: Python 3
python3 -m http.server 8080

# Cách 2: Node.js
npx serve .
```

Sau đó mở: http://localhost:8080

---

## ✍️ Thêm bài viết mới

1. Tạo file HTML mới trong thư mục `posts/`.
2. Tuân thủ cấu trúc bài viết hiện có:
   - `<h1 class="article-title">` — tiêu đề bài viết.
   - `<meta name="description" content="...">` — tóm tắt.
   - `<div class="article-header__tags">` — các tag.
   - `<span class="tag tag--featured">Nổi bật</span>` — đánh dấu bài nổi bật.
   - `<span>dd tháng mm, yyyy</span>` — ngày đăng.
   - `⏱ X phút đọc` — thờigian đọc.
3. Chạy lệnh sau để cập nhật `posts/manifest.json`:

```bash
node tools/build.js
```

4. Commit và push lên GitHub. GitHub Pages sẽ tự động cập nhật.

---

## 📝 Quy ước viết bài

- Sử dụng ngôn ngữ **tiếng Việt** có dấu, rõ ràng.
- Đoạn code đặt trong `<pre><code>...</code></pre>`.
- Tiêu đề H2/H3 để `shared.js` tự động tạo mục lục.
- Giữ bố cục đơn giản, ưu tiên đọc trên mobile.

---

## 🌐 Deploy

Blog sử dụng **GitHub Pages** với nhánh `main`:

1. Vào **Settings → Pages** trong repository.
2. Chọn nguồn: **Deploy from a branch → main → / (root)**.
3. Lưu lại. Sau vài phút, site sẽ có tại: https://ktap23k.github.io

---

## 📄 Giấy phép

Mã nguồn được phát hành theo giấy phép [MIT](LICENSE).

Nội dung bài viết thuộc về tác giả. Vui lòng ghi nguồn khi chia sẻ lại.

---

<div align="center">

**Được xây dựng với ❤️ và HTML thuần.**

</div>
