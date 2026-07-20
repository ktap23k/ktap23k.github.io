(function initCvPdfBuilder() {
  const COLORS = {
    ink: '#111827',
    text: '#283548',
    muted: '#4B5563',
    quiet: '#9CA3AF',
    accent: '#92400E',
    accentLine: '#B45309',
    line: '#D1D5DB',
  };

  const CONTENT_WIDTH = 511;

  window.CV_PDF = {
    buildDocument,
  };

  function buildDocument(copy) {
    const sections = copy.ui.sections;
    const miniGroups = copy.ui.miniGroups;
    const printLabels = copy.ui.print || {};
    const projects = copy.projects
      .slice()
      .sort(function sortProjects(a, b) {
        return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      });

    const content = [
      buildHeader(copy),
      buildSectionTitle(sections.summaryTitle),
      ...buildSummary(copy.summary),
      buildSectionTitle(sections.skills),
      ...buildSkills(copy.skillGroups),
      buildSectionTitle(sections.experienceTitle),
      ...copy.experience.map(function mapExperience(item) {
        return buildExperience(item, printLabels);
      }),
      buildSectionTitle(sections.projectsTitle, { pageBreak: 'before' }),
      ...projects.map(function mapProject(item) {
        return buildProject(item, printLabels);
      }),
      buildSectionTitle(sections.education),
      ...copy.education.map(buildEducation),
      buildSectionTitle(sections.additional),
      buildAdditional(copy, miniGroups),
    ];

    return {
      info: {
        title: copy.meta.title,
        author: copy.profile.name,
        subject: copy.meta.description,
      },
      pageSize: 'A4',
      pageMargins: [42, 34, 42, 38],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 8.25,
        lineHeight: 1.23,
        color: COLORS.text,
      },
      styles: {
        name: {
          fontSize: 20,
          lineHeight: 1,
          bold: true,
          color: COLORS.ink,
        },
        role: {
          fontSize: 10.2,
          lineHeight: 1.15,
          bold: true,
          color: COLORS.accent,
        },
        location: {
          fontSize: 8,
          bold: true,
          color: COLORS.muted,
        },
        contact: {
          fontSize: 7.5,
          lineHeight: 1.25,
          color: COLORS.muted,
        },
        sectionTitle: {
          fontSize: 9.4,
          lineHeight: 1.1,
          bold: true,
          characterSpacing: 0.8,
          color: COLORS.ink,
        },
        entryTitle: {
          fontSize: 8.8,
          lineHeight: 1.15,
          bold: true,
          color: COLORS.ink,
        },
        period: {
          fontSize: 7.5,
          lineHeight: 1.15,
          bold: true,
          color: COLORS.muted,
        },
        company: {
          fontSize: 8,
          lineHeight: 1.15,
          bold: true,
          color: COLORS.accent,
        },
        meta: {
          fontSize: 7.35,
          lineHeight: 1.2,
          color: COLORS.muted,
        },
      },
      content,
      footer: function buildFooter(currentPage, pageCount) {
        return {
          text: currentPage + ' / ' + pageCount,
          alignment: 'center',
          fontSize: 6.8,
          color: COLORS.quiet,
          margin: [0, 8, 0, 0],
        };
      },
    };
  }

  function buildHeader(copy) {
    return {
      stack: [
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: copy.profile.name, style: 'name' },
                { text: copy.profile.title, style: 'role', margin: [0, 3, 0, 0] },
              ],
            },
            {
              width: 'auto',
              text: copy.profile.location,
              style: 'location',
              alignment: 'right',
              margin: [12, 4, 0, 0],
            },
          ],
        },
        {
          text: buildContactLine(copy.contact),
          style: 'contact',
          margin: [0, 6, 0, 5],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: CONTENT_WIDTH,
              y2: 0,
              lineWidth: 1.2,
              lineColor: COLORS.accentLine,
            },
          ],
        },
      ],
      margin: [0, 0, 0, 2],
      unbreakable: true,
    };
  }

  function buildContactLine(items) {
    const line = [];

    items.forEach(function appendContact(item, index) {
      if (index > 0) {
        line.push({ text: '  •  ', color: COLORS.accentLine });
      }

      line.push({ text: item.label + ': ', bold: true, color: COLORS.ink });
      line.push({
        text: item.value,
        link: item.href || undefined,
        color: COLORS.muted,
      });
    });

    return line;
  }

  function buildSectionTitle(title, options) {
    const settings = options || {};

    return {
      stack: [
        {
          text: String(title).toUpperCase(),
          style: 'sectionTitle',
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: CONTENT_WIDTH,
              y2: 0,
              lineWidth: 0.55,
              lineColor: COLORS.line,
            },
          ],
          margin: [0, 2, 0, 0],
        },
      ],
      margin: [0, 9, 0, 5],
      pageBreak: settings.pageBreak,
      unbreakable: true,
    };
  }

  function buildSummary(summary) {
    const paragraphs = summary.paragraphs.map(function mapParagraph(paragraph, index) {
      return {
        text: paragraph,
        margin: [0, index === 0 ? 0 : 3, 0, 0],
      };
    });

    return [
      ...paragraphs,
      {
        text: summary.highlights
          .map(function prefixHighlight(highlight) {
            return '• ' + highlight;
          })
          .join('     '),
        bold: true,
        fontSize: 7.8,
        color: COLORS.muted,
        margin: [0, 4, 0, 0],
      },
    ];
  }

  function buildSkills(groups) {
    return groups.map(function mapSkillGroup(group) {
      return {
        text: [
          { text: group.title + ': ', bold: true, color: COLORS.ink },
          { text: group.items.join(', ') },
        ],
        margin: [0, 0, 0, 2],
      };
    });
  }

  function buildExperience(item, printLabels) {
    const body = [
      buildEntryHeader(item.role, item.period),
      { text: item.company, style: 'company', margin: [0, 1, 0, 0] },
      {
        ul: item.bullets,
        fontSize: 8,
        lineHeight: 1.2,
        margin: [0, 2, 0, 0],
      },
      buildTechnologyLine(item.tags, printLabels, [0, 2, 0, 0]),
    ];

    return buildNonBreakingBlock(body, [0, 0, 0, 6]);
  }

  function buildProject(item, printLabels) {
    const body = [
      buildEntryHeader(item.name, item.period),
      { text: item.company, style: 'company', margin: [0, 1, 0, 0] },
    ];

    if ((item.facts || []).length) {
      body.push({
        text: item.facts.join('  •  '),
        bold: true,
        fontSize: 7.4,
        color: '#6B4C33',
        margin: [0, 2, 0, 0],
      });
    }

    body.push(
      {
        text: item.description,
        fontSize: 8,
        lineHeight: 1.2,
        margin: [0, 2, 0, 0],
      },
      buildTechnologyLine(item.tags, printLabels, [0, 2, 0, 0])
    );

    return buildNonBreakingBlock(body, [8, 0, 0, 6], {
      leftBorder: true,
    });
  }

  function buildEntryHeader(title, period) {
    return {
      columns: [
        { width: '*', text: title, style: 'entryTitle' },
        {
          width: 'auto',
          text: period,
          style: 'period',
          alignment: 'right',
          margin: [10, 0, 0, 0],
        },
      ],
    };
  }

  function buildTechnologyLine(tags, printLabels, margin) {
    return {
      text: [
        {
          text: (printLabels.technologies || 'Technologies') + ': ',
          bold: true,
          color: COLORS.ink,
        },
        { text: tags.join('  ·  ') },
      ],
      style: 'meta',
      margin,
    };
  }

  function buildEducation(item) {
    const body = [
      buildEntryHeader(item.degree, item.period),
      { text: item.school, style: 'company', margin: [0, 1, 0, 0] },
      {
        text: item.details.join('  •  '),
        margin: [0, 2, 0, 0],
      },
    ];

    return buildNonBreakingBlock(body, [0, 0, 0, 4]);
  }

  function buildAdditional(copy, miniGroups) {
    const interests = copy.interests.map(function mapInterest(item) {
      return item.text;
    });

    return {
      stack: [
        {
          text: [
            { text: miniGroups.workflow + ': ', bold: true, color: COLORS.ink },
            { text: copy.additional.workflow.join('  ·  ') },
          ],
        },
        {
          text: [
            { text: miniGroups.interests + ': ', bold: true, color: COLORS.ink },
            { text: interests.join('  ·  ') },
          ],
          margin: [0, 2, 0, 0],
        },
      ],
      unbreakable: true,
    };
  }

  function buildNonBreakingBlock(stack, margin, options) {
    const settings = options || {};
    const borderColor = settings.leftBorder ? '#D6A277' : COLORS.line;

    return {
      table: {
        widths: ['*'],
        dontBreakRows: true,
        body: [
          [
            {
              stack,
              border: [Boolean(settings.leftBorder), false, false, false],
              borderColor: [borderColor, borderColor, borderColor, borderColor],
              borderWidth: [1.2, 0, 0, 0],
              margin: settings.leftBorder ? [5, 0, 0, 0] : [0, 0, 0, 0],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: function noHorizontalLines() {
          return 0;
        },
        vLineWidth: function projectAccentLine(index) {
          return settings.leftBorder && index === 0 ? 1.2 : 0;
        },
        vLineColor: function projectAccentColor() {
          return borderColor;
        },
        paddingLeft: function noLeftPadding() {
          return 0;
        },
        paddingRight: function noRightPadding() {
          return 0;
        },
        paddingTop: function noTopPadding() {
          return 0;
        },
        paddingBottom: function noBottomPadding() {
          return 0;
        },
      },
      margin,
    };
  }
})();
