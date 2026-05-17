# -*- coding: utf-8 -*-
"""Copy MP3 from Песни/ and render expressive mood covers to WebP."""
from __future__ import annotations

import io
import math
import random
import shutil
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageOps
from mutagen.mp3 import MP3

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "Песни"
OUT_DIR = ROOT / "songs"
COVERS = OUT_DIR / "covers"

W, H = 800, 500

TRACKS = [
    {
        "match": "Королева",
        "slug": "koroleva-arktiki",
        "title": "Королева\nАрктики",
        "mood": "Сказка • власть • северное сияние",
        "accent": (56, 232, 255),
        "accent2": (255, 214, 120),
        "theme": "queen",
    },
    {
        "match": "рождения",
        "slug": "den-rozhdeniya-irina",
        "title": "С днём\nрождения,\nИрина",
        "mood": "Тепло • слёзы радости • семья",
        "accent": (255, 183, 77),
        "accent2": (244, 114, 182),
        "theme": "birthday",
    },
    {
        "match": "шаман",
        "slug": "severnaya-shamanka",
        "title": "Северная\nшаманка",
        "mood": "Ритуал • тайга • огонь духов",
        "accent": (110, 231, 183),
        "accent2": (167, 139, 250),
        "theme": "shaman",
    },
    {
        "match": "Говорили",
        "slug": "govorili-tishe",
        "title": "Говорили:\nтише…",
        "mood": "Лирика • тишина • доверие",
        "accent": (186, 198, 220),
        "accent2": (147, 197, 253),
        "theme": "quiet",
    },
    {
        "match": "Дембель",
        "slug": "demebelskiy-vokzal",
        "title": "Дембельский\nвокзал",
        "mood": "Служба • встреча • дорога домой",
        "accent": (251, 191, 36),
        "accent2": (96, 165, 250),
        "theme": "station",
    },
]


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    names = (
        ["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf"]
        if bold
        else ["C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf"]
    )
    for path in names:
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


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def vertical_gradient(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        row = (
            int(lerp(top[0], bottom[0], t)),
            int(lerp(top[1], bottom[1], t)),
            int(lerp(top[2], bottom[2], t)),
        )
        for x in range(w):
            px[x, y] = row
    return img


def radial_glow(
    size: tuple[int, int],
    center: tuple[int, int],
    radius: int,
    color: tuple[int, int, int],
    alpha: int = 120,
) -> Image.Image:
    w, h = size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    cx, cy = center
    for i in range(6, 0, -1):
        r = int(radius * (i / 6))
        a = int(alpha * (i / 6) ** 1.4)
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(*color, a))
    return layer.filter(ImageFilter.GaussianBlur(radius=max(8, radius // 18)))


def add_grain(img: Image.Image, amount: int = 14) -> Image.Image:
    rng = random.Random(42)
    noise = Image.new("RGB", img.size)
    npx = noise.load()
    for y in range(img.size[1]):
        for x in range(img.size[0]):
            g = rng.randint(-amount, amount)
            npx[x, y] = (g, g, g)
    return ImageChops.add(img, noise, scale=1.0, offset=0)


def vignette(img: Image.Image, strength: float = 0.55) -> Image.Image:
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    md = ImageDraw.Draw(mask)
    md.ellipse((-w * 0.15, -h * 0.2, w * 1.15, h * 1.25), fill=int(255 * (1 - strength)))
    dark = Image.new("RGB", (w, h), (2, 6, 18))
    return Image.composite(img, dark, ImageOps.invert(mask))


def draw_title_block(
    base: Image.Image,
    title: str,
    mood: str,
    accent: tuple[int, int, int],
    accent2: tuple[int, int, int],
) -> Image.Image:
    layer = base.convert("RGBA")
    draw = ImageDraw.Draw(layer)
    title_font = load_font(46, bold=True)
    mood_font = load_font(15, bold=False)
    badge_font = load_font(11, bold=True)

    lines = title.split("\n")
    y = H - 42 - len(lines) * 50
    for i, line in enumerate(lines):
        yy = y + i * 50
        for dx, dy, col, alpha in ((3, 3, (0, 0, 0), 140), (0, 0, accent2 if i == 0 else accent, 255)):
            tlayer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            td = ImageDraw.Draw(tlayer)
            td.text((44 + dx, yy + dy), line, fill=(*col, alpha), font=title_font)
            layer = Image.alpha_composite(layer, tlayer)

    draw.rounded_rectangle((36, y - 18, 52, y + len(lines) * 50 + 8), radius=4, fill=accent)
    draw.text((64, y + len(lines) * 50 + 6), mood.upper(), fill=(*accent, 230), font=mood_font)
    draw.rounded_rectangle((36, H - 36, 168, H - 14), radius=10, fill=(*accent, 35), outline=(*accent, 180), width=1)
    draw.text((48, H - 32), "АВТОРСКАЯ ПЕСНЯ", fill=(247, 251, 255), font=badge_font)
    return layer.convert("RGB")


def texture_from_embedded(embedded: Image.Image | None) -> Image.Image | None:
    if embedded is None:
        return None
    bg = ImageOps.fit(embedded, (W, H), method=Image.Resampling.LANCZOS)
    bg = bg.filter(ImageFilter.GaussianBlur(28))
    bg = ImageEnhance_like_darken(bg, 0.35)
    return bg


def ImageEnhance_like_darken(img: Image.Image, factor: float) -> Image.Image:
    return Image.blend(Image.new("RGB", img.size, (0, 0, 0)), img, factor)


def paint_queen(track: dict, embedded: Image.Image | None) -> Image.Image:
    base = vertical_gradient((W, H), (2, 8, 28), (6, 42, 78))
    if embedded is not None:
        base = Image.blend(base, texture_from_embedded(embedded) or base, 0.22)

    scene = base.convert("RGBA")
    scene = Image.alpha_composite(scene, radial_glow((W, H), (560, 120), 280, (34, 211, 238), 100))
    scene = Image.alpha_composite(scene, radial_glow((W, H), (620, 200), 200, (52, 211, 153), 70))
    scene = Image.alpha_composite(scene, radial_glow((W, H), (480, 80), 160, (167, 139, 250), 55))
    draw = ImageDraw.Draw(scene)

    # mountains
    peaks = [(0, H), (120, 280), (240, 220), (380, 300), (520, 190), (680, 260), (W, 320), (W, H)]
    draw.polygon(peaks, fill=(8, 28, 48, 240))
    draw.polygon([(0, H), (180, 340), (420, 250), (W, 380), (W, H)], fill=(12, 38, 62, 200))

    cx, cy = 545, 165
    scene = Image.alpha_composite(scene, radial_glow((W, H), (cx, cy - 40), 140, (255, 214, 120), 130))
    draw = ImageDraw.Draw(scene)
    draw.polygon(
        [(cx, cy - 125), (cx - 82, cy - 15), (cx - 40, cy - 58), (cx, cy - 32), (cx + 40, cy - 58), (cx + 82, cy - 15)],
        fill=(255, 236, 180),
        outline=(255, 214, 120),
        width=2,
    )
    for px, gem in ((cx - 42, (56, 232, 255)), (cx, (255, 214, 120)), (cx + 42, (167, 139, 250))):
        draw.ellipse((px - 9, cy - 98, px + 9, cy - 80), fill=gem)

    draw.ellipse((cx - 48, cy - 35, cx + 48, cy + 55), fill=(18, 52, 82))
    draw.polygon([(cx - 90, cy + 20), (cx + 90, cy + 20), (cx + 55, cy + 200), (cx - 55, cy + 200)], fill=(12, 36, 58, 220))

    rng = random.Random(7)
    for _ in range(55):
        x, y = rng.randint(40, W - 40), rng.randint(20, H - 120)
        s = rng.randint(1, 3)
        draw.ellipse((x, y, x + s, y + s), fill=(220, 245, 255))

    for i in range(8):
        ang = math.radians(15 + i * 22)
        x2 = cx + int(130 * math.cos(ang))
        y2 = cy + int(80 * math.sin(ang))
        draw.line([(cx, cy), (x2, y2)], fill=(56, 232, 255, 90), width=2)

    img = scene.convert("RGB")
    return draw_title_block(img, track["title"], track["mood"], track["accent"], track["accent2"])


def paint_birthday(track: dict, embedded: Image.Image | None) -> Image.Image:
    base = vertical_gradient((W, H), (48, 18, 52), (120, 42, 28))
    if embedded is not None:
        base = Image.blend(base, texture_from_embedded(embedded) or base, 0.18)

    scene = base.convert("RGBA")
    scene = Image.alpha_composite(scene, radial_glow((W, H), (520, 260), 320, (255, 183, 77), 130))
    scene = Image.alpha_composite(scene, radial_glow((W, H), (200, 180), 180, (244, 114, 182), 80))
    draw = ImageDraw.Draw(scene)

    rng = random.Random(11)
    for _ in range(90):
        x, y = rng.randint(0, W), rng.randint(0, H - 80)
        col = rng.choice([(255, 220, 120), (244, 114, 182), (96, 165, 250), (255, 255, 255)])
        draw.rectangle((x, y, x + 5, y + 8), fill=(*col, 180))

    cx, base_y = 530, 340
    draw.rounded_rectangle((cx - 95, base_y - 70, cx + 95, base_y), radius=18, fill=(255, 248, 240), outline=(255, 214, 120), width=3)
    for i, col in enumerate([(255, 120, 80), (244, 114, 182), (96, 165, 250)]):
        x = cx - 50 + i * 50
        draw.rectangle((x - 4, base_y - 95, x + 4, base_y - 70), fill=col)
        draw.ellipse((x - 10, base_y - 115, x + 10, base_y - 90), fill=(255, 240, 180))
        scene = Image.alpha_composite(scene, radial_glow((W, H), (x, base_y - 102), 35, (255, 200, 100), 160))

    draw = ImageDraw.Draw(scene)
    for bx, by, c in ((420, 120, (244, 114, 182)), (640, 90, (96, 165, 250)), (480, 60, (255, 183, 77))):
        draw.ellipse((bx - 28, by - 36, bx + 28, by + 36), outline=c, width=3)
        draw.line([(bx, by + 36), (bx, by + 70)], fill=c, width=2)

    name_font = load_font(52, bold=True)
    draw.text((458, 110), "Ирина", fill=(90, 30, 60), font=name_font)
    draw.text((454, 104), "Ирина", fill=(255, 248, 230), font=name_font)

    img = vignette(scene.convert("RGB"), 0.35)
    return draw_title_block(img, track["title"], track["mood"], track["accent"], track["accent2"])


def paint_shaman(track: dict, embedded: Image.Image | None) -> Image.Image:
    base = vertical_gradient((W, H), (12, 6, 32), (24, 18, 48))
    if embedded is not None:
        base = Image.blend(base, texture_from_embedded(embedded) or base, 0.2)

    scene = base.convert("RGBA")
    scene = Image.alpha_composite(scene, radial_glow((W, H), (540, 280), 250, (110, 231, 183), 90))
    scene = Image.alpha_composite(scene, radial_glow((W, H), (540, 300), 120, (255, 120, 60), 70))
    draw = ImageDraw.Draw(scene)

    # fire ring
    fx, fy = 540, 310
    for r, col, a in ((95, (255, 60, 20), 70), (70, (255, 90, 40), 95), (48, (255, 180, 60), 125), (26, (255, 240, 200), 165)):
        draw.ellipse((fx - r, fy - r, fx + r, fy + r), fill=(*col, a))

    draw.ellipse((fx - 55, fy - 16, fx + 55, fy + 16), fill=(28, 18, 38), outline=(110, 231, 183), width=3)
    for ang in range(0, 360, 30):
        rad = math.radians(ang)
        x1 = fx + int(48 * math.cos(rad))
        y1 = fy + int(14 * math.sin(rad))
        x2 = fx + int(68 * math.cos(rad))
        y2 = fy + int(20 * math.sin(rad))
        draw.line([(x1, y1), (x2, y2)], fill=(167, 139, 250), width=3)

    # silhouette + staff
    draw.polygon([(fx, 95), (fx - 22, 175), (fx + 22, 175)], fill=(110, 231, 183))
    draw.rectangle((fx - 18, 175, fx + 18, 290), fill=(20, 14, 36))
    draw.line([(fx + 30, 120), (fx + 30, 320)], fill=(200, 180, 120), width=4)
    for i in range(5):
        draw.line([(fx + 30, 140 + i * 35), (fx + 55 - i * 4, 125 + i * 35)], fill=(167, 139, 250), width=2)

    # runes arc
    for i in range(9):
        ang = math.radians(200 + i * 16)
        rx = fx + int(100 * math.cos(ang))
        ry = fy - 80 + int(60 * math.sin(ang))
        draw.ellipse((rx - 4, ry - 4, rx + 4, ry + 4), fill=(110, 231, 183))

    scene = Image.alpha_composite(scene, radial_glow((W, H), (120, 80), 140, (167, 139, 250), 50))
    img = vignette(scene.convert("RGB"), 0.45)
    return draw_title_block(img, track["title"], track["mood"], track["accent"], track["accent2"])


def paint_quiet(track: dict, embedded: Image.Image | None) -> Image.Image:
    base = vertical_gradient((W, H), (4, 8, 22), (14, 22, 42))
    if embedded is not None:
        base = Image.blend(base, texture_from_embedded(embedded) or base, 0.15)

    scene = base.convert("RGBA")
    draw = ImageDraw.Draw(scene)

    # moon
    mx, my = 580, 110
    scene = Image.alpha_composite(scene, radial_glow((W, H), (mx, my), 160, (200, 210, 230), 80))
    draw = ImageDraw.Draw(scene)
    draw.ellipse((mx - 88, my - 88, mx + 88, my + 88), fill=(245, 248, 255))
    draw.ellipse((mx - 62, my - 68, mx + 72, my + 62), fill=(14, 22, 42))
    draw.text((68, 38), "шёпот", fill=(100, 130, 170), font=load_font(22, bold=True))

    # window glow
    wx, wy = 500, 200
    scene = Image.alpha_composite(scene, radial_glow((W, H), (wx + 35, wy + 45), 100, (255, 200, 140), 70))
    draw = ImageDraw.Draw(scene)
    draw.rectangle((wx, wy, wx + 70, wy + 90), fill=(255, 220, 160, 40), outline=(186, 198, 220), width=2)
    draw.polygon([(wx + 35, wy + 8), (wx + 12, wy + 45), (wx + 58, wy + 45)], fill=(255, 230, 180, 60))

    # profile + finger
    draw.ellipse((wx - 55, wy + 25, wx - 5, wy + 75), fill=(22, 32, 52))
    draw.ellipse((wx - 48, wy + 38, wx - 22, wy + 58), fill=(186, 198, 220))
    draw.line([(wx - 30, wy + 48), (wx - 8, wy + 35)], fill=(186, 198, 220), width=3)

    draw.text((60, 55), "«", fill=(147, 197, 253, 120), font=load_font(90, bold=True))
    for i in range(5):
        x = 450 + i * 28
        draw.arc((x, 300, x + 40, 340), 200, 340, fill=(147, 197, 253, 140 - i * 20), width=2)

    img = vignette(scene.convert("RGB"), 0.5)
    return draw_title_block(img, track["title"], track["mood"], track["accent"], track["accent2"])


def paint_station(track: dict, embedded: Image.Image | None) -> Image.Image:
    base = vertical_gradient((W, H), (8, 14, 28), (22, 32, 48))
    if embedded is not None:
        base = Image.blend(base, texture_from_embedded(embedded) or base, 0.2)

    scene = base.convert("RGBA")
    draw = ImageDraw.Draw(scene)

    # tracks perspective
    vanish = (520, 180)
    for off in (-80, -40, 0, 40, 80):
        draw.line([(vanish[0], vanish[1]), (off, H)], fill=(40, 52, 68), width=3)
    draw.rectangle((0, H - 70, W, H), fill=(28, 36, 48))

    # train headlight beam
    scene = Image.alpha_composite(scene, radial_glow((W, H), (640, 270), 280, (251, 191, 36), 140))
    scene = Image.alpha_composite(scene, radial_glow((W, H), (600, 280), 120, (255, 255, 255), 90))
    draw = ImageDraw.Draw(scene)
    draw.rectangle((560, 240, 720, 330), fill=(32, 48, 62), outline=(96, 165, 250), width=2)
    draw.polygon([(560, 240), (700, 200), (720, 240)], fill=(48, 72, 92))
    draw.ellipse((680, 285, 710, 315), fill=(255, 240, 180))
    draw.rectangle((600, 300, 650, 318), fill=(120, 90, 50))

    # platform lamp
    scene = Image.alpha_composite(scene, radial_glow((W, H), (380, 200), 120, (251, 191, 36), 100))
    draw = ImageDraw.Draw(scene)
    draw.rectangle((370, 200, 378, 340), fill=(60, 50, 40))
    draw.ellipse((358, 185, 390, 215), fill=(255, 230, 160))

    # star badge
    sx, sy = 450, 120
    pts = []
    for i in range(10):
        ang = math.radians(-90 + i * 36)
        r = 22 if i % 2 == 0 else 10
        pts.append((sx + r * math.cos(ang), sy + r * math.sin(ang)))
    draw.polygon(pts, fill=(180, 40, 40), outline=(251, 191, 36))

    draw.text((395, 55), "ДЕМБЕЛЬ", fill=(251, 191, 36), font=load_font(20, bold=True))
    draw.text((420, 350), "домой", fill=(186, 198, 220), font=load_font(24, bold=True))

    img = vignette(scene.convert("RGB"), 0.42)
    return draw_title_block(img, track["title"], track["mood"], track["accent"], track["accent2"])


PAINTERS = {
    "queen": paint_queen,
    "birthday": paint_birthday,
    "shaman": paint_shaman,
    "quiet": paint_quiet,
    "station": paint_station,
}


def render_cover(track: dict, embedded: Image.Image | None) -> Image.Image:
    painter = PAINTERS[track["theme"]]
    img = painter(track, embedded)
    return add_grain(img, 10)


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

        shutil.copy2(src, OUT_DIR / f"{track['slug']}.mp3")
        embedded = extract_embedded_cover(src)
        cover = render_cover(track, embedded)
        out = COVERS / f"{track['slug']}.webp"
        cover.save(out, "WEBP", quality=90, method=6)
        print(f"OK {track['slug']} <- {src.name}")


if __name__ == "__main__":
    main()
