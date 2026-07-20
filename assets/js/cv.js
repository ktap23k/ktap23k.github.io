(function initCvPage() {
  const store = window.CV_DATA || {};
  const languages = store.langs || {};
  const metaDescription = document.querySelector('meta[name="description"]');
  const nav = document.getElementById('nav');
  const sheet = document.getElementById('cvSheet');
  const printRoot = document.getElementById('cvPrintRoot');
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
    renderPrintSheet(copy);
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

  function renderPrintSheet(copy) {
    if (printRoot) {
      printRoot.innerHTML = buildPrintSheetHtml(copy);
    }
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

  function buildPrintSheetHtml(copy) {
    const profile = copy.profile;
    const sections = copy.ui.sections;
    const miniGroups = copy.ui.miniGroups;
    const printLabels = copy.ui.print || {};
    const projects = copy.projects
      .slice()
      .sort(function sortProjects(a, b) {
        return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      });

    const contacts = copy.contact
      .map(function mapPrintContact(item) {
        const value = item.href
          ? '<a href="' +
            escapeAttribute(item.href) +
            '">' +
            escapeHtml(item.value) +
            '</a>'
          : escapeHtml(item.value);

        return (
          '<span class="cv-print-contact__item"><strong>' +
          escapeHtml(item.label) +
          ':</strong> ' +
          value +
          '</span>'
        );
      })
      .join('');

    const summary = copy.summary.paragraphs
      .map(function mapPrintSummary(paragraph) {
        return '<p class="cv-print-summary">' + escapeHtml(paragraph) + '</p>';
      })
      .join('');

    const highlights = copy.summary.highlights
      .map(function mapPrintHighlight(highlight) {
        return '<span class="cv-print-highlight">' + escapeHtml(highlight) + '</span>';
      })
      .join('');

    const skills = copy.skillGroups
      .map(function mapPrintSkill(group) {
        const highlightedItems = group.highlightedItems || [];
        const items = group.items
          .map(function mapPrintSkillItem(item, index) {
            const itemClass = highlightedItems.includes(item)
              ? 'cv-print-skill__item cv-print-skill__item--highlighted'
              : 'cv-print-skill__item';
            const separator = index === 0 ? '' : ', ';

            return separator + '<span class="' + itemClass + '">' + escapeHtml(item) + '</span>';
          })
          .join('');

        return (
          '<p class="cv-print-skill"><span class="cv-print-skill__label">' +
          escapeHtml(group.title) +
          ':</span> ' +
          items +
          '</p>'
        );
      })
      .join('');

    const experience = copy.experience
      .map(function mapPrintExperience(item) {
        const bullets = item.bullets
          .map(function mapPrintBullet(bullet) {
            return '<li>' + escapeHtml(bullet) + '</li>';
          })
          .join('');

        return (
          '<article class="cv-print-entry">' +
          '<div class="cv-print-entry__header">' +
          '<h3 class="cv-print-entry__title">' +
          escapeHtml(item.role) +
          '</h3>' +
          '<p class="cv-print-entry__period">' +
          escapeHtml(item.period) +
          '</p>' +
          '</div>' +
          '<p class="cv-print-entry__company">' +
          escapeHtml(item.company) +
          '</p>' +
          '<ul class="cv-print-entry__bullets">' +
          bullets +
          '</ul>' +
          '<p class="cv-print-entry__meta"><span class="cv-print-inline-label">' +
          escapeHtml(printLabels.technologies || 'Technologies') +
          ':</span> ' +
          escapeHtml(item.tags.join(' · ')) +
          '</p>' +
          '</article>'
        );
      })
      .join('');

    const projectEntries = projects
      .map(function mapPrintProject(item) {
        const facts = (item.facts || []).length
          ? '<p class="cv-print-project__facts">' +
            escapeHtml(item.facts.join(' · ')) +
            '</p>'
          : '';

        return (
          '<article class="cv-print-entry cv-print-project">' +
          '<div class="cv-print-entry__header">' +
          '<h3 class="cv-print-entry__title">' +
          escapeHtml(item.name) +
          '</h3>' +
          '<p class="cv-print-entry__period">' +
          escapeHtml(item.period) +
          '</p>' +
          '</div>' +
          '<p class="cv-print-entry__company">' +
          escapeHtml(item.company) +
          '</p>' +
          facts +
          '<p class="cv-print-project__description">' +
          escapeHtml(item.description) +
          '</p>' +
          '<p class="cv-print-entry__meta"><span class="cv-print-inline-label">' +
          escapeHtml(printLabels.technologies || 'Technologies') +
          ':</span> ' +
          escapeHtml(item.tags.join(' · ')) +
          '</p>' +
          '</article>'
        );
      })
      .join('');

    const education = copy.education
      .map(function mapPrintEducation(item) {
        return (
          '<article class="cv-print-education">' +
          '<h3 class="cv-print-education__degree">' +
          escapeHtml(item.degree) +
          '</h3>' +
          '<p class="cv-print-education__period">' +
          escapeHtml(item.period) +
          '</p>' +
          '<p class="cv-print-education__school">' +
          escapeHtml(item.school) +
          '</p>' +
          '<p class="cv-print-education__details">' +
          escapeHtml(item.details.join(' • ')) +
          '</p>' +
          '</article>'
        );
      })
      .join('');

    const workflow = copy.additional.workflow
      .map(function mapPrintWorkflow(item) {
        return '<li>' + escapeHtml(item) + '</li>';
      })
      .join('');

    const interests = copy.interests
      .map(function mapPrintInterest(item) {
        return '<li>' + escapeHtml(item.text) + '</li>';
      })
      .join('');

    return [
      '<header class="cv-print-header">',
      '  <div>',
      '    <h1 class="cv-print-name">' + escapeHtml(profile.name) + '</h1>',
      '    <p class="cv-print-role">' + escapeHtml(profile.title) + '</p>',
      '  </div>',
      '  <p class="cv-print-location">' + escapeHtml(profile.location) + '</p>',
      '  <div class="cv-print-contact">' + contacts + '</div>',
      '</header>',
      '<section class="cv-print-section">',
      '  <h2 class="cv-print-section__title">' + escapeHtml(sections.summaryTitle) + '</h2>',
      summary,
      '  <div class="cv-print-highlights">' + highlights + '</div>',
      '</section>',
      '<section class="cv-print-section">',
      '  <h2 class="cv-print-section__title">' + escapeHtml(sections.skills) + '</h2>',
      '  <div class="cv-print-skill-list">' + skills + '</div>',
      '</section>',
      '<section class="cv-print-section">',
      '  <h2 class="cv-print-section__title">' + escapeHtml(sections.education) + '</h2>',
      education,
      '</section>',
      '<section class="cv-print-section">',
      '  <h2 class="cv-print-section__title">' + escapeHtml(sections.additional) + '</h2>',
      '  <div class="cv-print-additional">',
      '    <div class="cv-print-additional__group">',
      '      <p class="cv-print-inline-label">' + escapeHtml(miniGroups.workflow) + '</p>',
      '      <ul class="cv-print-additional__list">' + workflow + '</ul>',
      '    </div>',
      '    <div class="cv-print-additional__group">',
      '      <p class="cv-print-inline-label">' + escapeHtml(miniGroups.interests) + '</p>',
      '      <ul class="cv-print-additional__list">' + interests + '</ul>',
      '    </div>',
      '  </div>',
      '</section>',
      '<section class="cv-print-section">',
      '  <h2 class="cv-print-section__title">' + escapeHtml(sections.experienceTitle) + '</h2>',
      experience,
      '</section>',
      '<section class="cv-print-section">',
      '  <h2 class="cv-print-section__title">' + escapeHtml(sections.projectsTitle) + '</h2>',
      projectEntries,
      '</section>',
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
        const highlightedItems = group.highlightedItems || [];
        const pills = group.items
          .map(function mapItem(item) {
            const pillClass = highlightedItems.includes(item)
              ? 'cv-pill cv-pill--highlighted'
              : 'cv-pill';

            return '<span class="' + pillClass + '">' + escapeHtml(item) + '</span>';
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

  function downloadCvPdf() {
    const copy = languages[currentLang];

    if (!copy || !downloadButton || !printRoot) {
      return;
    }

    isDownloading = true;
    updateChromeText(copy);
    downloadButton.disabled = true;

    try {
      if (
        window.pdfMake &&
        typeof window.pdfMake.createPdf === 'function' &&
        window.CV_PDF &&
        typeof window.CV_PDF.buildDocument === 'function'
      ) {
        const definition = window.CV_PDF.buildDocument(copy);
        const resetTimer = window.setTimeout(finishDownload, 30000);

        window.pdfMake.createPdf(definition).download(
          copy.fileName,
          function handlePdfDownload() {
            window.clearTimeout(resetTimer);
            finishDownload();
          },
          {
            fontLayoutCache: false,
          }
        );
        return;
      }

      window.print();
    } catch (error) {
      console.error('Failed to download the CV PDF:', error);
      window.print();
    }

    finishDownload();

    function finishDownload() {
      if (!isDownloading) {
        return;
      }

      isDownloading = false;
      downloadButton.disabled = false;
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
