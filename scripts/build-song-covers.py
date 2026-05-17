# -*- coding: utf-8 -*-
"""Продающие обложки: фото Зинаиды + арт из MP3 + коммерческая типографика."""
from __future__ import annotations

import io
import math
import random
import subprocess
import sys
from pathlib import Path

try:
    import imageio_ffmpeg
except ImportError:
    imageio_ffmpeg = None  # type: ignore

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageOps
from mutagen import File as MutagenFile

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "Песни"
OUT_DIR = ROOT / "songs"
COVERS = OUT_DIR / "covers"

# Рендер крупнее → чётче на карточках
W, H = 960, 600

TRACKS = [
    {
        "match": "Королева",
        "slug": "koroleva-arktiki",
        "title": "Королева Арктики",
        "hook": "Песня-корона для особенной женщины",
        "cta": "Слушать демо",
        "bg": ROOT / "arctic-aurora.webp",
        "crop": (0.35, 0.22),
        "tint": (12, 48, 88),
        "accent": (56, 232, 255),
        "accent2": (255, 214, 120),
        "badge": "Хит на заказ",
    },
    {
        "match": "рождения",
        "slug": "den-rozhdeniya-irina",
        "title": "С днём рождения, Ирина",
        "hook": "Имя в припеве — подарок, который плачут от радости",
        "cta": "Подарить песню",
        "bg": ROOT / "hero-portrait.jpg",
        "crop": (0.5, 0.28),
        "tint": (88, 32, 48),
        "accent": (255, 200, 120),
        "accent2": (244, 114, 182),
        "badge": "Поздравление",
    },
    {
        "match": "шаман",
        "slug": "severnaya-shamanka",
        "title": "Северная шаманка",
        "hook": "Этно и мистика — сила севера в звуке",
        "cta": "Погрузиться",
        "bg": ROOT / "arctic-ice.webp",
        "crop": (0.5, 0.35),
        "tint": (28, 18, 52),
        "accent": (110, 231, 183),
        "accent2": (167, 139, 250),
        "badge": "Атмосфера",
    },
    {
        "match": "Говорили",
        "slug": "govorili-tishe",
        "title": "Говорили: тише…",
        "hook": "Лирика, от которой замирает зал",
        "cta": "Послушать",
        "bg": ROOT / "arctic-glass.webp",
        "crop": (0.45, 0.3),
        "tint": (14, 22, 42),
        "accent": (186, 210, 230),
        "accent2": (147, 197, 253),
        "badge": "Камерный хит",
    },
    {
        "match": "Дембель",
        "slug": "demebelskiy-vokzal",
        "title": "Дембельский вокзал",
        "hook": "Про службу, встречу и дорогу домой",
        "cta": "Включить",
        "bg": ROOT / "arctic-snow.webp",
        "crop": (0.55, 0.4),
        "tint": (22, 32, 48),
        "accent": (251, 191, 36),
        "accent2": (96, 165, 250),
        "badge": "Сильный сюжет",
    },
    {
        "match": "Мурманск",
        "slug": "murmansk-zapominaet",
        "title": "Мурманск запоминает",
        "hook": "Город за Полярным кругом — в песне и в сердце",
        "cta": "Слушать",
        "bg": ROOT / "arctic-aurora.webp",
        "crop": (0.48, 0.2),
        "tint": (14, 38, 72),
        "accent": (96, 165, 250),
        "accent2": (52, 211, 153),
        "badge": "Заполярный",
    },
    {
        "match": "Позвони",
        "slug": "pozvoni-poka-ne-pozdno",
        "title": "Позвони, пока не поздно",
        "hook": "Про любовь, звонок и последний шанс сказать главное",
        "cta": "Послушать",
        "bg": ROOT / "arctic-glass.webp",
        "crop": (0.42, 0.32),
        "tint": (48, 16, 42),
        "accent": (244, 114, 182),
        "accent2": (251, 191, 36),
        "badge": "Лирика",
    },
]


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    paths = (
        ["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf"]
        if bold
        else ["C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf"]
    )
    for path in paths:
        p = Path(path)
        if p.exists():
            return ImageFont.truetype(str(p), size=size)
    return ImageFont.load_default()


def extract_embedded_cover(audio_path: Path) -> Image.Image | None:
    audio = MutagenFile(audio_path)
    if audio is None or not audio.tags:
        return None
    for key, frame in audio.tags.items():
        if not str(key).startswith("APIC"):
            continue
        data = getattr(frame, "data", None)
        if not data:
            continue
        try:
            return Image.open(io.BytesIO(data)).convert("RGBA")
        except OSError:
            continue
    return None


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def crop_cover_photo(path: Path, center: tuple[float, float]) -> Image.Image:
    img = Image.open(path).convert("RGB")
    iw, ih = img.size
    target_ratio = W / H
    src_ratio = iw / ih

    if src_ratio > target_ratio:
        ch = ih
        cw = int(ch * target_ratio)
    else:
        cw = iw
        ch = int(cw / target_ratio)

    cx = int(iw * center[0])
    cy = int(ih * center[1])
    left = max(0, min(iw - cw, cx - cw // 2))
    top = max(0, min(ih - ch, cy - ch // 2))
    cropped = img.crop((left, top, left + cw, top + ch))
    return cropped.resize((W, H), Image.Resampling.LANCZOS)


def tint_layer(base: Image.Image, rgb: tuple[int, int, int], alpha: float) -> Image.Image:
    wash = Image.new("RGBA", base.size, (*rgb, int(255 * alpha)))
    return Image.alpha_composite(base.convert("RGBA"), wash)


def radial_glow(size: tuple[int, int], center: tuple[int, int], radius: int, color: tuple[int, int, int], alpha: int) -> Image.Image:
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    cx, cy = center
    for step in range(8, 0, -1):
        r = int(radius * step / 8)
        a = int(alpha * (step / 8) ** 1.3)
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(*color, a))
    return layer.filter(ImageFilter.GaussianBlur(radius=max(10, radius // 16)))


def footer_gradient(size: tuple[int, int], height: int) -> Image.Image:
    w, h = size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    top = h - height
    for y in range(top, h):
        t = (y - top) / max(height - 1, 1)
        a = int(lerp(40, 235, t**0.85))
        draw.line([(0, y), (w, y)], fill=(2, 6, 18, a))
    return layer


def text_size(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0], box[3] - box[1]


def wrap_title(title: str, max_chars: int = 16) -> list[str]:
    words = title.replace("\n", " ").split()
    lines: list[str] = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        if len(test) <= max_chars:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines[:3]


def draw_text_with_glow(
    canvas: Image.Image,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.ImageFont,
    fill: tuple[int, int, int],
    glow: tuple[int, int, int] | None = None,
) -> None:
    if canvas.mode != "RGBA":
        raise ValueError("canvas must be RGBA")
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).text((xy[0], xy[1] + 3), text, font=font, fill=(0, 0, 0, 170))
    canvas.alpha_composite(shadow)
    if glow:
        g = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        ImageDraw.Draw(g).text((xy[0], xy[1]), text, font=font, fill=(*glow, 100))
        g = g.filter(ImageFilter.GaussianBlur(3))
        canvas.alpha_composite(g)
    main = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(main).text(xy, text, font=font, fill=(*fill, 255))
    canvas.alpha_composite(main)


def place_hero_art(canvas: Image.Image, art: Image.Image, accent: tuple[int, int, int]) -> tuple[int, int, int, int]:
    """Крупный «диск» по центру — главный визуальный крючок."""
    max_w, max_h = int(W * 0.58), int(H * 0.66)
    art = art.copy()
    art.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
    aw, ah = art.size
    x = (W - aw) // 2
    y = int(H * 0.11)

    pad = 14
    frame = Image.new("RGBA", (aw + pad * 2, ah + pad * 2), (0, 0, 0, 0))
    fd = ImageDraw.Draw(frame)
    fd.rounded_rectangle((0, 0, aw + pad * 2 - 1, ah + pad * 2 - 1), radius=22, fill=(8, 16, 32, 220), outline=(*accent, 255), width=3)

    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((x - 6, y + 10, x + aw + pad * 2 + 6, y + ah + pad * 2 + 18), radius=26, fill=(0, 0, 0, 120))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    canvas_rgba = canvas.convert("RGBA")
    canvas_rgba = Image.alpha_composite(canvas_rgba, shadow)
    canvas.paste(canvas_rgba.convert("RGB"), (0, 0))

    canvas.paste(frame, (x - pad, y - pad), frame)
    if art.mode != "RGBA":
        art = art.convert("RGBA")
    canvas.paste(art, (x, y), art)
    return (x, y, x + aw, y + ah)


def render_selling_cover(track: dict, embedded: Image.Image | None) -> Image.Image:
    bg_path: Path = track["bg"]
    if not bg_path.exists():
        bg_path = ROOT / "arctic-aurora.webp"

    base = crop_cover_photo(bg_path, track["crop"]).convert("RGBA")
    base = tint_layer(base, track["tint"], 0.42)
    base = Image.alpha_composite(base, radial_glow((W, H), (int(W * 0.72), int(H * 0.28)), 320, track["accent"], 55))
    base = Image.alpha_composite(base, radial_glow((W, H), (int(W * 0.2), int(H * 0.75)), 260, track["accent2"], 40))

    img = base.convert("RGB")

    if embedded is not None:
        place_hero_art(img, embedded, track["accent"])
    else:
        # без встроенного арта — крупный акцентный круг с нотой
        layer = img.convert("RGBA")
        layer = Image.alpha_composite(layer, radial_glow((W, H), (W // 2, int(H * 0.38)), 200, track["accent"], 100))
        img = layer.convert("RGB")
        d = ImageDraw.Draw(img)
        d.text((W // 2 - 28, int(H * 0.28)), "♪", fill=track["accent2"], font=load_font(120, bold=True))

    overlay = img.convert("RGBA")
    overlay = Image.alpha_composite(overlay, footer_gradient((W, H), int(H * 0.52)))

    draw = ImageDraw.Draw(overlay)
    accent, accent2 = track["accent"], track["accent2"]

    # верхние бейджи
    draw.rounded_rectangle((36, 28, 210, 62), radius=14, fill=(8, 16, 32, 210), outline=(*accent, 220), width=2)
    draw.text((52, 38), track["badge"].upper(), fill=(247, 251, 255), font=load_font(14, bold=True))
    draw.rounded_rectangle((W - 168, 28, W - 36, 62), radius=14, fill=(*accent2, 230))
    draw.text((W - 154, 38), "ОТ 1000 ₽", fill=(12, 18, 32), font=load_font(14, bold=True))

    # нижний продающий блок
    title_font = load_font(48, bold=True)
    hook_font = load_font(19, bold=False)
    cta_font = load_font(15, bold=True)

    lines = wrap_title(track["title"], 18)
    y = H - 38 - len(lines) * 54
    for line in lines:
        draw_text_with_glow(overlay, (44, y), line, title_font, (247, 251, 255), accent)
        y += 54

    hook = track["hook"]
    if len(hook) > 52:
        hook = hook[:49] + "…"
    draw.text((44, H - 118), hook, fill=(*accent, 255), font=hook_font)

    cta_w, cta_h = 200, 44
    cta_x, cta_y = 44, H - 72
    draw.rounded_rectangle((cta_x, cta_y, cta_x + cta_w, cta_y + cta_h), radius=22, fill=accent)
    draw.polygon(
        [
            (cta_x + 22, cta_y + 14),
            (cta_x + 22, cta_y + cta_h - 14),
            (cta_x + 38, cta_y + cta_h // 2),
        ],
        fill=(12, 18, 32),
    )
    draw.text((cta_x + 48, cta_y + 12), track["cta"].upper(), fill=(12, 18, 32), font=cta_font)

    draw.text((cta_x + cta_w + 20, cta_y + 14), "Авторская песня Зинаиды", fill=(186, 198, 220), font=load_font(13))

    # рамка премиум
    draw.rounded_rectangle((10, 10, W - 11, H - 11), radius=20, outline=(*accent, 180), width=2)

    final = overlay.convert("RGB")
    final = add_grain(final, 8)
    return final.resize((800, 500), Image.Resampling.LANCZOS)


def encode_audio_mp3(src: Path, dest: Path, bitrate: str = "128k") -> None:
    if imageio_ffmpeg is None:
        raise SystemExit("Установите: pip install imageio-ffmpeg")
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        imageio_ffmpeg.get_ffmpeg_exe(),
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(src),
        "-vn",
        "-ac",
        "2",
        "-ar",
        "44100",
        "-c:a",
        "libmp3lame",
        "-b:a",
        bitrate,
        str(dest),
    ]
    subprocess.run(cmd, check=True)


def add_grain(img: Image.Image, amount: int = 8) -> Image.Image:
    rng = random.Random(99)
    noise = Image.new("RGB", img.size)
    px = noise.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            g = rng.randint(-amount, amount)
            px[x, y] = (g, g, g)
    return ImageChops.add(img, noise)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    COVERS.mkdir(parents=True, exist_ok=True)

    audio_files = sorted([*SRC_DIR.glob("*.mp3"), *SRC_DIR.glob("*.wav")], key=lambda p: p.name.lower())
    if len(audio_files) < len(TRACKS):
        raise SystemExit(f"Need {len(TRACKS)} audio files in {SRC_DIR}, found {len(audio_files)}")

    used: set[Path] = set()
    for track in TRACKS:
        src = next(
            (p for p in audio_files if p not in used and track["match"].lower() in p.stem.lower()),
            None,
        )
        if src is None:
            src = next(p for p in audio_files if p not in used)
        used.add(src)

        dest_mp3 = OUT_DIR / f"{track['slug']}.mp3"
        before = src.stat().st_size
        if dest_mp3.exists():
            dest_mp3.unlink()
        encode_audio_mp3(src, dest_mp3)
        after = dest_mp3.stat().st_size
        legacy_wav = OUT_DIR / f"{track['slug']}.wav"
        if legacy_wav.exists():
            legacy_wav.unlink()
        embedded = extract_embedded_cover(src)
        cover = render_selling_cover(track, embedded)
        out = COVERS / f"{track['slug']}.webp"
        cover.save(out, "WEBP", quality=84, method=6)
        print(f"OK {track['slug']} audio {before // 1024}KB -> {after // 1024}KB")


if __name__ == "__main__":
    main()
