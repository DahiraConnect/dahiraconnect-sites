"""Image de partage par défaut d'un dahira (aperçu WhatsApp / Facebook), 1200 × 630.

Fond vert profond + motif étoilé or discret, logo dans un anneau, nom, devise et adresse du site.
Usage : python3 scripts/share-image.py [slug]   (nécessite Pillow, fonttools, brotli)
Écrit src/assets/tenants/<slug>/partage.jpg
"""
import io
import json
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
slug = sys.argv[1] if len(sys.argv) > 1 else 'moutahabina'
tenant = json.loads((ROOT / 'src/assets/mock/tenant.json').read_text())
theme = tenant.get('theme') or {}
PRIMARY = theme.get('color-primary', '#0A3A1B')
GOLD = theme.get('color-gold', '#E2B743')
IVORY = '#F4EFE3'
SOFT = '#CFE0D3'
W, H = 1200, 630


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    """Polices du site (woff2) converties en mémoire pour Pillow"""
    tt = TTFont(ROOT / 'src/assets/fonts' / name)
    tt.flavor = None
    buf = io.BytesIO()
    tt.save(buf)
    buf.seek(0)
    return ImageFont.truetype(buf, size)


def wrap(draw: ImageDraw.ImageDraw, text: str, f: ImageFont.FreeTypeFont, width: int) -> list[str]:
    lines, line = [], ''
    for word in text.split():
        test = f'{line} {word}'.strip()
        if draw.textlength(test, font=f) <= width:
            line = test
        else:
            lines.append(line)
            line = word
    return lines + [line]


img = Image.new('RGB', (W, H), PRIMARY)
draw = ImageDraw.Draw(img)

# Motif étoilé (même tuile que le site), très discret
pattern = Image.new('RGBA', (W, H), (0, 0, 0, 0))
pd = ImageDraw.Draw(pattern)
gold_rgba = tuple(int(GOLD[i:i + 2], 16) for i in (1, 3, 5)) + (38,)
for x in range(0, W + 48, 48):
    for y in range(0, H + 48, 48):
        pd.polygon([(x + 24, y + 7), (x + 41, y + 24), (x + 24, y + 41), (x + 7, y + 24)], outline=gold_rgba)
        pd.rectangle([x + 12, y + 12, x + 36, y + 36], outline=gold_rgba)
img.paste(pattern, (0, 0), pattern)

# Logo dans un anneau or
logo = Image.open(ROOT / f'src/assets/tenants/{slug}/logo.webp').convert('RGBA')
size = 340
logo.thumbnail((size, size), Image.LANCZOS)
cx, cy = 250, H // 2
draw.ellipse([cx - 196, cy - 196, cx + 196, cy + 196], outline=GOLD, width=3)
img.paste(logo, (cx - logo.width // 2, cy - logo.height // 2), logo)

# Textes
x, maxw = 500, W - 500 - 70
f_over = font('atkinson-hyperlegible-next-latin-700-normal.woff2', 24)
f_name = font('young-serif-latin-400-normal.woff2', 62)
f_motto = font('atkinson-hyperlegible-next-latin-400-normal.woff2', 34)
f_site = font('atkinson-hyperlegible-next-latin-600-normal.woff2', 26)

name_lines = wrap(draw, tenant['name'], f_name, maxw)
motto_lines = wrap(draw, tenant['motto'], f_motto, maxw)
block = 34 + len(name_lines) * 70 + 24 + len(motto_lines) * 46 + 40 + 30
y = (H - block) // 2

draw.text((x, y), 'BIENVENUE', font=f_over, fill=GOLD)
y += 34 + 8
for line in name_lines:
    draw.text((x, y), line, font=f_name, fill=IVORY)
    y += 70
y += 16
for line in motto_lines:
    draw.text((x, y), line, font=f_motto, fill=SOFT)
    y += 46
y += 30
site = (tenant.get('siteUrl') or '').replace('https://', '').rstrip('/')
if site:
    draw.text((x, y), site, font=f_site, fill=GOLD)

out = ROOT / f'src/assets/tenants/{slug}/partage.jpg'
img.save(out, 'JPEG', quality=86, optimize=True, progressive=True)
print(f'{out.relative_to(ROOT)} : {out.stat().st_size // 1024} Ko')
