import { esc, escUrl, each, localePath, mailto } from "./html.mjs";

const SOCIAL_ICONS = {
  facebook: '<path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5Z"/>',
  x: '<path d="M13.7 10.6 20.4 3h-1.6l-5.8 6.6L8.36 3H3l7.03 10.02L3 21h1.59l6.14-6.99L15.64 21H21l-7.3-10.4Zm-2.17 2.47-.71-1L5.16 4.2h2.44l4.57 6.53.71 1 5.94 8.49h-2.44l-4.85-6.94Z"/>',
  linkedin: '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.65h.05c.53-1 1.83-2.05 3.76-2.05 4.02 0 4.76 2.65 4.76 6.1V21h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21h-4V9Z"/>',
  youtube: '<path d="M21.58 7.19a2.5 2.5 0 0 0-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42a2.5 2.5 0 0 0-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81a2.5 2.5 0 0 0 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42a2.5 2.5 0 0 0 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81ZM10 15.5v-7l6 3.5-6 3.5Z"/>',
};

const socialLinks = (site, label) => {
  const items = each(Object.entries(site.social || {}), ([key, url]) => {
    if (!url || !SOCIAL_ICONS[key]) return "";
    const name = key === "x" ? "X" : key[0].toUpperCase() + key.slice(1);
    return `<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(name)}">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">${SOCIAL_ICONS[key]}</svg>
    </a></li>`;
  });
  return items ? `<nav class="social" aria-label="${esc(label)}"><ul>${items}</ul></nav>` : "";
};

function header({ site, i18n, lang, altPath, currentPath }) {
  const n = i18n.nav;
  const home = localePath("/", lang, site.defaultLocale);
  const editions = localePath("/events/", lang, site.defaultLocale);
  const here = (p) => (currentPath === p ? ' aria-current="page"' : "");

  return `<header class="site-header">
  <a class="brand" href="${esc(home)}">
    <img src="${escUrl(site.logo)}" alt="${esc(site.shortName)}" width="44" height="44" />
    <span><b>IndabaX</b> Burundi</span>
  </a>
  <nav class="site-nav" aria-label="${esc(n.home)}">
    <ul>
      <li><a href="${esc(home)}#about"${here(`${home}#about`)}>${esc(n.about)}</a></li>
      <li><a href="${esc(editions)}"${here(editions)}>${esc(n.editions)}</a></li>
      <li><a href="${esc(home)}#involved">${esc(n.getInvolved)}</a></li>
      <li><a href="${esc(home)}#contact">${esc(n.contact)}</a></li>
    </ul>
  </nav>
  <a class="lang-switch" href="${esc(altPath)}" hreflang="${lang === "en" ? "fr" : "en"}"
     lang="${lang === "en" ? "fr" : "en"}" aria-label="${esc(i18n.switchLabel)}">
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="currentColor">
      <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286zm1.634-.736L5.5 3.956h-.049l-.679 2.022z"/>
      <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm7.138 9.995q.289.451.63.846c-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6 6 0 0 1-.415-.492 2 2 0 0 1-.94.31"/>
    </svg>
    <span>${esc(i18n.otherLocaleName)}</span>
  </a>
</header>`;
}

function footer({ site, i18n, lang }) {
  const a = site.address;
  return `<footer class="site-footer" id="contact">
  <div class="footer-inner">
    <div class="footer-block">
      <h2>${esc(i18n.org.contactTitle)}</h2>
      <p class="addr">${esc(site.name)}<br />${esc(a.street)}<br />${esc(a.quarter)}<br />${esc(a.city)}, ${esc(a.country)}</p>
      <p><a class="mail" href="${esc(mailto(site.email, `${site.shortName} — enquiry`))}">${esc(site.email)}</a></p>
    </div>
    <div class="footer-block">
      <h2>${esc(i18n.org.followTitle)}</h2>
      ${socialLinks(site, i18n.org.followTitle)}
    </div>
  </div>
  <div class="footer-base">
    <p>© ${new Date().getFullYear()} ${esc(i18n.footer.rights)}</p>
    <p>${esc(i18n.footer.builtBy)}</p>
  </div>
</footer>`;
}

/**
 * The one HTML shell every page uses.
 * `path` is the absolute path this page will be served at, e.g. "/fr/events/2026/".
 */
export function layout({
  site, i18n, lang, path, altPath, title, description,
  shareImage, body, bodyClass = "", extraHead = "", extraScripts = "",
}) {
  const url = site.domain + path;
  const altUrl = site.domain + altPath;
  const image = escUrl(site.domain + (shareImage || site.shareImage));
  const otherLang = lang === "en" ? "fr" : "en";

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${esc(url)}" />
<link rel="alternate" hreflang="${lang}" href="${esc(url)}" />
<link rel="alternate" hreflang="${otherLang}" href="${esc(altUrl)}" />
<link rel="alternate" hreflang="x-default" href="${esc(site.domain)}/" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${esc(site.shortName)}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:image" content="${image}" />
<meta property="og:locale" content="${esc(i18n.locale)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${image}" />
<meta name="theme-color" content="#0E4038" />
<link rel="icon" type="image/webp" href="${escUrl(site.logo)}" />
<link rel="stylesheet" href="/src/css/site.css" />
${extraHead}
</head>
<body${bodyClass ? ` class="${esc(bodyClass)}"` : ""}>
<a class="skip-link" href="#main">${esc(i18n.skipToContent)}</a>
${header({ site, i18n, lang, altPath, currentPath: path })}
<main id="main">
${body}
</main>
${footer({ site, i18n, lang })}
${extraScripts}
</body>
</html>
`;
}
