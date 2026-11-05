#!/usr/bin/env python3
"""Render the existing OUR GLASS social preview with the same glass-bulb signature.

Source image is NOT regenerated or retouched. Only a delicate inscription
is composited onto the lower bulb of the existing social preview.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "og-hourglass.jpg"
DEST = ROOT / "og-hourglass-signed.jpg"
SIGNATURE = "POWERED BY BARB THE BUILDER"

def load_font(size: int):
    for p in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ):
        if Path(p).exists():
            return ImageFont.truetype(p, size=size)
    return ImageFont.load_default()

def render():
    original = Image.open(SOURCE).convert("RGBA")
    width, height = original.size
    assert width >= 1200 and height >= 600, f"Unexpected image size: {original.size}"
    scale = width / 1672
    font = load_font(round(20 * scale))
    spacing = 4.0 * scale

    mask = Image.new("L", original.size, 0)
    draw = ImageDraw.Draw(mask)
    advances = [draw.textlength(letter, font=font) for letter in SIGNATURE]
    full_width = sum(advances) + spacing * (len(SIGNATURE) - 1)
    x = 355 * scale - full_width / 2
    y = 635 * (height / 941)

    for ch, advance in zip(SIGNATURE, advances):
        draw.text((round(x), round(y)), ch, font=font, fill=255, stroke_width=0)
        x += advance + spacing

    # The gentle translucency mimics the original wall-signature CSS.
    mask = mask.filter(ImageFilter.GaussianBlur(radius=0.24 * scale))
    mask = mask.point(lambda value: round(value * 0.55))
    ink = Image.new("RGBA", original.size, (116, 87, 56, 0))
    ink.putalpha(mask)
    combined = Image.alpha_composite(original, ink).convert("RGB")
    combined.save(DEST, "JPEG", quality=95, subsampling=0, optimize=True)
    print(f"Saved {DEST.name}: {combined.size}; signature only; {DEST.stat().st_size} bytes")

if __name__ == "__main__":
    render()
