# Deep Learning IndabaX Burundi — website

The organisation site plus one page per edition, in English and French, generated
from data files into static HTML.

**Live:** https://indabaxburundi.bi

## Running it

```bash
node build.mjs          # writes dist/
node build.mjs --serve   # builds, then serves on http://localhost:4321
```

There are **no dependencies**. `build.mjs` uses only the Node standard library, so
`npm install` is never needed and the site can still be rebuilt years from now.
Node 18 or newer.

## How it is laid out

```
data/
  site.json              domain, contact details, social links
  i18n.json              every UI string, in "en" and "fr"
  editions/2023.json     one file per edition — this is where the content lives
  editions/2024.json
  editions/2025.json
  editions/2026.json
lib/
  html.mjs               escaping, date formatting, small helpers
  layout.mjs             the HTML shell: <head>, header, footer
  pages.mjs              the three page types
src/                     assets served as-is (images, CSS, docs)
en-2024/ fr-2024/        original 2024 source pages, kept for reference
build.mjs                the generator
dist/                    build output — generated, not committed
```

### Pages produced

| URL | What it is |
|---|---|
| `/` and `/fr/` | Organisation home |
| `/events/` and `/fr/events/` | All editions |
| `/events/<year>/` and `/fr/events/<year>/` | One edition |
| `/en-2025/`, `/fr-2025/` | Redirect stubs to the new URLs |

## Common jobs

### Add next year's edition

Copy an existing file in `data/editions/`, rename it to the new year, and edit it.
That is the whole job — the pages, both languages, the editions index, the
sitemap and the navigation all update from it.

```jsonc
{
  "year": 2027,
  "status": "upcoming",
  "startDate": "2027-07-15",     // null until confirmed — the page then says
  "endDate": "2027-07-16",       // "Dates to be announced" and hides the countdown
  "applyUrl": "https://…",       // null until applications open
  "heroImage": "/src/Images/…",  // the large picture beside the title;
                                 // omit it and the first gallery photo is used
  "venue": { "name": "...", "campus": "...", "city": "Bujumbura",
             "mapEmbed": "...", "mapLink": "..." },
  "title":   { "en": "...", "fr": "..." },
  "tagline": { "en": "...", "fr": "..." },
  "speakers": [ { "name": "...", "photo": "/src/Images/...",
                  "role": { "en": "...", "fr": "..." },
                  "bio":  { "en": "..." } } ],
  "agenda": [ { "date": "2027-07-15", "label": { "en": "Day 1", "fr": "Jour 1" },
                "sessions": [ { "time": "09:00 - 09:45",
                                "title": { "en": "...", "fr": "..." },
                                "speaker": "...",
                                "break": false } ] } ]
}
```

Anything you leave empty is simply not rendered — an edition with no speakers
yet shows "Speakers will be announced here as they are confirmed."

A speaker with a `bio` becomes clickable and opens a dialog. Without one, the
card is just a portrait and a name.

### Change wording that is not edition-specific

`data/i18n.json`. Every visible string on the organisation pages lives there,
in both languages, so the two can't drift apart.

### Add photographs

Put them in `src/Images/` and list them in the edition's `gallery` array.

**Resize before committing.** Portraits want about 800px on the long edge,
gallery photographs about 1800px. A camera JPEG is typically 5–8 MB and will
make the site unusable on a Burundian mobile connection:

```bash
python3 -c "
from PIL import Image, ImageOps
im = ImageOps.exif_transpose(Image.open('photo.JPG')).convert('RGB')
im.thumbnail((1800, 1800), Image.LANCZOS)
im.save('src/Images/photo.webp', quality=82, method=6)"
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs
`node build.mjs` and publishes `dist/`.

**One-time setup:** in the repository settings, under *Pages*, set
**Source** to **GitHub Actions**. It is currently set to "Deploy from a branch",
which serves the repository root instead of the build output.

## Known gaps

- **The 2024 programme is not yet structured as data.** The edition now uses the
  same generated design as every other year; its original hand-written files
  remain in the repository as the source for a future programme migration.
- **The 2023 speaker list and programme are not in the archive.** Its supplied
  event report confirms the dates, host venue and attendance, which are already
  included on the page.
- **2026 has no dates yet.** Fill in `startDate` and `endDate` and the countdown
  turns itself on.
- **The 2025 venue is contradictory** in the source material — the old page said
  Mutanga in the hero and Kamenge everywhere else. The data file follows Mutanga;
  the map embed still points at Kamenge. Confirm which is right.
- **Sponsorship enquiries go to email.** The old form posted applicant details to
  a third party's endpoint and was removed. Replace the `mailto:` with a Google
  Form you own when you have one.
