#!/usr/bin/env node
/**
 * Static site generator for Deep Learning IndabaX Burundi.
 *
 * Deliberately dependency-free: `node build.mjs` is the whole toolchain, so the
 * site can still be rebuilt years from now without resolving a package tree.
 *
 *   npm run build     -> writes dist/
 *   npm run dev       -> builds, then serves dist/ on http://localhost:4321
 */

import { readFile, writeFile, mkdir, rm, cp, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { orgHome, editionsIndex, eventPage, editionHref } from "./lib/pages.mjs";
import { isUpcoming, localePath, esc } from "./lib/html.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "dist");

/** Directories and files copied into dist/ verbatim. */
const PASSTHROUGH = ["src", "CNAME", "en-2024", "fr-2024"];

/** Old URLs that must keep working, and where they now point. */
const REDIRECTS = {
  "en-2025": "/events/2025/",
  "fr-2025": "/fr/events/2025/",
};

const readJson = async (p) => JSON.parse(await readFile(join(ROOT, p), "utf8"));

async function loadEditions() {
  const dir = join(ROOT, "data", "editions");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  const editions = await Promise.all(files.map((f) => readJson(join("data", "editions", f))));
  // Newest first: upcoming editions lead, then past editions by year descending.
  return editions.sort((a, b) => {
    const ua = isUpcoming(a), ub = isUpcoming(b);
    if (ua !== ub) return ua ? -1 : 1;
    return b.year - a.year;
  });
}

async function emit(path, html) {
  const file = path.endsWith("/") ? join(OUT, path, "index.html") : join(OUT, path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html, "utf8");
  return path;
}

/** A crawlable redirect stub: real link for humans and bots, instant hop for browsers. */
const redirectStub = (to, lang = "en") => `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Moved — IndabaX Burundi</title>
<link rel="canonical" href="${esc(to)}" />
<meta name="robots" content="noindex, follow" />
<meta http-equiv="refresh" content="0; url=${esc(to)}" />
</head>
<body>
<p>This page has moved to <a href="${esc(to)}">${esc(to)}</a>.</p>
<script>location.replace(${JSON.stringify(to)});</script>
</body>
</html>
`;

function sitemap(site, paths) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = paths.map((p) => `  <url>
    <loc>${esc(site.domain + p)}</loc>
    <lastmod>${today}</lastmod>
  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

async function build() {
  const started = Date.now();
  const site = await readJson("data/site.json");
  const i18nAll = await readJson("data/i18n.json");
  const editions = await loadEditions();

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  // Copy assets and the archive pages that are still served as-is.
  for (const entry of PASSTHROUGH) {
    if (existsSync(join(ROOT, entry))) {
      await cp(join(ROOT, entry), join(OUT, entry), { recursive: true });
    } else {
      console.warn(`  ! passthrough missing, skipped: ${entry}`);
    }
  }

  const written = [];

  for (const lang of site.locales) {
    const i18n = i18nAll[lang];
    if (!i18n) throw new Error(`data/i18n.json has no "${lang}" block`);

    written.push(await emit(localePath("/", lang, site.defaultLocale),
      orgHome({ site, i18n, lang, editions })));

    written.push(await emit(localePath("/events/", lang, site.defaultLocale),
      editionsIndex({ site, i18n, lang, editions })));

    for (const edition of editions) {
      if (edition.legacy?.[lang]) continue; // still served by its original page
      written.push(await emit(localePath(`/events/${edition.year}/`, lang, site.defaultLocale),
        eventPage({ site, i18n, lang, edition })));
    }
  }

  // Old URLs keep resolving.
  for (const [from, to] of Object.entries(REDIRECTS)) {
    await emit(`/${from}/`, redirectStub(to, from.slice(0, 2)));
  }

  // GitHub Pages: don't run the output through Jekyll.
  await writeFile(join(OUT, ".nojekyll"), "", "utf8");

  await writeFile(join(OUT, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${site.domain}/sitemap.xml\n`, "utf8");

  // Archive pages are real URLs too — list them so they stay indexed.
  const archives = editions.flatMap((e) =>
    site.locales.map((l) => e.legacy?.[l]).filter(Boolean));
  await writeFile(join(OUT, "sitemap.xml"),
    sitemap(site, [...new Set([...written, ...archives])]), "utf8");

  console.log(`Built ${written.length} pages + ${Object.keys(REDIRECTS).length} redirects in ${Date.now() - started}ms`);
  for (const p of written) console.log(`  ${p}`);
  return site;
}

/* ---------------------------------------------------------------- *
 * Optional dev server (node build.mjs --serve)
 * ---------------------------------------------------------------- */

async function serve(port = 4321) {
  const { createServer } = await import("node:http");
  const { stat } = await import("node:fs/promises");
  const { createReadStream } = await import("node:fs");
  const { extname } = await import("node:path");

  const TYPES = {
    ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8", ".json": "application/json",
    ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg", ".webp": "image/webp", ".xml": "application/xml",
    ".pdf": "application/pdf", ".ico": "image/x-icon",
  };

  createServer(async (req, res) => {
    let path = decodeURIComponent(req.url.split("?")[0]);
    let file = join(OUT, path);
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    } catch {
      if (existsSync(file + "/index.html")) file = file + "/index.html";
      else { res.writeHead(404, { "content-type": "text/plain" }); return res.end("404"); }
    }
    if (!existsSync(file)) { res.writeHead(404, { "content-type": "text/plain" }); return res.end("404"); }
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    createReadStream(file).pipe(res);
  }).listen(port, () => console.log(`\n  http://localhost:${port}\n`));
}

await build();
if (process.argv.includes("--serve")) await serve();
