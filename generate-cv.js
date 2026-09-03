/**
 * Generates static ATS-friendly CV pages from resume-data.json.
 * No external dependencies.
 *
 * Usage:
 *   node generate-cv.js                  -> cv.html, cv-en.html (full version)
 *   node generate-cv.js --profile=data   -> cv-data.html, cv-data-en.html
 *   node generate-cv.js --all            -> every profile defined in resume-data.json
 *
 * Profiles filter bullets, projects and skill groups via their "tags" field.
 * The "full" profile always includes everything.
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "resume-data.json"), "utf8"));
const LANGS = ["de", "en"];

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

function matchesProfile(entry, profile) {
  if (profile === "full") return true;
  return Array.isArray(entry.tags) && entry.tags.includes(profile);
}

/** Keeps the CV to one page: entries are ordered by relevance, so slicing keeps the strongest. */
function limit(entries, max) {
  return max > 0 ? entries.slice(0, max) : entries;
}

function websiteLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return String(url).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  }
}

function renderPeriod(entry, lang, labels) {
  const start = escapeHtml(t(entry.start, lang));
  const end = escapeHtml(t(entry.end, lang));
  const ongoing = entry.ongoing ? ` (${escapeHtml(labels.ongoing)})` : "";
  return `<time>${start}</time> ${escapeHtml(labels.periodSep)} <time>${end}</time>${ongoing}`;
}

function renderExperience(lang, profile, labels) {
  return data.experience
    .map((job) => {
      const bullets = limit(
        job.bullets.filter((bullet) => matchesProfile(bullet, profile)),
        data.limits.bulletsPerRole
      );
      if (!bullets.length) return "";

      const items = bullets
        .map((bullet) => `          <li>${escapeHtml(t(bullet, lang))}</li>`)
        .join("\n");

      return `      <article class="cv-entry">
        <div class="cv-entry-head">
          <h3>${escapeHtml(t(job.title, lang))}</h3>
          <p class="cv-dates">${renderPeriod(job, lang, labels)}</p>
        </div>
        <p class="cv-meta"><span class="cv-org">${escapeHtml(t(job.company, lang))}</span> · ${escapeHtml(t(job.location, lang))}</p>
        <ul>
${items}
        </ul>
      </article>`;
    })
    .filter(Boolean)
    .join("\n\n");
}

function renderProjects(lang, profile) {
  const projects = limit(
    data.projects.filter((project) => matchesProfile(project, profile)),
    data.limits.projects
  );
  if (!projects.length) return "";

  return projects
    .map((project) => {
      const link = project.link
        ? ` <a class="cv-project-link" href="${escapeHtml(project.link)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`
        : "";

      return `      <article class="cv-entry cv-entry--compact">
        <h3>${escapeHtml(t(project.name, lang))}</h3>
        <p>${escapeHtml(t(project.description, lang))}${link}</p>
      </article>`;
    })
    .join("\n\n");
}

function renderEducation(lang, labels) {
  return data.education
    .map((edu) => {
      const details = t(edu.details, lang);
      const detailsHtml = details ? ` · ${escapeHtml(details)}` : "";

      return `      <article class="cv-entry cv-entry--compact">
        <div class="cv-entry-head">
          <h3>${escapeHtml(t(edu.institution, lang))}</h3>
          <p class="cv-dates">${renderPeriod(edu, lang, labels)}</p>
        </div>
        <p class="cv-meta">${escapeHtml(t(edu.degree, lang))}${detailsHtml}</p>
      </article>`;
    })
    .join("\n");
}

function skillRow(label, items) {
  return `      <p class="cv-skill-row"><span class="cv-skill-label">${escapeHtml(label)}:</span> ${items.map(escapeHtml).join(" · ")}</p>`;
}

function renderSkills(lang, profile, labels) {
  const groups = data.skills
    .filter((group) => matchesProfile(group, profile))
    .map((group) => skillRow(t(group.category, lang), t(group.items, lang)));

  groups.push(skillRow(labels.languages, t(data.languages, lang)));
  return groups.join("\n");
}

function fileName(profileConfig, lang) {
  const suffix = profileConfig.suffix || "";
  return lang === "de" ? `cv${suffix}.html` : `cv${suffix}-en.html`;
}

function renderDocument(profileKey, lang) {
  const profileConfig = data.profiles[profileKey];
  const labels = data.labels[lang];
  const portfolioHref = lang === "de" ? "index.html" : "en.html";
  const otherLang = lang === "de" ? "en" : "de";
  const summary = t(profileConfig.summary, lang);
  const projects = renderProjects(lang, profileKey);

  const projectSection = projects
    ? `

    <section class="cv-section cv-section--projects" aria-labelledby="projects-heading">
      <h2 id="projects-heading">${escapeHtml(labels.projects)}</h2>

${projects}
    </section>`
    : "";

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(summary)}" />
  <meta name="author" content="${escapeHtml(data.name)}" />
  <meta name="robots" content="noindex" />
  <title>${escapeHtml(labels.documentTitle)}</title>
  <link rel="icon" href="favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="cv-styles.css" />
</head>
<body>
  <a class="skip-link" href="#cv-main">${escapeHtml(labels.skipLink)}</a>

  <div class="cv-toolbar no-print">
    <a href="${portfolioHref}">${escapeHtml(labels.backToPortfolio)}</a>
    <a href="${fileName(profileConfig, otherLang)}">${escapeHtml(labels.langSwitch)}</a>
    <button type="button" class="cv-print-btn" onclick="window.print()">${escapeHtml(labels.printButton)}</button>
  </div>

  <main id="cv-main" class="cv-page">
    <header class="cv-header">
      <div class="cv-header-top">
        <h1>${escapeHtml(data.name)}</h1>
        <p class="cv-availability">${escapeHtml(t(data.availability, lang))}</p>
      </div>
      <p class="cv-headline">${escapeHtml(t(profileConfig.headline, lang))}</p>
      <ul class="cv-contact">
        <li><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></li>
        <li><a href="tel:${escapeHtml(data.phoneHref)}">${escapeHtml(data.phone)}</a></li>
        <li>${escapeHtml(t(data.location, lang))}</li>
        <li><a href="${escapeHtml(data.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(websiteLabel(data.website))}</a></li>
      </ul>
    </header>

    <section class="cv-section cv-section--profile" aria-labelledby="summary-heading">
      <h2 id="summary-heading">${escapeHtml(labels.summary)}</h2>
      <p>${escapeHtml(summary)}</p>
    </section>

    <section class="cv-section cv-section--experience" aria-labelledby="experience-heading">
      <h2 id="experience-heading">${escapeHtml(labels.experience)}</h2>

${renderExperience(lang, profileKey, labels)}
    </section>${projectSection}

    <section class="cv-section cv-section--education" aria-labelledby="education-heading">
      <h2 id="education-heading">${escapeHtml(labels.education)}</h2>

${renderEducation(lang, labels)}
    </section>

    <section class="cv-section cv-section--skills" aria-labelledby="skills-heading">
      <h2 id="skills-heading">${escapeHtml(labels.skills)}</h2>
${renderSkills(lang, profileKey, labels)}
    </section>
  </main>
</body>
</html>
`;
}

function parseProfiles(argv) {
  if (argv.includes("--all")) return Object.keys(data.profiles);

  const requested = argv.find((arg) => arg.startsWith("--profile="));
  if (!requested) return ["full"];

  const key = requested.split("=")[1];
  if (!data.profiles[key]) {
    const available = Object.keys(data.profiles).join(", ");
    throw new Error(`Unknown profile "${key}". Available profiles: ${available}`);
  }
  return [key];
}

const profiles = parseProfiles(process.argv.slice(2));

for (const profileKey of profiles) {
  for (const lang of LANGS) {
    const target = fileName(data.profiles[profileKey], lang);
    fs.writeFileSync(path.join(ROOT, target), renderDocument(profileKey, lang), "utf8");
    console.log(`Wrote ${target} (profile: ${profileKey})`);
  }
}
