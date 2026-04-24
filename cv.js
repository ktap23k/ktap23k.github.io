(function initCvPage() {
  const store = window.CV_DATA || {};
  const languages = store.langs || {};
  const metaDescription = document.querySelector('meta[name="description"]');
  const nav = document.getElementById('nav');
  const sheet = document.getElementById('cvSheet');
  const langSelect = document.getElementById('cvLangSelect');
  const languageLabel = document.getElementById('cvLanguageLabel');
  const downloadButton = document.getElementById('cvDownloadBtn');

  let currentLang = resolveInitialLang();
  let isDownloading = false;

  if (!languages[currentLang]) {
    currentLang = store.defaultLang || 'en';
  }

  window.localStorage.setItem('cvLang', currentLang);

  initThemeToggle();
  initMobileMenu();
  initLanguageSwitcher();
  renderPage();

  function resolveInitialLang() {
    const url = new URL(window.location.href);
    const queryLang = url.searchParams.get('lang');
    if (queryLang && languages[queryLang]) {
      return queryLang;
    }

    const savedLang = window.localStorage.getItem('cvLang');
    if (savedLang && languages[savedLang]) {
      return savedLang;
    }

    return store.defaultLang || 'en';
  }

  function initThemeToggle() {
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('.theme-toggle__icon') : null;

    if (!themeToggle || !themeIcon) {
      return;
    }

    const savedTheme =
      window.localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    applyTheme(savedTheme);

    themeToggle.addEventListener('click', function toggleTheme() {
      const nextTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      window.localStorage.setItem('theme', nextTheme);
    });

    function applyTheme(theme) {
      html.setAttribute('data-theme', theme);
      themeIcon.textContent = theme === 'dark' ? '☼' : '☾';
    }
  }

  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    if (!hamburger || !nav) {
      return;
    }

    hamburger.addEventListener('click', function toggleMenu() {
      const isOpen = nav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
    });

    nav.querySelectorAll('.nav__link').forEach(function closeMenu(link) {
      link.addEventListener('click', function handleClick() {
        nav.classList.remove('open');
        hamburger.classList.remove('open');
      });
    });
  }

  function initLanguageSwitcher() {
    if (!langSelect) {
      return;
    }

    langSelect.addEventListener('change', function handleLanguageChange(event) {
      const nextLang = event.target.value;
      if (!languages[nextLang]) {
        return;
      }

      currentLang = nextLang;
      persistLanguage(currentLang);
      renderPage();
    });

    if (downloadButton) {
      downloadButton.addEventListener('click', downloadCvPdf);
    }
  }

  function persistLanguage(lang) {
    window.localStorage.setItem('cvLang', lang);

    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url.toString());
  }

  function renderPage() {
    const copy = languages[currentLang];
    if (!copy || !sheet) {
      return;
    }

    document.documentElement.lang = currentLang === 'vi' ? 'vi' : 'en';
    document.title = copy.meta.title;
    if (metaDescription) {
      metaDescription.setAttribute('content', copy.meta.description);
    }

    if (languageLabel) {
      languageLabel.textContent = copy.ui.languageLabel;
    }

    if (langSelect) {
      syncLanguageOptions(copy);
      langSelect.value = currentLang;
      langSelect.setAttribute('aria-label', copy.ui.languageLabel);
    }

    updateChromeText(copy);
    renderSheet(copy);
  }

  function syncLanguageOptions(copy) {
    Array.from(langSelect.options).forEach(function updateOption(option) {
      option.textContent = copy.ui.languageOptions[option.value] || option.value;
    });
  }

  function updateChromeText(copy) {
    const navText = copy.ui.nav;
    setText('navHome', navText.home);
    setText('navPosts', navText.posts);
    setText('navAbout', navText.about);
    setText('navContact', navText.contact);
    setText('navCv', navText.cv);

    const footerText = document.getElementById('cvFooterText');
    if (footerText) {
      footerText.innerHTML = copy.ui.footer.text;
    }
    setText('cvFooterHome', copy.ui.footer.home);
    setText('cvFooterPosts', copy.ui.footer.posts);

    if (downloadButton) {
      downloadButton.textContent = isDownloading ? copy.ui.downloading : copy.ui.download;
    }
  }

  function renderSheet(copy) {
    sheet.innerHTML = buildSheetHtml(copy);
  }

  function buildSheetHtml(copy) {
    const profile = copy.profile;
    const sections = copy.ui.sections;
    const miniGroups = copy.ui.miniGroups;
    const projects = copy.projects
      .slice()
      .sort(function sortProjects(a, b) {
        return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      });

    return [
      '<div class="cv-sheet__grid">',
      '  <aside class="cv-sidebar">',
      '    <section class="cv-profile">',
      '      <div class="cv-avatar">' + escapeHtml(profile.initials) + '</div>',
      '      <div>',
      '        <p class="cv-profile__name">' + escapeHtml(profile.name) + '</p>',
      '        <p class="cv-profile__title">' + escapeHtml(profile.title) + '</p>',
      '      </div>',
      '      <p class="cv-profile__location">' + escapeHtml(profile.location) + '</p>',
      '    </section>',
      '    <section class="cv-sidebar-section">',
      '      <p class="cv-sidebar-section__label">' + escapeHtml(sections.contact) + '</p>',
      renderContact(copy.contact),
      '    </section>',
      '    <section class="cv-sidebar-section">',
      '      <p class="cv-sidebar-section__label">' + escapeHtml(sections.skills) + '</p>',
      renderSkillGroups(copy.skillGroups),
      '    </section>',
      '    <section class="cv-sidebar-section">',
      '      <p class="cv-sidebar-section__label">' + escapeHtml(sections.education) + '</p>',
      renderEducation(copy.education),
      '    </section>',
      '    <section class="cv-sidebar-section">',
      '      <p class="cv-sidebar-section__label">' + escapeHtml(sections.additional) + '</p>',
      renderAdditional(miniGroups.workflow, copy.additional.workflow),
      renderInterests(miniGroups.interests, copy.interests),
      '    </section>',
      '  </aside>',
      '  <section class="cv-main">',
      '    <section class="cv-main-section">',
      '      <div class="cv-main-section__heading">',
      '        <p class="cv-main-section__eyebrow">' + escapeHtml(sections.summaryEyebrow) + '</p>',
      '        <h2 class="cv-main-section__title">' + escapeHtml(sections.summaryTitle) + '</h2>',
      '      </div>',
      renderSummary(copy.summary),
      '    </section>',
      '    <section class="cv-main-section">',
      '      <div class="cv-main-section__heading">',
      '        <p class="cv-main-section__eyebrow">' + escapeHtml(sections.experienceEyebrow) + '</p>',
      '        <h2 class="cv-main-section__title">' + escapeHtml(sections.experienceTitle) + '</h2>',
      '      </div>',
      renderExperience(copy.experience),
      '    </section>',
      '    <section class="cv-main-section">',
      '      <div class="cv-main-section__heading">',
      '        <p class="cv-main-section__eyebrow">' + escapeHtml(sections.projectsEyebrow) + '</p>',
      '        <h2 class="cv-main-section__title">' + escapeHtml(sections.projectsTitle) + '</h2>',
      '      </div>',
      renderProjects(projects, copy.ui.projectLink),
      '    </section>',
      '  </section>',
      '</div>',
    ].join('');
  }

  function renderContact(contact) {
    const items = contact
      .map(function mapContact(item) {
        const isExternalLink = Boolean(item.href && item.href.startsWith('http'));
        const valueHtml = item.href
          ? '<a href="' +
            escapeAttribute(item.href) +
            '"' +
            (isExternalLink ? ' target="_blank" rel="noopener"' : '') +
            '>' +
            escapeHtml(item.value) +
            '</a>'
          : escapeHtml(item.value);

        return (
          '<li class="cv-contact-item">' +
          '<span class="cv-contact-item__icon">' +
          escapeHtml(item.icon) +
          '</span>' +
          '<span><strong>' +
          escapeHtml(item.label) +
          ':</strong> ' +
          valueHtml +
          '</span>' +
          '</li>'
        );
      })
      .join('');

    return '<ul class="cv-contact-list">' + items + '</ul>';
  }

  function renderSkillGroups(groups) {
    return groups
      .map(function mapGroup(group) {
        const pills = group.items
          .map(function mapItem(item) {
            return '<span class="cv-pill">' + escapeHtml(item) + '</span>';
          })
          .join('');

        return (
          '<div class="cv-skill-group">' +
          '<p class="cv-skill-group__title">' +
          escapeHtml(group.title) +
          '</p>' +
          '<div class="cv-pill-list">' +
          pills +
          '</div>' +
          '</div>'
        );
      })
      .join('');
  }

  function renderEducation(items) {
    return items
      .map(function mapEducation(item) {
        const details = item.details
          .map(function mapDetail(detail) {
            return '<div class="cv-mini-text">' + escapeHtml(detail) + '</div>';
          })
          .join('');

        return (
          '<div class="cv-education-item">' +
          '<p class="cv-education-item__degree">' +
          escapeHtml(item.degree) +
          '</p>' +
          '<p class="cv-education-item__meta">' +
          escapeHtml(item.period) +
          '</p>' +
          '<p class="cv-education-item__school">' +
          escapeHtml(item.school) +
          '</p>' +
          details +
          '</div>'
        );
      })
      .join('');
  }

  function renderAdditional(title, items) {
    const pills = items
      .map(function mapWorkflow(item) {
        return '<span class="cv-pill cv-pill--soft">' + escapeHtml(item) + '</span>';
      })
      .join('');

    return (
      '<div class="cv-mini-group">' +
      '<p class="cv-mini-group__title">' +
      escapeHtml(title) +
      '</p>' +
      '<div class="cv-pill-list">' +
      pills +
      '</div>' +
      '</div>'
    );
  }

  function renderInterests(title, items) {
    const list = items
      .map(function mapInterest(item) {
        return (
          '<li class="cv-interest-item">' +
          '<span class="cv-interest-item__icon">' +
          escapeHtml(item.icon) +
          '</span>' +
          '<span>' +
          escapeHtml(item.text) +
          '</span>' +
          '</li>'
        );
      })
      .join('');

    return (
      '<div class="cv-mini-group">' +
      '<p class="cv-mini-group__title">' +
      escapeHtml(title) +
      '</p>' +
      '<ul class="cv-interest-list">' +
      list +
      '</ul>' +
      '</div>'
    );
  }

  function renderSummary(summary) {
    const paragraphs = summary.paragraphs
      .map(function mapParagraph(text) {
        return '<p class="cv-summary-text">' + escapeHtml(text) + '</p>';
      })
      .join('');

    const highlights = summary.highlights
      .map(function mapHighlight(text) {
        return '<span class="cv-highlight-pill">' + escapeHtml(text) + '</span>';
      })
      .join('');

    return paragraphs + '<div class="cv-highlight-list">' + highlights + '</div>';
  }

  function renderExperience(items) {
    const entries = items
      .map(function mapEntry(item) {
        const bullets = item.bullets
          .map(function mapBullet(text) {
            return '<li>' + escapeHtml(text) + '</li>';
          })
          .join('');

        const tags = item.tags
          .map(function mapTag(tag) {
            return '<span class="cv-tag">' + escapeHtml(tag) + '</span>';
          })
          .join('');

        return (
          '<article class="cv-entry">' +
          '<h3 class="cv-entry__role">' +
          escapeHtml(item.role) +
          '</h3>' +
          '<p class="cv-entry__period">' +
          escapeHtml(item.period) +
          '</p>' +
          '<p class="cv-entry__company">' +
          escapeHtml(item.company) +
          '</p>' +
          '<div class="cv-entry__desc"><ul>' +
          bullets +
          '</ul></div>' +
          '<div class="cv-entry__tags">' +
          tags +
          '</div>' +
          '</article>'
        );
      })
      .join('');

    return '<div class="cv-timeline">' + entries + '</div>';
  }

  function renderProjects(items, linkLabel) {
    const cards = items
      .map(function mapProject(item) {
        const tags = item.tags
          .map(function mapTag(tag) {
            return '<span class="cv-tag">' + escapeHtml(tag) + '</span>';
          })
          .join('');

        const facts = (item.facts || [])
          .map(function mapFact(fact) {
            return '<span class="cv-project-card__fact">' + escapeHtml(fact) + '</span>';
          })
          .join('');

        const link = item.link
          ? '<a class="cv-project-card__link" href="' +
            escapeAttribute(item.link) +
            '" target="_blank" rel="noopener">' +
            escapeHtml(linkLabel) +
            ' ↗</a>'
          : '';

        const cardClass = item.featured
          ? 'cv-project-card cv-project-card--featured'
          : 'cv-project-card';

        return (
          '<article class="' +
          cardClass +
          '">' +
          '<div class="cv-project-card__top">' +
          '<div>' +
          '<p class="cv-project-card__name">' +
          escapeHtml(item.name) +
          '</p>' +
          '<p class="cv-project-card__meta">' +
          escapeHtml(item.company) +
          ' · ' +
          escapeHtml(item.period) +
          '</p>' +
          (facts ? '<div class="cv-project-card__facts">' + facts + '</div>' : '') +
          '</div>' +
          link +
          '</div>' +
          '<p class="cv-project-card__desc">' +
          escapeHtml(item.description) +
          '</p>' +
          '<div class="cv-tag-list">' +
          tags +
          '</div>' +
          '</article>'
        );
      })
      .join('');

    return '<div class="cv-project-grid">' + cards + '</div>';
  }

  async function downloadCvPdf() {
    const copy = languages[currentLang];
    const exportTarget = document.getElementById('cvSheet');

    if (!copy || !downloadButton || !exportTarget) {
      return;
    }

    isDownloading = true;
    updateChromeText(copy);
    downloadButton.disabled = true;
    document.body.classList.add('cv-exporting');

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      await new Promise(function waitFrame(resolve) {
        window.requestAnimationFrame(resolve);
      });

      if (window.html2pdf) {
        await window.html2pdf()
          .set({
            margin: 0,
            filename: copy.fileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              backgroundColor: '#ffffff',
            },
            jsPDF: {
              unit: 'mm',
              format: 'a4',
              orientation: 'portrait',
            },
            pagebreak: {
              mode: ['css', 'legacy'],
              avoid: ['.cv-entry', '.cv-project-card', '.cv-sidebar-section'],
            },
          })
          .from(exportTarget)
          .save();
      } else {
        window.print();
      }
    } catch (error) {
      console.error('Failed to export CV PDF:', error);
      window.print();
    } finally {
      isDownloading = false;
      downloadButton.disabled = false;
      document.body.classList.remove('cv-exporting');
      updateChromeText(languages[currentLang]);
    }
  }

  function setText(id, text) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }
})();
