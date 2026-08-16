#!/usr/bin/env python3
"""
Resize and re-encode photographs for the web.

    python3 scripts/optimise-images.py img-2025 src/Images/2025 --prefix indabax-2025

Reads every image in the source directory, honours the camera's orientation flag,
resizes so the long edge is at most --max pixels, writes WebP (and a JPEG fallback),
and gives every file a clean lowercase-hyphenated name.

Keep the untouched originals somewhere outside the repository — a camera JPEG is
5-8 MB and has no business in git.

Requires Pillow:  pip install --user Pillow
"""

import argparse
import re
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow is not installed.  pip install --user Pillow")

EXTS = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".heic"}


def slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return re.sub(r"-+", "-", s)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source", type=Path, help="directory holding the original photographs")
    ap.add_argument("dest", type=Path, help="directory to write optimised images into")
    ap.add_argument("--max", type=int, default=1800, help="longest edge in pixels (default 1800)")
    ap.add_argument("--quality", type=int, default=82, help="WebP quality (default 82)")
    ap.add_argument("--prefix", default="", help="rename files to <prefix>-01, <prefix>-02, …")
    ap.add_argument("--jpeg", action="store_true", help="also write a .jpg fallback")
    args = ap.parse_args()

    if not args.source.is_dir():
        sys.exit(f"not a directory: {args.source}")
    args.dest.mkdir(parents=True, exist_ok=True)

    files = sorted(f for f in args.source.iterdir() if f.suffix.lower() in EXTS)
    if not files:
        sys.exit(f"no images found in {args.source}")

    before = after = 0
    written = []

    for i, f in enumerate(files, 1):
        try:
            im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
        except Exception as exc:                      # noqa: BLE001 - report and continue
            print(f"  ! skipped {f.name}: {exc}")
            continue

        src_w, src_h = im.size
        im.thumbnail((args.max, args.max), Image.LANCZOS)

        stem = f"{args.prefix}-{i:02d}" if args.prefix else slugify(f.stem)
        out = args.dest / f"{stem}.webp"
        im.save(out, quality=args.quality, method=6)

        before += f.stat().st_size
        after += out.stat().st_size
        written.append(out)
        line = f"  {f.name}  {src_w}x{src_h} -> {im.size[0]}x{im.size[1]}  {f.stat().st_size/1e6:.1f}MB -> {out.stat().st_size/1024:.0f}KB"

        if args.jpeg:
            jpg = args.dest / f"{stem}.jpg"
            im.save(jpg, quality=80, optimize=True, progressive=True)
            after += jpg.stat().st_size
            line += f"  (+{jpg.stat().st_size/1024:.0f}KB jpg)"

        print(line)

    print(f"\n{len(written)} images: {before/1e6:.1f} MB -> {after/1e6:.1f} MB "
          f"({before/after:.0f}x smaller)" if after else "")
    print("\nPaths for the edition's gallery array:")
    for p in written:
        print(f'  "/{p.as_posix()}",')
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
