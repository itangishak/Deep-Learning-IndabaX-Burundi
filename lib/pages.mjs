import { layout } from "./layout.mjs";
import {
  esc, escUrl, each, t, localePath, mailto, formatDateRange, formatDay, isUpcoming,
} from "./html.mjs";

/* ------------------------------------------------------------------ *
 * Shared pieces
 * ------------------------------------------------------------------ */

const personCard = (p, lang, idx, prefix) => {
  const bio = t(p.bio, lang);
  const id = `${prefix}-${idx}`;
  const figure = `
    <img src="${escUrl(p.photo)}" alt="${esc(p.name)}" loading="lazy" decoding="async" width="320" height="400" />
    <h3>${esc(p.name)}</h3>
    <p>${esc(t(p.role, lang))}</p>`;

  if (!bio) return `<li class="person">${figure}</li>`;

  return `<li class="person">
    <button type="button" class="person-open" aria-haspopup="dialog" data-dialog="${esc(id)}">
      ${figure}
    </button>
    <dialog id="${esc(id)}" class="bio">
      <form method="dialog"><button class="bio-close" aria-label="Close">&times;</button></form>
      <div class="bio-body">
        <img src="${escUrl(p.photo)}" alt="" loading="lazy" decoding="async" width="160" height="200" />
        <div>
          <h3>${esc(p.name)}</h3>
          <p class="bio-role">${esc(t(p.role, lang))}</p>
          <p>${esc(bio)}</p>
        </div>
      </div>
    </dialog>
  </li>`;
};

const peopleSection = (id, heading, people, lang, prefix, emptyText) => {
  if (!people?.length) {
    return emptyText
      ? `<section id="${esc(id)}" class="section"><h2>${esc(heading)}</h2><p class="lede">${esc(emptyText)}</p></section>`
      : "";
  }
  return `<section id="${esc(id)}" class="section">
  <h2>${esc(heading)}</h2>
  <ul class="people">${each(people, (p, i) => personCard(p, lang, i, prefix))}</ul>
</section>`;
};

const sponsorsSection = (heading, sponsors, lang) => {
  if (!sponsors?.length) return "";
  return `<section id="sponsors" class="section">
  <h2>${esc(heading)}</h2>
  <ul class="sponsors">${each(sponsors, (s) => `
    <li>${s.logo
      ? `<img src="${escUrl(s.logo)}" alt="${esc(s.name)}" loading="lazy" decoding="async" />`
      : `<b class="sponsor-wordmark">${esc(s.name)}</b>`}
      <span>${esc(s.name)}</span></li>`)}</ul>
</section>`;
};

const gallerySection = (heading, images) => {
  if (!images?.length) return "";
  return `<section class="section gallery-section">
  <h2>${esc(heading)}</h2>
  <ul class="gallery" tabindex="0">${each(images, (src) => `
    <li><img src="${escUrl(src)}" alt="" loading="lazy" decoding="async" /></li>`)}</ul>
</section>`;
};


const documentsSection = (edition, lang) => {
  if (!edition.documents?.length) return "";
  return `<section class="section documents-section">
  <ul class="documents">${each(edition.documents, (d) => `
    <li><a href="${escUrl(d.file)}" download>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>
      </svg>
      ${esc(t(d.label, lang))}
    </a></li>`)}</ul>
</section>`;
};

/* ------------------------------------------------------------------ *
 * Organisation home
 * ------------------------------------------------------------------ */

export function orgHome({ site, i18n, lang, editions }) {
  const o = i18n.org;
  const path = localePath("/", lang, site.defaultLocale);
  const altPath = localePath("/", lang === "en" ? "fr" : "en", site.defaultLocale);
  const next = editions.find((e) => isUpcoming(e)) || editions[0];
  const nextHref = next ? editionHref(next, lang, site) : localePath("/events/", lang, site.defaultLocale);

  const involvedCtas = [
    nextHref,
    mailto(site.email, lang === "fr" ? "Proposition d'intervention — IndabaX Burundi" : "Talk proposal — IndabaX Burundi"),
    mailto(site.email, lang === "fr" ? "Demande de sponsoring — IndabaX Burundi" : "Sponsorship enquiry — IndabaX Burundi"),
    mailto(site.email, lang === "fr" ? "Bénévolat — IndabaX Burundi" : "Volunteering — IndabaX Burundi"),
  ];

  const body = `
<section class="hero org-hero">
  <p class="kicker">${esc(o.kicker)}</p>
  <h1>${esc(o.title)}</h1>
  <p class="hero-lede">${esc(o.lede)}</p>
  <p class="hero-actions">
    <a class="btn btn-primary" href="${esc(nextHref)}">${esc(o.primaryCta)}</a>
    <a class="btn btn-quiet" href="#about">${esc(o.secondaryCta)}</a>
  </p>
</section>

<section id="about" class="section">
  <h2>${esc(o.missionTitle)}</h2>
  <p class="lede">${esc(o.missionLede)}</p>
  <ul class="cards">${each(o.mission, (m) => `
    <li class="card"><h3>${esc(m.title)}</h3><p>${esc(m.body)}</p></li>`)}</ul>
</section>

<section id="editions" class="section">
  <h2>${esc(o.editionsTitle)}</h2>
  <p class="lede">${esc(o.editionsLede)}</p>
  <ul class="editions">${each(editions, (e) => editionCard(e, lang, site, i18n))}</ul>
</section>

<section id="involved" class="section">
  <h2>${esc(o.involvedTitle)}</h2>
  <p class="lede">${esc(o.involvedLede)}</p>
  <ul class="cards">${each(o.involved, (item, i) => `
    <li class="card">
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.body)}</p>
      <a class="card-cta" href="${esc(involvedCtas[i])}">${esc(item.cta)}</a>
    </li>`)}</ul>
</section>`;

  return layout({
    site, i18n, lang, path, altPath,
    title: `${site.shortName} — ${o.title}`,
    description: o.lede,
    body,
    extraScripts: DIALOG_SCRIPT,
  });
}

/* ------------------------------------------------------------------ *
 * Editions index and cards
 * ------------------------------------------------------------------ */

export function editionHref(edition, lang, site) {
  if (edition.legacy?.[lang]) return edition.legacy[lang];
  return localePath(`/events/${edition.year}/`, lang, site.defaultLocale);
}

function editionCard(edition, lang, site, i18n) {
  const o = i18n.org;
  const upcoming = isUpcoming(edition);
  const dates = formatDateRange(edition.startDate, edition.endDate, lang)
    || (upcoming ? i18n.event.datesTba : "");
  const href = editionHref(edition, lang, site);
  const isLegacy = Boolean(edition.legacy?.[lang]);
  const cover = edition.heroImage || edition.gallery?.[0] || site.shareImage;

  return `<li class="edition ${upcoming ? "is-upcoming" : "is-past"}">
    <a href="${esc(href)}">
      <span class="edition-cover"><img src="${escUrl(cover)}" alt="" loading="lazy" decoding="async" /></span>
      <span class="edition-tag">${esc(upcoming ? o.editionUpcoming : o.editionPast)}</span>
      <span class="edition-year">${esc(edition.year)}</span>
      ${dates ? `<span class="edition-dates">${esc(dates)}</span>` : ""}
      <span class="edition-more">${esc(isLegacy ? o.editionArchived : o.editionView)}</span>
    </a>
  </li>`;
}

export function editionsIndex({ site, i18n, lang, editions }) {
  const o = i18n.org;
  const path = localePath("/events/", lang, site.defaultLocale);
  const altPath = localePath("/events/", lang === "en" ? "fr" : "en", site.defaultLocale);

  const body = `
<section class="hero page-hero">
  <p class="kicker">${esc(site.shortName)}</p>
  <h1>${esc(o.editionsTitle)}</h1>
  <p class="hero-lede">${esc(o.editionsLede)}</p>
</section>
<section class="section">
  <ul class="editions">${each(editions, (e) => editionCard(e, lang, site, i18n))}</ul>
</section>`;

  return layout({
    site, i18n, lang, path, altPath,
    title: `${o.editionsTitle} — ${site.shortName}`,
    description: o.editionsLede,
    body,
  });
}

/* ------------------------------------------------------------------ *
 * A single edition
 * ------------------------------------------------------------------ */

function agendaSection(edition, i18n, lang) {
  const e = i18n.event;
  if (!edition.agenda?.length) {
    const emptyMessage = isUpcoming(edition)
      ? e.noProgrammeYet
      : e.programmeArchiveUnavailable;
    return `<section id="programme" class="section">
  <h2>${esc(e.programme)}</h2>
  <p class="lede">${esc(emptyMessage)}</p>
</section>`;
  }

  const days = edition.agenda;
  const tabs = each(days, (d, i) => `
    <input type="radio" name="agenda-day" id="day-${i}" class="day-radio"${i === 0 ? " checked" : ""} />
    <label for="day-${i}" class="day-tab">
      <b>${esc(t(d.label, lang))}</b><span>${esc(formatDay(d.date, lang))}</span>
    </label>`);

  const panels = each(days, (d, i) => `
    <div class="day-panel" data-day="${i}">
      <ol class="sessions">${each(d.sessions, (s) => `
        <li class="session${s.break ? " is-break" : ""}">
          <span class="s-time">${esc(s.time)}</span>
          <span class="s-body">
            <span class="s-title">${esc(t(s.title, lang))}</span>
            ${s.speaker ? `<span class="s-speaker">${esc(s.speaker)}</span>` : ""}
          </span>
        </li>`)}</ol>
    </div>`);

  return `<section id="programme" class="section">
  <h2>${esc(e.programme)}</h2>
  <p class="lede">${esc(e.programmeLede)}</p>
  <div class="agenda" style="--day-count:${days.length}">
    ${tabs}
    <div class="day-panels">${panels}</div>
  </div>
</section>`;
}

function venueSection(edition, i18n, lang) {
  const v = edition.venue;
  if (!v?.name) return "";
  const e = i18n.event;
  const where = [v.name, v.campus && `${v.campus} Campus`, v.city].filter(Boolean).join(", ");

  return `<section id="venue" class="section venue-section">
  <h2>${esc(e.venue)}</h2>
  <div class="venue">
    <div class="venue-info">
      <p class="venue-name">${esc(where)}</p>
      ${v.mapLink ? `<a class="btn btn-quiet" href="${esc(v.mapLink)}" target="_blank" rel="noopener noreferrer">${esc(e.getDirections)}</a>` : ""}
    </div>
    ${v.mapEmbed ? `<div class="venue-map"><iframe src="${esc(v.mapEmbed)}" title="${esc(where)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>` : ""}
  </div>
</section>`;
}

function statsSection(edition, lang) {
  if (!edition.stats?.length) return "";
  return `<section class="section stats-section">
  <ul class="stats">${each(edition.stats, (s) => `
    <li><b>${esc(s.value)}</b><span>${esc(t(s.label, lang))}</span></li>`)}</ul>
</section>`;
}

export function eventPage({ site, i18n, lang, edition }) {
  const e = i18n.event;
  const path = localePath(`/events/${edition.year}/`, lang, site.defaultLocale);
  const altPath = localePath(`/events/${edition.year}/`, lang === "en" ? "fr" : "en", site.defaultLocale);
  const upcoming = isUpcoming(edition);
  const dates = formatDateRange(edition.startDate, edition.endDate, lang);
  const v = edition.venue || {};
  const where = [v.name, v.campus && `${v.campus} Campus`, v.city].filter(Boolean).join(", ");
  const cover = edition.heroImage || edition.gallery?.[0];

  // The countdown only exists when there is a real future date to count to.
  const countdownTarget = upcoming && edition.startDate ? `${edition.startDate}T08:00:00Z` : null;
  const countdown = countdownTarget
    ? `<div class="countdown" data-target="${esc(countdownTarget)}" aria-live="off">
        ${["Days", "Hours", "Minutes", "Seconds"].map((u) => `
        <div><b data-unit="${u.toLowerCase()}">--</b><span>${esc(e[`countdown${u}`])}</span></div>`).join("")}
      </div>`
    : "";

  let cta;
  if (!upcoming) cta = `<p class="concluded">${esc(e.concluded)}</p>`;
  else if (edition.applyUrl)
    cta = `<p class="hero-actions"><a class="btn btn-primary" href="${esc(edition.applyUrl)}" target="_blank" rel="noopener noreferrer">${esc(e.apply)}</a></p>`;
  else
    cta = `<p class="hero-actions"><span class="btn btn-disabled" aria-disabled="true">${esc(e.applySoon)}</span></p>`;

  const body = `
<section class="hero event-hero${cover ? " has-cover" : ""}">
  <div class="event-hero-copy">
    <p class="kicker"><a href="${esc(localePath("/events/", lang, site.defaultLocale))}">${esc(e.backToEditions)}</a></p>
    <h1>${esc(t(edition.title, lang))}</h1>
    <p class="hero-meta">
      ${dates || upcoming ? `<span>${esc(dates || e.datesTba)}</span>` : ""}
      ${where ? `<span>${esc(where)}</span>` : ""}
    </p>
    <p class="hero-lede">${esc(t(edition.tagline, lang))}</p>
    ${countdown}
    ${cta}
  </div>
  ${cover
    ? `<figure class="event-hero-visual"><img src="${escUrl(cover)}" alt="" decoding="async" width="900" height="600" /></figure>`
    : `<div class="event-hero-visual event-year-mark" aria-hidden="true"><span>IndabaX</span><b>${esc(edition.year)}</b><i>Burundi</i></div>`}
</section>

${t(edition.intro, lang) ? `<section class="section intro"><p>${esc(t(edition.intro, lang))}</p></section>` : ""}
${documentsSection(edition, lang)}
${statsSection(edition, lang)}
${peopleSection("speakers", e.speakers, edition.speakers, lang, `sp-${edition.year}`, upcoming ? e.noSpeakersYet : "")}
${agendaSection(edition, i18n, lang)}
${peopleSection("team", e.team, edition.team, lang, `tm-${edition.year}`, "")}
${sponsorsSection(e.sponsors, edition.sponsors, lang)}
${venueSection(edition, i18n, lang)}
${gallerySection(e.gallery, edition.gallery)}`;

  return layout({
    site, i18n, lang, path, altPath,
    title: dates || upcoming ? `${t(edition.title, lang)} — ${dates || e.datesTba}` : t(edition.title, lang),
    description: t(edition.tagline, lang),
    shareImage: edition.gallery?.[0],
    body,
    extraScripts: DIALOG_SCRIPT + (countdownTarget ? COUNTDOWN_SCRIPT : ""),
  });
}

/* ------------------------------------------------------------------ *
 * The only two scripts on the site
 * ------------------------------------------------------------------ */

const DIALOG_SCRIPT = `
<script>
document.querySelectorAll("[data-dialog]").forEach(function (btn) {
  var dlg = document.getElementById(btn.dataset.dialog);
  if (!dlg) return;
  btn.addEventListener("click", function () { dlg.showModal(); });
  dlg.addEventListener("click", function (ev) { if (ev.target === dlg) dlg.close(); });
});
</script>`;

const COUNTDOWN_SCRIPT = `
<script>
document.querySelectorAll(".countdown").forEach(function (el) {
  var target = new Date(el.dataset.target).getTime();
  var units = {
    days: el.querySelector('[data-unit="days"]'),
    hours: el.querySelector('[data-unit="hours"]'),
    minutes: el.querySelector('[data-unit="minutes"]'),
    seconds: el.querySelector('[data-unit="seconds"]')
  };
  var pad = function (n) { return String(n).padStart(2, "0"); };
  function tick() {
    var left = target - Date.now();
    if (left <= 0) { el.classList.add("is-done"); clearInterval(timer); left = 0; }
    var s = Math.floor(left / 1000);
    units.days.textContent = Math.floor(s / 86400);
    units.hours.textContent = pad(Math.floor(s / 3600) % 24);
    units.minutes.textContent = pad(Math.floor(s / 60) % 60);
    units.seconds.textContent = pad(s % 60);
  }
  tick();
  var timer = setInterval(tick, 1000);
});
</script>`;
