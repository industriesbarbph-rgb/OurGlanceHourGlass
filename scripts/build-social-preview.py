#!/usr/bin/env python3
"""Build a crop-safe OUR GLASS link preview from the unchanged hourglass image.

Only the social-preview JPG is generated. The website artwork, layout and QR
images are never modified. Important wording stays in a centered square-safe area.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "hourglass-base.jpg"
DEST = ROOT / "og-hourglass-signed.jpg"
SIZE = (1200, 630)
BACKGROUND = (251, 249, 246)
INK = (37, 38, 42)
SUBTLE = (123, 106, 87)


def font(size, italic=False, bold=False):
    paths = (
        ["/usr/share/fonts/truetype/liberation2/LiberationSerif-Italic.ttf",
         "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf"]
        if italic else
        ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
         "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf"]
    )
    for p in paths:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def center_line(draw, text, y, initial_size, max_width, color=INK,
                italic=False, letter_space=0):
    size = initial_size
    f = font(size, italic=italic)
    def measure():
        return draw.textlength(text, font=f) + max(0, len(text)-1)*letter_space
    while measure() > max_width and size > 12:
        size -= 1
        f = font(size, italic=italic)
    start = int(676 - measure()/2)
    if letter_space:
        x = start
        for char in text:
            draw.text((round(x), y), char, fill=color, font=f)
            x += draw.textlength(char, font=f) + letter_space
    else:
        draw.text((start, y), text, fill=color, font=f)
    assert start >= 398 and start + measure() <= 954, (text, start, measure())


def render():
    base = Image.open(SOURCE).convert("RGB")
    assert base.width >= 1000 and base.height >= 600
    out = Image.new("RGB", SIZE, BACKGROUND)
    scale = SIZE[1] / base.height
    scaled = base.resize((round(base.width*scale), SIZE[1]), Image.Resampling.LANCZOS)
    crop_width = min(555, scaled.width)
    left = scaled.crop((0, 0, crop_width, SIZE[1]))
    # Fade the right edge of the original hourglass into the same pale background.
    mask = Image.new("L", (crop_width, SIZE[1]), 0)
    alpha = ImageDraw.Draw(mask)
    for x in range(crop_width):
        opacity = 255 if x <= 340 else round(255*max(0, (520-x)/180))
        alpha.line((x, 0, x, SIZE[1]), fill=opacity)
    out.paste(left, (0, 0), mask)

    draw = ImageDraw.Draw(out)
    center_line(draw, "OUR GLASS", 130, 22, 430, letter_space=4, color=INK)
    center_line(draw, "The Afterword", 205, 61, 430, italic=True)
    center_line(draw, "Concierge", 277, 72, 430, italic=True)
    center_line(draw, "DEATH NOTIFICATION", 411, 24, 430, letter_space=1, color=SUBTLE)
    center_line(draw, "& BEYOND", 448, 27, 430, letter_space=2, color=SUBTLE)
    center_line(draw, "POWERED BY BARB THE BUILDER", 542, 13, 430,
                letter_space=1.1, color=SUBTLE)
    out.save(DEST, "JPEG", quality=93, subsampling=0, optimize=True)
    assert Image.open(DEST).size == SIZE
    print(f"Saved {DEST}: 1200x630, {DEST.stat().st_size} bytes, square-safe title")


if __name__ == "__main__":
    render()
