# -*- coding: utf-8 -*-
"""Copy MP3 from Песни/ and export embedded cover art (or themed fallback) to WebP."""
from __future__ import annotations

import io
import math
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps
from mutagen.mp3 import MP3

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
        "theme": "queen",
    },
    {
        "match": "рождения",
        "slug": "den-rozhdeniya-irina",
        "title": "С днём рождения, Ирина",
        "tag": "Поздравление • на заказ",
        "hue": (251, 191, 36),
        "theme": "birthday",
    },
    {
        "match": "шаман",
        "slug": "severnaya-shamanka",
        "title": "Северная шаманка",
        "tag": "Этно • север • на заказ",
        "hue": (167, 139, 250),
        "theme": "shaman",
    },
    {
        "match": "Говорили",
        "slug": "govorili-tishe",
        "title": "Говорили: тише…",
        "tag": "Лирика • на заказ",
        "hue": (148, 163, 184),
        "theme": "quiet",
    },
    {
        "match": "Дембель",
        "slug": "demebelskiy-vokzal",
        "title": "Дембельский вокзал",
        "tag": "Армия • на заказ",
        "hue": (56, 189, 248),
        "theme": "station",
    },
]

W, H = 800, 500


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = (
        ["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf"]
        if bold
        else ["C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf"]
    )
    for path in candidates:
        p = Path(path)
        if p.exists():
            return ImageFont.truetype(str(p), size=size)
    return ImageFont.load_default()


def extract_embedded_cover(mp3_path: Path) -> Image.Image | None:
    audio = MP3(mp3_path)
    if not audio.tags:
        return None
    for _key, frame in audio.tags.items():
        if not str(_key).startswith("APIC"):
            continue
        data = getattr(frame, "data", None)
        if not data:
            continue
        try:
            return Image.open(io.BytesIO(data)).convert("RGB")
        except OSError:
            continue
    return None


def fit_cover(img: Image.Image, width: int = W, height: int = H) -> Image.Image:
    """Center-crop to 16:10 and add subtle bottom vignette for card layout."""
    fitted = ImageOps.fit(
        img.convert("RGB"), (width, height), method=Image.Resampling.LANCZOS, centering=(0.5, 0.45)
    )
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for y in range(height):
        t = y / height
        a = int(12 + 55 * (t**1.5))
        od.line([(0, y), (width, y)], fill=(2, 8, 22, a))
    return Image.alpha_composite(fitted.convert("RGBA"), overlay).convert("RGB")


def _aurora_layer(hue: tuple[int, int, int], w: int, h: int) -> Image.Image:
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ad = ImageDraw.Draw(layer)
    for i in range(3):
        cx = int(w * (0.2 + i * 0.28))
        cy = int(h * (0.35 + (i % 2) * 0.15))
        r = 220 + i * 40
        color = (
            min(255, int(hue[0] * 0.35)),
            min(255, int(hue[1] * 0.35)),
            min(255, int(hue[2] * 0.35)),
        )
        ad.ellipse((cx - r, cy - r // 2, cx + r, cy + r // 2), fill=(*color, 90))
    return layer.filter(ImageFilter.GaussianBlur(48))


def _base_canvas(hue: tuple[int, int, int]) -> Image.Image:
    img = Image.new("RGB", (W, H), (3, 10, 26))
    img = Image.alpha_composite(img.convert("RGBA"), _aurora_layer(hue, W, H)).convert("RGB")
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for y in range(H):
        t = y / H
        a = int(40 + 140 * (t**1.4))
        od.line([(0, y), (W, y)], fill=(2, 8, 22, a))
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def _draw_queen(draw: ImageDraw.ImageDraw, hue: tuple[int, int, int]) -> None:
    cx, cy = W - 200, H // 2 - 20
    for r in (95, 78, 62):
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(12, 32, 58))
    draw.ellipse((cx - 62, cy - 62, cx + 62, cy + 62), fill=(18, 48, 72), outline=hue, width=2)
    pts = [(cx, cy - 95), (cx - 48, cy - 45), (cx - 22, cy - 72), (cx, cy - 48), (cx + 22, cy - 72), (cx + 48, cy - 45)]
    draw.polygon(pts, fill=(247, 251, 255), outline=hue)
    for px in (cx - 36, cx, cx + 36):
        draw.ellipse((px - 6, cy - 88, px + 6, cy - 76), fill=hue)
    draw.polygon([(cx - 28, cy + 10), (cx + 28, cy + 10), (cx + 18, cy + 70), (cx - 18, cy + 70)], fill=(30, 72, 98))
    for i in range(6):
        ang = math.radians(-70 + i * 28)
        sx = cx + int(72 * math.cos(ang))
        sy = cy + int(72 * math.sin(ang))
        draw.line([(cx, cy - 20), (sx, sy)], fill=hue, width=2)


def _draw_birthday(draw: ImageDraw.ImageDraw, hue: tuple[int, int, int]) -> None:
    cx, base = W - 210, H - 90
    draw.rounded_rectangle((cx - 70, base - 55, cx + 70, base), radius=14, fill=(247, 251, 255), outline=hue, width=2)
    for i, col in enumerate([hue, (244, 114, 182), (96, 165, 250)]):
        x = cx - 40 + i * 40
        draw.rectangle((x - 3, base - 78, x + 3, base - 55), fill=col)
        draw.ellipse((x - 7, base - 90, x + 7, base - 76), fill=(255, 220, 120))
    draw.ellipse((cx - 88, base - 162, cx - 42, base - 116), outline=hue, width=2)
    draw.line([(cx - 65, base - 116), (cx - 65, base - 95)], fill=hue, width=2)
    draw.ellipse((cx + 35, base - 155, cx + 95, base - 95), outline=(244, 114, 182), width=2)
    draw.line([(cx + 65, base - 95), (cx + 65, base - 78)], fill=(244, 114, 182), width=2)


def _draw_shaman(draw: ImageDraw.ImageDraw, hue: tuple[int, int, int]) -> None:
    cx, cy = W - 205, H // 2 + 30
    draw.ellipse((cx - 55, cy - 18, cx + 55, cy + 18), fill=(24, 18, 42), outline=hue, width=2)
    draw.ellipse((cx - 48, cy - 12, cx + 48, cy + 12), fill=(38, 28, 58))
    for angle in range(0, 360, 45):
        rad = math.radians(angle)
        x1 = cx + int(44 * math.cos(rad))
        y1 = cy + int(14 * math.sin(rad))
        x2 = cx + int(58 * math.cos(rad))
        y2 = cy + int(18 * math.sin(rad))
        draw.line([(x1, y1), (x2, y2)], fill=hue, width=3)
    draw.polygon([(cx, cy - 120), (cx - 18, cy - 55), (cx + 18, cy - 55)], fill=hue)
    for i in range(5):
        t = i / 4
        y = int(cy - 110 + t * 90)
        draw.arc((cx - 90 + i * 8, y - 20, cx + 90 - i * 8, y + 20), 200, 340, fill=hue, width=2)


def _draw_quiet(draw: ImageDraw.ImageDraw, hue: tuple[int, int, int]) -> None:
    cx, cy = W - 200, 130
    draw.ellipse((cx - 55, cy - 55, cx + 55, cy + 55), fill=(247, 251, 255))
    draw.ellipse((cx - 42, cy - 42, cx + 42, cy + 42), fill=(12, 24, 42))
    for dx in (-18, 10):
        draw.ellipse((cx + dx - 8, cy + 8, cx + dx + 8, cy + 24), fill=(148, 163, 184))
    draw.arc((cx - 22, cy + 18, cx + 22, cy + 42), 10, 170, fill=hue, width=2)
    for i in range(4):
        x = cx + 75 + i * 22
        draw.ellipse((x - 2, cy + 40 + i * 6, x + 18, cy + 52 + i * 6), outline=hue, width=2)


def _draw_station(draw: ImageDraw.ImageDraw, hue: tuple[int, int, int]) -> None:
    base = H - 70
    draw.rectangle((W - 340, base, W - 60, base + 8), fill=hue)
    draw.rectangle((W - 330, base - 95, W - 300, base), fill=(30, 58, 78))
    draw.rectangle((W - 200, base - 70, W - 90, base - 20), fill=(18, 42, 62), outline=hue, width=2)
    draw.polygon([(W - 200, base - 70), (W - 120, base - 95), (W - 90, base - 70)], fill=(40, 88, 118))
    for x in range(W - 325, W - 95, 35):
        draw.line([(x, base - 95), (x, base - 115)], fill=hue, width=2)
        draw.ellipse((x - 4, base - 122, x + 4, base - 114), fill=(255, 220, 120))
    draw.rectangle((W - 175, base - 18, W - 115, base - 8), fill=(120, 90, 50))


def _draw_theme(draw: ImageDraw.ImageDraw, theme: str, hue: tuple[int, int, int]) -> None:
    painters = {
        "queen": _draw_queen,
        "birthday": _draw_birthday,
        "shaman": _draw_shaman,
        "quiet": _draw_quiet,
        "station": _draw_station,
    }
    painter = painters.get(theme)
    if painter:
        painter(draw, hue)


def draw_fallback_cover(title: str, tag: str, hue: tuple[int, int, int], theme: str) -> Image.Image:
    img = _base_canvas(hue)
    _draw_theme(ImageDraw.Draw(img), theme, hue)
    draw = ImageDraw.Draw(img)
    title_font = load_font(42, bold=True)
    tag_font = load_font(18, bold=False)
    draw.text((48, 72), title, fill=(247, 251, 255), font=title_font)
    draw.text((48, 132), tag.upper(), fill=hue, font=tag_font)
    draw.rounded_rectangle((8, 8, W - 9, H - 9), radius=22, outline=hue, width=2)
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

        embedded = extract_embedded_cover(src)
        cover = fit_cover(embedded) if embedded is not None else draw_fallback_cover(
            track["title"], track["tag"], track["hue"], track["theme"]
        )
        cover_path = COVERS / f"{track['slug']}.webp"
        cover.save(cover_path, "WEBP", quality=88, method=6)
        print(f"OK {track['slug']} <- {src.name} ({'embedded' if embedded else 'fallback'})")


if __name__ == "__main__":
    main()
