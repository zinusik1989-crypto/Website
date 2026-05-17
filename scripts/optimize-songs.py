# -*- coding: utf-8 -*-
"""Сжатие аудио в songs/*.mp3 (128 kbps, стерео) для быстрой загрузки."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

try:
    import imageio_ffmpeg
except ImportError:
    print("pip install imageio-ffmpeg", file=sys.stderr)
    raise

ROOT = Path(__file__).resolve().parent.parent
SONGS = ROOT / "songs"

# kbps: баланс качества демо и веса (~3–4 МБ на типичный трек)
AUDIO_BITRATE = "96k"
SAMPLE_RATE = "44100"


def ffmpeg_bin() -> str:
    return imageio_ffmpeg.get_ffmpeg_exe()


def encode_to_mp3(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        ffmpeg_bin(),
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
        SAMPLE_RATE,
        "-c:a",
        "libmp3lame",
        "-b:a",
        AUDIO_BITRATE,
        str(dest),
    ]
    subprocess.run(cmd, check=True)


def optimize_file(path: Path) -> int:
    """Перекодировать в MP3; вернуть размер в байтах."""
    if path.suffix.lower() not in {".mp3", ".wav", ".m4a", ".flac"}:
        return path.stat().st_size
    tmp = path.parent / f"{path.stem}__opt.mp3"
    final = path.with_suffix(".mp3")
    encode_to_mp3(path, tmp)
    if final.exists() and final != tmp:
        final.unlink()
    tmp.replace(final)
    return final.stat().st_size


def optimize_all_in_songs() -> None:
    for f in sorted(SONGS.iterdir()):
        if f.is_file() and f.suffix.lower() in {".mp3", ".wav", ".m4a", ".flac"}:
            before = f.stat().st_size
            after = optimize_file(f)
            print(f"{f.stem}: {before // 1024} KB -> {after // 1024} KB")


if __name__ == "__main__":
    optimize_all_in_songs()
