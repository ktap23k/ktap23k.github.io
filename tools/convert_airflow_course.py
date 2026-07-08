#!/usr/bin/env python3
"""
Convert Airflow_Learning_Path.md → course/airflow/index.html
Apply version updates required for Airflow 3.2.x
"""

import html
import re
from pathlib import Path

ROOT = Path("/Users/tuanta/Desktop/Tuan/ktap23k.github.io")
MD_PATH = Path("/Users/tuanta/Downloads/airflow/Airflow_Learning_Path.md")
OUT_HTML = ROOT / "course" / "airflow" / "index.html"
OUT_CSS = ROOT / "assets" / "css" / "course.css"

PDFS = [
    ("Stage1_Foundation_v2.pdf", "Stage 1: Foundation"),
    ("Stage2_Architecture_v2.pdf", "Stage 2: Architecture Deep Dive"),
    ("Stage3_Integration_v2.pdf", "Stage 3: Integration"),
    ("Stage4_Production_v2.pdf", "Stage 4: Production"),
    ("Stage5_Advanced_v2.pdf", "Stage 5: Advanced"),
    ("Stage6_Comparison_v2.pdf", "Stage 6: Comparison"),
    ("Appendix_Anti-patterns_v2.pdf", "Appendix: Anti-patterns & Troubleshooting"),
    ("Appendix_Exercises_v2.pdf", "Appendix: Exercise Checklist"),
]


def escape(text: str) -> str:
    return html.escape(text)


def process_inline(text: str) -> str:
    # links
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", lambda m: f'<a href="{escape(m.group(2))}">{escape(m.group(1))}</a>', text)
    # bold
    text = re.sub(r"\*\*(.+?)\*\*", lambda m: f"<strong>{escape(m.group(1))}</strong>", text)
    # inline code
    text = re.sub(r"`([^`]+)`", lambda m: f"<code>{escape(m.group(1))}</code>", text)
    return text


def slugify(text: str) -> str:
    t = text.lower().strip()
    t = re.sub(r"[^a-z0-9\s\-]", "", t)
    t = re.sub(r"\s+", "-", t)
    return t.strip("-") or "section"


def transform_content(raw_md: str) -> str:
    # Version updates
    raw_md = raw_md.replace("Airflow 3.1.7", "Airflow 3.2.2")
    raw_md = raw_md.replace("apache/airflow:3.1.7", "apache/airflow:3.2.2")
    raw_md = raw_md.replace("postgres:15", "postgres:17")
    raw_md = raw_md.replace("Target Airflow Version:** 3.1.7", "Target Airflow Version:** 3.2.x")
    raw_md = raw_md.replace("Chạy Airflow 3.1.7", "Chạy Airflow 3.2.2")
    raw_md = raw_md.replace("Airflow 3.1", "Airflow 3.2")

    # Import updates
    raw_md = raw_md.replace("from airflow.decorators import dag, task", "from airflow.sdk import dag, task")
    raw_md = raw_md.replace("from airflow import DAG", "from airflow.sdk import DAG")
    raw_md = raw_md.replace("from airflow.datasets import Dataset", "from airflow.sdk import Asset")
    raw_md = raw_md.replace("Dataset(", "Asset(")
    raw_md = raw_md.replace("from airflow.operators.python import PythonOperator", "from airflow.providers.standard.operators.python import PythonOperator")
    raw_md = raw_md.replace("from airflow.operators.bash import BashOperator", "from airflow.providers.standard.operators.bash import BashOperator")

    # Edge/Task SDK wording
    raw_md = raw_md.replace(
        "# Task SDK cho remote execution (không cần full Airflow install)",
        "# Task SDK cho remote execution (chỉ cần apache-airflow-task-sdk)"
    )
    raw_md = raw_md.replace(
        "# Code này chạy ở remote/edge node, chỉ cần airflow-sdk pip package",
        "# Code này chạy ở remote/edge node, chỉ cần pip install apache-airflow-task-sdk"
    )
    raw_md = raw_md.replace(
        "EdgeExecutor (3.0) | Remote/edge nodes | Event-driven | Hybrid cloud, IoT | Variable",
        "EdgeExecutor (3.2) | Remote/edge nodes | Event-driven | Hybrid cloud, IoT | Variable"
    )
    raw_md = raw_md.replace(
        "### 5.3 Airflow 3.0 Task SDK & Edge Executor",
        "### 5.3 Airflow 3.2 Task SDK & Edge Executor"
    )
    raw_md = raw_md.replace("Task SDK 3.0", "Task SDK 3.2")
    raw_md = raw_md.replace("Airflow 3.0 Task SDK", "Airflow 3.2 Task SDK")
    raw_md = raw_md.replace("`pip install airflow-sdk`", "`pip install apache-airflow-task-sdk`")
    raw_md = raw_md.replace("Airflow 3.0 Release Notes", "Airflow 3.2 Release Notes")

    # max_num_rendered_ti_fields_per_task -> num_dag_runs_to_retain_rendered_fields
    raw_md = raw_md.replace(
        "max_num_rendered_ti_fields_per_task",
        "num_dag_runs_to_retain_rendered_fields"
    )

    # Replace SLA section with DeadlineAlert example
    raw_md = re.sub(
        r"### 4\.5 SLA & Alerting\n\n```python.*?```\n",
        SLA_ALERTING_MD + "\n",
        raw_md,
        flags=re.DOTALL,
    )

    # Docs version link
    raw_md = raw_md.replace(
        "https://airflow.apache.org/docs/apache-airflow/3.1.7/",
        "https://airflow.apache.org/docs/apache-airflow/3.2.2/"
    )
    raw_md = raw_md.replace(
        "https://airflow.apache.org/blog/airflow-3.0/",
        "https://airflow.apache.org/blog/airflow-3.2/"
    )

    return raw_md


SLA_ALERTING_MD = '''### 4.5 SLA & Alerting (Airflow 3.2 — DeadlineAlert)

Airflow 3.2 thay thế cơ chế SLA cũ bằng **DeadlineAlert** — cho phép định nghĩa deadline linh hoạt và callback đồng bộ/bất đồng bộ.

```python
# dags/stage4_deadline_alert.py
from airflow.sdk import DAG
from airflow.providers.standard.operators.python import PythonOperator
from airflow.sdk.definitions.deadline import DeadlineAlert, DeadlineReference, SyncCallback
from datetime import datetime, timedelta


def on_deadline_miss(*, deadline_reference: DeadlineReference, **context):
    """Callback được gọi khi task vượt deadline."""
    print(f"⚠️ Deadline missed: {deadline_reference.name}")
    # Gửi alert: PagerDuty, Slack, Opsgenie...


with DAG(
    dag_id='production_invoice_pipeline',
    schedule=timedelta(hours=1),
    start_date=datetime(2026, 6, 1),
    catchup=False,
    tags=['production', 'invoice'],
    default_args={
        'owner': 'tuanta',
        'retries': 2,
        'retry_delay': timedelta(minutes=5),
    },
) as dag:

    # Deadline cấp DAG: toàn bộ DAG phải xong trong 45 phút
    dag.deadline = DeadlineAlert(
        deadline=timedelta(minutes=45),
        name='dag_finish_deadline',
        callback=SyncCallback(on_deadline_miss),
    )

    def calculate_tax(**context):
        import time
        time.sleep(5)
        return {"tax": 1000000}

    # Task-critical với deadline riêng
    critical_task = PythonOperator(
        task_id='tax_calculation',
        python_callable=calculate_tax,
        deadline=DeadlineAlert(
            deadline=timedelta(minutes=15),
            name='tax_calc_deadline',
            callback=SyncCallback(on_deadline_miss),
        ),
    )
```

**Lưu ý:**
- `DeadlineAlert` hỗ trợ cả `SyncCallback` và `AsyncCallback` (cho I/O không chặn).
- Thứ tự ưu tiên: **task deadline > DAG deadline**.
- Kết hợp với email/Slack webhook trong callback để cảnh báo tức thì.'''


def parse_markdown(md: str) -> str:
    lines = md.splitlines()
    out: list[str] = []
    i = 0
    in_code = False
    code_lang = ""
    code_buf: list[str] = []
    in_table = False
    table_rows: list[list[str]] = []
    list_stack: list[str] = []  # 'ul' or 'ol'

    def flush_code():
        nonlocal in_code, code_buf, code_lang
        if not in_code:
            return
        code = "\n".join(code_buf)
        code_class = f"language-{code_lang}" if code_lang else ""
        out.append(f'<pre><code class="{code_class}">{escape(code)}</code></pre>')
        in_code = False
        code_buf = []
        code_lang = ""

    def flush_table():
        nonlocal in_table, table_rows
        if not table_rows:
            return
        html_table = ['<div class="table-wrap"><table>']
        html_table.append("<thead><tr>")
        for cell in table_rows[0]:
            html_table.append(f"<th>{process_inline(cell.strip())}</th>")
        html_table.append("</tr></thead>")
        if len(table_rows) > 2:
            html_table.append("<tbody>")
            for row in table_rows[2:]:
                html_table.append("<tr>")
                for cell in row:
                    html_table.append(f"<td>{process_inline(cell.strip())}</td>")
                html_table.append("</tr>")
            html_table.append("</tbody>")
        html_table.append("</table></div>")
        out.append("".join(html_table))
        in_table = False
        table_rows = []

    def close_lists():
        nonlocal list_stack
        while list_stack:
            out.append(f"</{list_stack.pop()}>")

    def ensure_list(kind: str):
        nonlocal list_stack
        if list_stack and list_stack[-1] != kind:
            close_lists()
        if not list_stack:
            out.append(f"<{kind}>")
            list_stack.append(kind)

    while i < len(lines):
        line = lines[i]

        # code fences
        if line.startswith("```"):
            if in_code:
                flush_code()
                i += 1
                continue
            close_lists()
            in_code = True
            code_lang = line[3:].strip()
            i += 1
            continue

        if in_code:
            code_buf.append(line)
            i += 1
            continue

        # table
        if line.startswith("|"):
            close_lists()
            cells = [c.strip() for c in line.strip("|").split("|")]
            table_rows.append(cells)
            in_table = True
            i += 1
            continue
        elif in_table:
            flush_table()

        # headings
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            close_lists()
            level = len(m.group(1))
            text = m.group(2).strip()
            anchor = slugify(text)
            out.append(f'<h{level} id="{anchor}">{process_inline(text)}</h{level}>')
            i += 1
            continue

        # horizontal rule
        if line.strip() == "---":
            close_lists()
            out.append("<hr />")
            i += 1
            continue

        # unordered list item
        m = re.match(r"^([\s]*)([-*])\s+(.*)$", line)
        if m:
            content = m.group(3)
            checkbox = ""
            if content.startswith("[ ] "):
                content = content[4:]
                checkbox = '<input type="checkbox" disabled /> '
            elif content.startswith("[x] "):
                content = content[4:]
                checkbox = '<input type="checkbox" checked disabled /> '
            ensure_list("ul")
            out.append(f'<li>{checkbox}{process_inline(content)}</li>')
            i += 1
            continue

        # ordered list item
        m = re.match(r"^([\s]*)\d+\.\s+(.*)$", line)
        if m:
            content = m.group(2)
            ensure_list("ol")
            out.append(f'<li>{process_inline(content)}</li>')
            i += 1
            continue

        # blockquote / warning
        if line.startswith("> "):
            close_lists()
            q_lines = []
            while i < len(lines) and lines[i].startswith("> "):
                q_lines.append(lines[i][2:])
                i += 1
            q_text = " ".join(q_lines)
            out.append(f'<blockquote><p>{process_inline(q_text)}</p></blockquote>')
            continue

        # blank line closes lists
        stripped = line.strip()
        if stripped == "":
            close_lists()
            i += 1
            continue

        # paragraph
        close_lists()
        p_lines = [stripped]
        i += 1
        while i < len(lines) and lines[i].strip() != "":
            nxt = lines[i]
            # stop paragraph if next line starts a block element
            if (nxt.startswith("```") or nxt.startswith("|") or nxt.startswith("> ")
                    or re.match(r"^#{1,6}\s+", nxt) or re.match(r"^([\s]*)([-*])\s+", nxt)
                    or re.match(r"^([\s]*)\d+\.\s+", nxt) or nxt.strip() == "---"):
                break
            p_lines.append(nxt.strip())
            i += 1
        out.append(f"<p>{process_inline(' '.join(p_lines))}</p>")

    flush_code()
    flush_table()
    close_lists()
    return "\n".join(out)


def build_toc(md: str) -> list[tuple[int, str, str]]:
    toc = []
    for line in md.splitlines():
        m = re.match(r"^(#{2,3})\s+(.*)$", line)
        if m:
            level = len(m.group(1))
            text = m.group(2).strip()
            anchor = slugify(text)
            toc.append((level, text, anchor))
    # Add PDF section
    toc.append((2, "Tài liệu PDF", "tai-lieu-pdf"))
    return toc


def main():
    md = MD_PATH.read_text(encoding="utf-8")
    md = transform_content(md)
    body_html = parse_markdown(md)

    toc_items = build_toc(md)
    toc_html = '<ul class="toc__list">\n'
    for level, text, anchor in toc_items:
        cls = "toc-h3" if level == 3 else ""
        toc_html += f'  <li class="{cls}"><a href="#{anchor}">{escape(text)}</a></li>\n'
    toc_html += "</ul>"

    pdfs_html = "\n".join(
        f'          <li><a href="pdfs/{name}" download class="pdf-link">📄 {label}</a></li>'
        for name, label in PDFS
    )

    final_html = f"""<!DOCTYPE html>
<html lang="vi" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Khoá học Apache Airflow 3.2.x — Ktap</title>
  <meta name="description" content="Khoá học Apache Airflow 3.2.x từ LocalExecutor đến Production cho Backend / Distributed Systems Engineer." />
  <link rel="icon" type="image/svg+xml" href="../../favicon.svg" />
  <link rel="stylesheet" href="../../assets/css/style.css" />
  <link rel="stylesheet" href="../../assets/css/course.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
</head>
<body>
  <div class="progress-bar" id="progressBar"></div>

  <!-- ===== HEADER ===== -->
  <header class="header">
    <div class="container header__inner">
      <a href="../../index.html" class="logo">
        <img class="logo__icon" src="../../avt.jpg" alt="" />
        <span class="logo__text">Ktap</span>
      </a>

      <nav class="nav" id="nav">
        <a href="../../index.html#home" class="nav__link">Trang chủ</a>
        <a href="../../index.html#posts" class="nav__link">Bài viết</a>
        <a href="index.html" class="nav__link active">Khoá học</a>
        <a href="../../index.html#about" class="nav__link">Về tôi</a>
        <a href="../../index.html#contact" class="nav__link">Liên hệ</a>
        <a href="../../game/index.html" class="nav__link">Game</a>
        <a href="../../cv.html" class="nav__link nav__link--cv">CV</a>
      </nav>

      <div class="header__actions">
        <button class="theme-toggle" id="themeToggle" aria-label="Chuyển giao diện">
          <span class="theme-toggle__icon">☾</span>
        </button>
        <button class="hamburger" id="hamburger" aria-label="Mở menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>

  <main>
    <!-- ===== COURSE HERO ===== -->
    <section class="course-hero" id="home">
      <div class="container course-hero__inner">
        <div class="course-hero__badge">Lộ trình 15-20 ngày</div>
        <h1 class="course-hero__title">Khoá học Apache Airflow <span class="accent">3.2.x</span></h1>
        <p class="course-hero__subtitle">Từ LocalExecutor đến Production</p>
        <p class="course-hero__desc">
          Tài liệu học tập chi tiết cho <strong>Backend / Distributed Systems Engineer</strong>.
          Bắt đầu với Docker LocalExecutor, đi sâu kiến trúc Scheduler/Executor/Metadata DB, tích hợp Kafka,
          Spark, Cassandra, API mTLS, rồi triển khai Celery + Redis, monitoring, event-driven với Asset,
          Dynamic Task Mapping và Task SDK 3.2.
        </p>
        <div class="course-hero__badges">
          <span class="badge badge--primary">Apache Airflow 3.2.2</span>
          <span class="badge badge--secondary">PostgreSQL 17</span>
          <span class="badge badge--secondary">Redis 7</span>
          <span class="badge badge--secondary">Docker</span>
        </div>
        <div class="course-hero__meta">
          <div class="meta-item">
            <span class="meta-item__icon">👤</span>
            <span>Backend Engineer, DevOps, Data Engineer</span>
          </div>
          <div class="meta-item">
            <span class="meta-item__icon">⏱</span>
            <span>15-20 ngày · 2-3 giờ/ngày</span>
          </div>
          <div class="meta-item">
            <span class="meta-item__icon">🎯</span>
            <span>LocalExecutor → Celery + Redis → K8s</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== COURSE CONTENT ===== -->
    <section class="course-content">
      <div class="container post-layout">
        <article class="article-body course-body">
          <div class="breadcrumb">
            <a href="../../index.html">Trang chủ</a>
            <span class="breadcrumb__sep">/</span>
            <span>Khoá học</span>
            <span class="breadcrumb__sep">/</span>
            <span>Apache Airflow 3.2.x</span>
          </div>

{body_html}

          <!-- PDF DOWNLOADS -->
          <h2 id="tai-lieu-pdf">Tài liệu PDF</h2>
          <p>Download tài liệu từng phần để học offline:</p>
          <ul class="pdf-list">
{pdfs_html}
          </ul>

        </article>

        <aside class="toc" id="toc">
          <h4 class="toc__title">Mục lục</h4>
{toc_html}
        </aside>
      </div>
    </section>
  </main>

  <!-- ===== FOOTER ===== -->
  <footer class="footer">
    <div class="container footer__inner">
      <p>© 2026 <strong>tuanta</strong> · Được xây dựng với ❤️ và HTML thuần</p>
      <div class="footer__links">
        <a href="../../index.html">Trang chủ</a>
        <a href="../../index.html#posts">Bài viết</a>
        <a href="../../cv.html">CV</a>
      </div>
    </div>
  </footer>

  <button class="back-to-top" id="backToTop" aria-label="Lên đầu trang">↑</button>

  <script>
    // Theme toggle + mobile menu (mirrors script.js without blog-specific logic)
    (function () {{
      const html = document.documentElement;
      const themeToggle = document.getElementById('themeToggle');
      const themeIcon = themeToggle.querySelector('.theme-toggle__icon');
      const savedTheme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      html.setAttribute('data-theme', savedTheme);
      themeIcon.textContent = savedTheme === 'dark' ? '☼' : '☾';
      themeToggle.addEventListener('click', () => {{
        const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        themeIcon.textContent = next === 'dark' ? '☼' : '☾';
        localStorage.setItem('theme', next);
      }});

      const hamburger = document.getElementById('hamburger');
      const nav = document.getElementById('nav');
      hamburger.addEventListener('click', () => {{
        const open = nav.classList.toggle('open');
        hamburger.classList.toggle('open', open);
      }});
      nav.querySelectorAll('.nav__link').forEach(link => {{
        link.addEventListener('click', () => {{
          nav.classList.remove('open');
          hamburger.classList.remove('open');
        }});
      }});
    }})();

    // Course page enhancements
    (function () {{
      const progressBar = document.getElementById('progressBar');
      const backToTop = document.getElementById('backToTop');
      const tocLinks = document.querySelectorAll('.toc__list a');
      const headings = Array.from(document.querySelectorAll('.course-body h2[id], .course-body h3[id]'));

      function updateProgress() {{
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = pct + '%';
        backToTop.classList.toggle('visible', scrollTop > 400);
      }}

      function updateToc() {{
        const scrollPos = window.scrollY + 100;
        let current = headings[0]?.id || '';
        for (const h of headings) {{
          if (h.offsetTop <= scrollPos) current = h.id;
        }}
        tocLinks.forEach(link => {{
          link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        }});
      }}

      window.addEventListener('scroll', () => {{
        updateProgress();
        updateToc();
      }}, {{ passive: true }});

      backToTop.addEventListener('click', () => {{
        window.scrollTo({{ top: 0, behavior: 'smooth' }});
      }});

      // Highlight initial
      updateToc();
    }})();
  </script>
</body>
</html>
"""
    OUT_HTML.write_text(final_html, encoding="utf-8")
    print(f"Wrote {OUT_HTML}")


if __name__ == "__main__":
    main()
