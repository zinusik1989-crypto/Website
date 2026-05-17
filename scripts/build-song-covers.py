# -*- coding: utf-8 -*-
"""Copy MP3 from Песни/ and generate polar-style cover WebP."""
from __future__ import annotations

import math
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "Песни"
OUT_DIR = ROOT / "songs"
COVERS = OUT_DIR / "covers"

TRACKS = [
    {
        "match": "Королева",
        "slug": "koroleva-arktiki",
        "title": "Королева Арктики",
        "tag": "Арктика • на заказ",
        "hue": (34, 211, 238),
    },
    {
        "match": "рождения",
        "slug": "den-rozhdeniya-irina",
        "title": "С днём рождения, Ирина",
        "tag": "Поздравление • на заказ",
        "hue": (52, 211, 153),
    },
    {
        "match": "шаман",
        "slug": "severnaya-shamanka",
        "title": "Северная шаманка",
        "tag": "Этно • север • на заказ",
        "hue": (167, 139, 250),
    },
    {
        "match": "Говорили",
        "slug": "govorili-tishe",
        "title": "Говорили: тише…",
        "tag": "Лирика • на заказ",
        "hue": (94, 234, 212),
    },
    {
        "match": "Дембель",
        "slug": "demebelskiy-vokzal",
        "title": "Дембельский вокзал",
        "tag": "Армия • на заказ",
        "hue": (56, 189, 248),
    },
]

W, H = 800, 500


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if bold:
        candidates += [
            "C:/Windows/Fonts/segoeuib.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
        ]
    else:
        candidates += [
            "C:/Windows/Fonts/segoeui.ttf",
            "C:/Windows/Fonts/arial.ttf",
        ]
    for path in candidates:
        p = Path(path)
        if p.exists():
            return ImageFont.truetype(str(p), size=size)
    return ImageFont.load_default()


def draw_cover(title: str, tag: str, hue: tuple[int, int, int]) -> Image.Image:
    img = Image.new("RGB", (W, H), (3, 10, 26))
    draw = ImageDraw.Draw(img)

    for i in range(3):
        cx = int(W * (0.2 + i * 0.28))
        cy = int(H * (0.35 + (i % 2) * 0.15))
        r = 220 + i * 40
        color = (
            min(255, int(hue[0] * 0.35)),
            min(255, int(hue[1] * 0.35)),
            min(255, int(hue[2] * 0.35)),
        )
        aurora = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ad = ImageDraw.Draw(aurora)
        ad.ellipse((cx - r, cy - r // 2, cx + r, cy + r // 2), fill=(*color, 90))
        aurora = aurora.filter(ImageFilter.GaussianBlur(48))
        img = Image.alpha_composite(img.convert("RGBA"), aurora).convert("RGB")

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for y in range(H):
        t = y / H
        a = int(40 + 140 * (t**1.4))
        od.line([(0, y), (W, y)], fill=(2, 8, 22, a))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")

    title_font = load_font(42, bold=True)
    tag_font = load_font(18, bold=False)
    note_font = load_font(56, bold=True)

    draw.text((48, H - 130), "♪", fill=(hue[0], hue[1], hue[2]), font=note_font)
    draw.text((48, 72), title, fill=(247, 251, 255), font=title_font)
    draw.text((48, 132), tag.upper(), fill=(hue[0], hue[1], hue[2]), font=tag_font)

    border = ImageDraw.Draw(img)
    border.rounded_rectangle((8, 8, W - 9, H - 9), radius=22, outline=(hue[0], hue[1], hue[2]), width=2)
    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    COVERS.mkdir(parents=True, exist_ok=True)

    mp3_files = sorted(SRC_DIR.glob("*.mp3"), key=lambda p: p.name.lower())
    if len(mp3_files) < len(TRACKS):
        raise SystemExit(f"Expected {len(TRACKS)} mp3 files in {SRC_DIR}, found {len(mp3_files)}")

    used: set[Path] = set()
    for track in TRACKS:
        src = next(
            (p for p in mp3_files if p not in used and track["match"].lower() in p.stem.lower()),
            None,
        )
        if src is None:
            src = next(p for p in mp3_files if p not in used)
        used.add(src)

        dest_mp3 = OUT_DIR / f"{track['slug']}.mp3"
        shutil.copy2(src, dest_mp3)

        cover = draw_cover(track["title"], track["tag"], track["hue"])
        cover_path = COVERS / f"{track['slug']}.webp"
        cover.save(cover_path, "WEBP", quality=86, method=6)
        print(f"OK {track['slug']} <- {src.name}")


if __name__ == "__main__":
    main()
