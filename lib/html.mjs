// Small helpers shared by every template. No dependencies.

/** Escape text destined for HTML body or a double-quoted attribute. */
export const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Escape a value going inside a URL path or query component. */
export const escUrl = (v) => encodeURI(String(v ?? "")).replace(/"/g, "%22");

/** Join class names, dropping falsy ones. */
export const cls = (...names) => names.filter(Boolean).join(" ");

/** Render a list, dropping entries that render to nothing. */
export const each = (items, fn) => (items ?? []).map(fn).filter(Boolean).join("\n");

/** Pick the value for a locale from a {en, fr} object, falling back to English. */
export const t = (value, lang) => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value.en ?? "";
};

/** Prefix a path with the locale segment: ("/events/", "fr") -> "/fr/events/" */
export const localePath = (path, lang, defaultLocale = "en") =>
  lang === defaultLocale ? path : `/${lang}${path}`;

/**
 * Format an event's date range for display.
 * Same month  -> "11–12 December 2025"
 * Cross month -> "29 July – 2 August 2024"
 */
export function formatDateRange(startISO, endISO, lang) {
  if (!startISO) return null;
  const start = new Date(`${startISO}T12:00:00Z`);
  const end = endISO ? new Date(`${endISO}T12:00:00Z`) : start;
  const loc = lang === "fr" ? "fr-FR" : "en-GB";
  const month = (d) => d.toLocaleDateString(loc, { month: "long", timeZone: "UTC" });
  const day = (d) => d.toLocaleDateString(loc, { day: "numeric", timeZone: "UTC" });
  const year = end.getUTCFullYear();

  if (start.getTime() === end.getTime()) return `${day(start)} ${month(start)} ${year}`;
  if (start.getUTCMonth() === end.getUTCMonth() && start.getUTCFullYear() === end.getUTCFullYear())
    return `${day(start)}–${day(end)} ${month(end)} ${year}`;
  return `${day(start)} ${month(start)} – ${day(end)} ${month(end)} ${year}`;
}

/** A single day, spelled out — used for agenda tab labels. */
export function formatDay(iso, lang) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

/** Is this edition still ahead of us? */
export const isUpcoming = (edition, now = new Date()) => {
  const end = edition.endDate || edition.startDate;
  if (!end) return edition.status === "upcoming";
  return new Date(`${end}T23:59:59Z`) >= now;
};

/** Build a mailto: link with a pre-filled subject. */
export const mailto = (address, subject) =>
  `mailto:${address}?subject=${encodeURIComponent(subject)}`;
