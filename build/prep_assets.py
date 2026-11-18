"""Prepare logo, icons, and link-preview image for the EWB Purdue Winter 2026 directory.

Usage: python3 -I prep_assets.py <assets_dir> <out_dir>
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

src, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)

BLUE = (9, 90, 166)

# Horizontal logo: keep transparency, reduce file size with a palette.
h = Image.open(src / "logo_horizontal.png").convert("RGBA")
h.quantize(colors=128, method=Image.Quantize.FASTOCTREE).save(out / "logo_h.png", optimize=True)

# Round logo: crop the globe circle and drop the arc text around it.
r = Image.open(src / "logo_round.jpg").convert("RGB")
cx, cy, rad = 194, 213, 134
box = (cx - rad - 2, cy - rad - 2, cx + rad + 2, cy + rad + 2)
globe = r.crop(box).convert("RGBA")
size = globe.size[0]
mask = Image.new("L", globe.size, 0)
ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
white_bg = Image.new("RGBA", globe.size, (255, 255, 255, 255))
icon = Image.composite(globe, Image.new("RGBA", globe.size, (0, 0, 0, 0)), mask)
icon_solid = Image.composite(globe, white_bg, mask)

for px in (64, 180):
    canvas = Image.new("RGBA", (px, px), (255, 255, 255, 0 if px == 64 else 255))
    inner = int(px * (0.94 if px == 64 else 0.82))
    img = (icon if px == 64 else icon_solid).resize((inner, inner), Image.LANCZOS)
    canvas.alpha_composite(img, ((px - inner) // 2, (px - inner) // 2))
    canvas.save(out / f"icon_{px}.png", optimize=True)

# Link preview image, 1200x630.
W, H = 1200, 630
prev = Image.new("RGB", (W, H), (255, 255, 255))
d = ImageDraw.Draw(prev)
band_top = 430
d.rectangle((0, band_top, W, H), fill=BLUE)
d.rectangle((90, band_top + 52, 150, band_top + 58), fill=(204, 161, 71))
logo = h.copy()
lw = 900
logo = logo.resize((lw, int(logo.size[1] * lw / logo.size[0])), Image.LANCZOS)
prev.paste(logo, ((W - lw) // 2, (band_top - logo.size[1]) // 2), logo)
font_dir = Path("/usr/share/fonts/truetype/liberation")
f_big = ImageFont.truetype(str(font_dir / "LiberationSans-Bold.ttf"), 54)
f_small = ImageFont.truetype(str(font_dir / "LiberationSans-Regular.ttf"), 30)
d.text((90, band_top + 76), "Winter 2026 Crowdfunding Campaign", font=f_big, fill=(255, 255, 255))
d.text((90, band_top + 142), "Find the member who sent you and donate.", font=f_small, fill=(214, 228, 242))
prev.save(out / "preview.png", optimize=True)

for f in sorted(out.iterdir()):
    print(f.name, f.stat().st_size)
