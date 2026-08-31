/**
 * Generates static portfolio pages from resume-data.json.
 * No external dependencies.
 *
 * Usage:
 *   node generate-portfolio.js   -> index.html, en.html
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "resume-data.json"), "utf8"));
const LANGS = ["de", "en"];
const SITE = "https://denizcangueney.de";
const MONTHS = {
  de: ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function t(value, lang) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value;
  return value[lang] ?? value.de ?? "";
}

function limit(entries, max) {
  return max > 0 ? entries.slice(0, max) : entries;
}

function formatMonthYear(value, lang) {
  if (!value || typeof value !== "string" || !value.includes("/")) return escapeHtml(String(value ?? ""));
  const [mm, yyyy] = value.split("/");
  const month = MONTHS[lang][parseInt(mm, 10) - 1];
  return escapeHtml(`${month} ${yyyy}`);
}

function formatPeriod(job, lang, ongoingLabel) {
  const start = formatMonthYear(job.start, lang);
  const endRaw = t(job.end, lang);
  const end = endRaw.includes("/") ? formatMonthYear(endRaw, lang) : escapeHtml(endRaw);
  const ongoing = job.ongoing ? ` (${escapeHtml(ongoingLabel)})` : "";
  return `${start} – ${end}${ongoing}`;
}

function renderTagList(items) {
  return items.map((item) => `              <li>${escapeHtml(item)}</li>`).join("\n");
}

function renderProjects(lang) {
  const p = data.portfolio;
  const projects = [...data.projects]
    .filter((project) => project.portfolio)
    .sort((a, b) => a.portfolio.order - b.portfolio.order);

  return projects
    .map((project) => {
      const pf = project.portfolio;
      const tags = t(pf.tags, lang);
      const tagsLabel = tags.some((tag) =>
        ["API Design", "Fraud Prevention", "Identity Verification", "Monitoring", "System Integration"].includes(tag)
      )
        ? t(p.projectsSection.tagsLabel, lang)
        : t(p.projectsSection.tagsLabelTech, lang);

      const imageHtml = pf.image
        ? `            <img class="project-image" src="${escapeHtml(pf.image)}" alt="" loading="lazy" />\n`
        : "";

      const linkHtml = project.link
        ? `              <a href="${escapeHtml(project.link)}" target="_blank" rel="noopener noreferrer" class="project-link">
                ${escapeHtml(t(pf.linkLabel, lang))} <span aria-hidden="true">↗</span>
              </a>`
        : `              <span class="project-note">${escapeHtml(t(pf.note, lang))}</span>`;

      return `          <article class="card project-card">
${imageHtml}            <h3>${escapeHtml(t(pf.title, lang))}</h3>
            <p>
              ${escapeHtml(t(pf.description, lang))}
            </p>
            <ul class="tag-list project-tags" aria-label="${escapeHtml(tagsLabel)}">
${renderTagList(tags)}
            </ul>
            <div class="project-links">
${linkHtml}
            </div>
          </article>`;
    })
    .join("\n\n");
}

function renderExperience(lang) {
  const labels = data.labels[lang];
  const maxBullets = data.portfolioLimits?.bulletsPerRole ?? 0;

  return data.experience
    .map((job) => {
      const title = t(job.portfolioTitle, lang) || t(job.title, lang);
      const company = t(job.company, lang);
      const companyDisplay = t(job.portfolioCompanyDisplay, lang) || company;
      const metaCompany = companyDisplay !== company ? companyDisplay : company;
      const period = formatPeriod(job, lang, labels.ongoing);
      const bullets = limit(job.portfolioBullets || job.bullets, maxBullets);
      const items = bullets.map((bullet) => `              <li>${escapeHtml(t(bullet, lang))}</li>`).join("\n");

      return `          <article class="timeline-item">
            <div class="timeline-header">
              <h3>${escapeHtml(title)}</h3>
              <span class="timeline-meta">${escapeHtml(metaCompany)} · ${period} · ${escapeHtml(t(job.location, lang))}</span>
            </div>
            <ul>
${items}
            </ul>
          </article>`;
    })
    .join("\n\n");
}

function renderSkills(lang) {
  return data.portfolioSkills
    .map((group) => {
      const items = t(group.items, lang);
      return `          <article class="card">
            <h3>${escapeHtml(t(group.category, lang))}</h3>
            <ul class="tag-list">
${renderTagList(items)}
            </ul>
          </article>`;
    })
    .join("\n\n");
}

function renderEducation(lang) {
  return data.education
    .map((edu) => {
      const compactClass = edu.compact ? " card--compact" : "";
      const meta = t(edu.portfolioMeta, lang);
      const text = t(edu.portfolioText, lang);
      const textHtml = text ? `\n            <p>${escapeHtml(text)}</p>` : "";

      return `          <article class="card${compactClass}">
            <h3>${escapeHtml(t(edu.institution, lang))}</h3>
            <p class="meta">${escapeHtml(meta)}</p>${textHtml}
          </article>`;
    })
    .join("\n\n");
}

function renderJsonLd(lang) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.name,
    url: lang === "de" ? SITE + "/" : SITE + "/en.html",
    jobTitle: t(data.portfolio.jobTitle, lang),
    email: data.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Berlin",
      addressCountry: lang === "de" ? "DE" : "Germany",
    },
    sameAs: [data.linkedin],
  };

  return JSON.stringify(schema, null, 2)
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
}

function renderDocument(lang) {
  const p = data.portfolio;
  const labels = data.labels[lang];
  const fileName = lang === "de" ? "index.html" : "en.html";
  const otherFile = lang === "de" ? "en.html" : "index.html";
  const canonical = lang === "de" ? SITE + "/" : SITE + "/en.html";
  const cvHref = lang === "de" ? "cv.html" : "cv-en.html";
  const cvDataHref = lang === "de" ? "cv-data.html" : "cv-data-en.html";
  const cvProductHref = lang === "de" ? "cv-product.html" : "cv-product-en.html";
  const langSwitch = labels.langSwitch;
  const hreflangSelf = lang === "de" ? "de" : "en";
  const hreflangOther = lang === "de" ? "en" : "de";
  const ogLocale = lang === "de" ? "de_DE" : "en_GB";
  const ogLocaleAlt = lang === "de" ? "en_GB" : "de_DE";
  const aboutParagraphs = p.aboutSection.paragraphs
    .map((para) => `          <p>\n            ${escapeHtml(t(para, lang))}\n          </p>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(t(p.metaDescription, lang))}" />
  <meta name="author" content="${escapeHtml(data.name)}" />
  <meta name="theme-color" content="#050816" />
  <meta property="og:title" content="${escapeHtml(data.name)} – Portfolio" />
  <meta property="og:description" content="${escapeHtml(t(p.ogDescription, lang))}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${SITE}/og-image.svg" />
  <meta property="og:locale" content="${ogLocale}" />
  <meta property="og:locale:alternate" content="${ogLocaleAlt}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" hreflang="${hreflangSelf}" href="${lang === "de" ? SITE + "/" : SITE + "/en.html"}" />
  <link rel="alternate" hreflang="${hreflangOther}" href="${lang === "de" ? SITE + "/en.html" : SITE + "/"}" />
  <link rel="alternate" hreflang="x-default" href="${SITE}/" />
  <link rel="icon" href="favicon.svg" type="image/svg+xml" />
  <title>${escapeHtml(data.name)} – Portfolio</title>
  <link rel="stylesheet" href="styles.css" />
  <script type="application/ld+json">
${renderJsonLd(lang)}
  </script>
</head>
<body id="top">
  <a class="skip-link" href="#main-content">${escapeHtml(t(p.skipLink, lang))}</a>

  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="#top" aria-label="${escapeHtml(t(p.logoLabel, lang))}">
        <span class="logo-mark">DG</span>
        <span class="logo-text">${escapeHtml(data.name)}</span>
      </a>
      <button type="button" class="nav-menu-toggle" aria-expanded="false" aria-controls="site-nav">${escapeHtml(t(p.menuToggle, lang))}</button>
      <nav id="site-nav" class="nav" aria-label="${escapeHtml(t(p.navLabel, lang))}">
        <a href="#projects">${escapeHtml(t(p.nav.projects, lang))}</a>
        <a href="#experience">${escapeHtml(t(p.nav.experience, lang))}</a>
        <a href="#about">${escapeHtml(t(p.nav.about, lang))}</a>
        <a href="#skills">${escapeHtml(t(p.nav.skills, lang))}</a>
        <a href="#education">${escapeHtml(t(p.nav.education, lang))}</a>
        <a href="#contact">${escapeHtml(t(p.nav.contact, lang))}</a>
        <a href="${escapeHtml(data.linkedin)}" target="_blank" rel="noopener noreferrer" class="nav-link-external">
          LinkedIn
        </a>
        <a href="${otherFile}" class="lang-switch">${langSwitch}</a>
      </nav>
    </div>
  </header>

  <main id="main-content">
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-text">
          <p class="hero-kicker">${escapeHtml(t(p.hero.kicker, lang))}</p>
          <h1>${escapeHtml(t(p.hero.greeting, lang))} <span class="accent">${escapeHtml(data.name)}</span>.</h1>
          <p class="hero-subtitle">
            ${escapeHtml(t(p.hero.subtitle, lang))}
          </p>
          <div class="hero-actions">
            <a href="${cvHref}" class="btn primary">
              ${escapeHtml(t(p.hero.cvButton, lang))}
            </a>
            <a href="#projects" class="btn ghost">${escapeHtml(t(p.hero.projectsButton, lang))}</a>
          </div>
        </div>
      </div>
    </section>

    <section id="projects" class="section">
      <div class="container section-inner">
        <h2>${escapeHtml(t(p.projectsSection.title, lang))}</h2>
        <p class="section-intro">
          ${escapeHtml(t(p.projectsSection.intro, lang))}
        </p>
        <div class="grid-2">
${renderProjects(lang)}
        </div>
      </div>
    </section>

    <section id="experience" class="section">
      <div class="container section-inner">
        <h2>${escapeHtml(t(p.experienceSection.title, lang))}</h2>
        <div class="timeline">
${renderExperience(lang)}
        </div>
      </div>
    </section>

    <section id="about" class="section">
      <div class="container section-inner two-columns">
        <div>
          <h2>${escapeHtml(t(p.aboutSection.title, lang))}</h2>
${aboutParagraphs}
        </div>
        <aside class="info-card">
          <h3>${escapeHtml(t(p.aboutSection.profileCard.title, lang))}</h3>
          <ul class="info-list">
            <li><span>${escapeHtml(t(p.aboutSection.profileCard.location, lang))}</span><span>${escapeHtml(t(p.aboutSection.profileCard.locationValue, lang))}</span></li>
            <li><span>${escapeHtml(t(p.aboutSection.profileCard.role, lang))}</span><span>${escapeHtml(t(p.aboutSection.profileCard.roleValue, lang))}</span></li>
            <li><span>${escapeHtml(t(p.aboutSection.profileCard.studies, lang))}</span><span>${escapeHtml(t(p.aboutSection.profileCard.studiesValue, lang))}</span></li>
            <li><span>${escapeHtml(t(p.aboutSection.profileCard.availability, lang))}</span><span>${escapeHtml(t(data.availabilitySidebar, lang))}</span></li>
            <li><span>${escapeHtml(t(p.aboutSection.profileCard.email, lang))}</span><span><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></span></li>
          </ul>
          <p class="info-card-links">
            ${escapeHtml(t(p.aboutSection.cvVariants.intro, lang))}
            <a href="${cvDataHref}">${escapeHtml(t(p.aboutSection.cvVariants.data, lang))}</a>
            ·
            <a href="${cvProductHref}">${escapeHtml(t(p.aboutSection.cvVariants.product, lang))}</a>
          </p>
        </aside>
      </div>
    </section>

    <section id="skills" class="section">
      <div class="container section-inner">
        <h2>${escapeHtml(t(p.skillsSection.title, lang))}</h2>
        <div class="grid-3">
${renderSkills(lang)}
        </div>
      </div>
    </section>

    <section id="education" class="section">
      <div class="container section-inner">
        <h2>${escapeHtml(t(p.educationSection.title, lang))}</h2>
        <div class="grid-2">
${renderEducation(lang)}
        </div>
      </div>
    </section>

    <section id="contact" class="section">
      <div class="container section-inner two-columns">
        <div>
          <h2>${escapeHtml(t(p.contactSection.title, lang))}</h2>
          <p>
            ${escapeHtml(t(p.contactSection.text, lang))}
          </p>
          <a href="mailto:${escapeHtml(data.email)}" class="btn primary">${escapeHtml(t(p.contactSection.button, lang))}</a>
        </div>
        <aside class="info-card">
          <h3>${escapeHtml(t(p.contactSection.infoTitle, lang))}</h3>
          <ul class="info-list">
            <li><span>${escapeHtml(t(p.aboutSection.profileCard.email, lang))}</span><span><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></span></li>
            <li><span>${escapeHtml(t(p.contactSection.phone, lang))}</span><span><a href="tel:${escapeHtml(data.phoneHref)}">${escapeHtml(data.phone)}</a></span></li>
            <li><span>${escapeHtml(t(p.aboutSection.profileCard.location, lang))}</span><span>${escapeHtml(t(data.location, lang))}</span></li>
          </ul>
        </aside>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <span>© <span id="year"></span> ${escapeHtml(data.name)}</span>
      <span class="footer-note">${escapeHtml(t(p.footer.note, lang))}</span>
      <span class="footer-cv-links">
        <a href="${cvDataHref}">${escapeHtml(t(p.footer.cvVariants.data, lang))}</a>
        ·
        <a href="${cvProductHref}">${escapeHtml(t(p.footer.cvVariants.product, lang))}</a>
      </span>
    </div>
    <script>
      document.getElementById("year").textContent = new Date().getFullYear();
      (function () {
        var toggle = document.querySelector(".nav-menu-toggle");
        var nav = document.getElementById("site-nav");
        if (!toggle || !nav) return;
        toggle.addEventListener("click", function () {
          var open = nav.classList.toggle("is-open");
          toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
        nav.querySelectorAll("a").forEach(function (link) {
          link.addEventListener("click", function () {
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
          });
        });
      })();
    </script>
  </footer>
</body>
</html>
`;
}

for (const lang of LANGS) {
  const target = lang === "de" ? "index.html" : "en.html";
  fs.writeFileSync(path.join(ROOT, target), renderDocument(lang), "utf8");
  console.log(`Wrote ${target}`);
}
