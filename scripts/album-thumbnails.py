#!/usr/bin/env python3
"""
Vignettes des albums (640 px de large, WebP) pour la grille et les cartes :
la photo en taille réelle n'est chargée qu'à l'ouverture de la visionneuse (3G).

Pour chaque photo et couverture de src/assets/mock/albums.json, crée `<nom>.640.webp`
à côté de l'original et l'inscrit dans le JSON (`thumbUrl`, `coverThumbUrl`).

Usage : python3 scripts/album-thumbnails.py   (nécessite : pip install pillow)
À relancer après l'ajout de photos.
"""
import json
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
ALBUMS = SRC / 'assets' / 'mock' / 'albums.json'
WIDTH = 640


def thumb(url: str) -> str | None:
    """Crée la vignette si besoin et renvoie son adresse (None si l'original est absent ou non local)."""
    if not url.startswith('/assets/') or '.640.' in url:
        return None
    original = SRC / url.lstrip('/')
    if not original.exists() or original.suffix.lower() == '.svg':
        return None
    target = original.with_name(original.stem + '.640.webp')
    if not target.exists() or target.stat().st_mtime < original.stat().st_mtime:
        im = ImageOps.exif_transpose(Image.open(original)).convert('RGB')
        if im.width > WIDTH:
            im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
        im.save(target, quality=78, method=6)
    return '/' + str(target.relative_to(SRC))


albums = json.loads(ALBUMS.read_text(encoding='utf-8'))
made = 0
for album in albums:
    for photo in album.get('photos', []):
        t = thumb(photo['url'])
        if t:
            photo['thumbUrl'] = t
            made += 1
    if album.get('coverUrl') and (t := thumb(album['coverUrl'])):
        album['coverThumbUrl'] = t
ALBUMS.write_text(json.dumps(albums, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{made} vignettes de photos à jour')
