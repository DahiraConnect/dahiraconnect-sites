#!/usr/bin/env python3
"""
Sous-ensemble des icônes Phosphor réellement utilisées (perf 3G).

Scanne src/app (.html, .ts) et src/assets/mock (.json) pour `ph-<nom>` (graisse regular) et `ph-fill ph-<nom>` (fill),
puis génère :
  - src/assets/fonts/phosphor-regular.woff2, phosphor-fill.woff2
  - src/styles/_icons.scss

Usage : npm run icons   (nécessite : pip install fonttools brotli)
À relancer après l'ajout d'une nouvelle icône.
"""
import hashlib
import re
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src' / 'app'
PKG = ROOT / 'node_modules' / '@phosphor-icons' / 'web' / 'src'
FONTS = ROOT / 'src' / 'assets' / 'fonts'
SCSS = ROOT / 'src' / 'styles' / '_icons.scss'
INDEX = ROOT / 'src' / 'index.html'

WEIGHTS = {
    'regular': {'css': PKG / 'regular' / 'style.css', 'font': PKG / 'regular' / 'Phosphor.woff2',
                'selector': '.ph', 'family': 'Phosphor'},
    'fill': {'css': PKG / 'fill' / 'style.css', 'font': PKG / 'fill' / 'Phosphor-Fill.woff2',
             'selector': '.ph-fill', 'family': 'Phosphor Fill'},
}


def used_icons():
    """Icônes citées dans le code (gabarits, TS) et dans les données (src/assets/mock/*.json).

    regular : `ph ph-x`, ou un nom entre guillemets ('ph-x', "ph-x") ; fill : `ph-fill ph-x`.
    """
    files = [p for p in SRC.rglob('*') if p.suffix in {'.html', '.ts'}]
    files += list((ROOT / 'src' / 'assets' / 'mock').glob('*.json'))
    text = '\n'.join(p.read_text(encoding='utf-8') for p in files)
    regular = set(re.findall(r"(?:\bph |['\"])ph-([a-z0-9-]+)", text)) - {'fill'}
    fill = set(re.findall(r'\bph-fill ph-([a-z0-9-]+)', text))
    # Toute icône utilisée existe aussi en plein : une icône choisie dynamiquement ne disparaît jamais
    fill |= regular
    return regular, fill


def codepoints(css_path, names):
    css = css_path.read_text(encoding='utf-8')
    found = {}
    for name in sorted(names):
        m = re.search(rf'\.ph-{re.escape(name)}:before\s*\{{\s*content:\s*"\\([0-9a-f]+)"', css)
        if not m:
            raise SystemExit(f'Icône inconnue : ph-{name}')
        found[name] = m.group(1)
    return found


def build(weight, names):
    conf = WEIGHTS[weight]
    cps = codepoints(conf['css'], names)
    tmp = FONTS / f'phosphor-{weight}.tmp.woff2'
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = []
    font = subset.load_font(str(conf['font']), options)
    sub = subset.Subsetter(options)
    sub.populate(unicodes=[int(c, 16) for c in cps.values()])
    sub.subset(font)
    subset.save_font(font, str(tmp), options)
    # Nom avec empreinte : les fichiers de /assets/fonts sont en cache « immutable » (1 an) ;
    # un nouveau nom force le téléchargement des nouvelles icônes.
    digest = hashlib.sha256(tmp.read_bytes()).hexdigest()[:8]
    for old in FONTS.glob(f'phosphor-{weight}*.woff2'):
        if old != tmp:
            old.unlink()
    out = FONTS / f'phosphor-{weight}.{digest}.woff2'
    tmp.rename(out)
    INDEX.write_text(
        re.sub(rf'/assets/fonts/phosphor-{weight}[^"]*\.woff2', f'/assets/fonts/{out.name}', INDEX.read_text(encoding='utf-8')),
        encoding='utf-8',
    )
    rules = '\n'.join(f'{conf["selector"]}.ph-{n}::before {{\n  content: "\\{c}";\n}}' for n, c in cps.items())
    face = f"""@font-face {{
  font-family: '{conf['family']}';
  src: url('/assets/fonts/{out.name}') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}}

{conf['selector']} {{
  font-family: '{conf['family']}' !important;
  speak: never;
  font-style: normal;
  font-weight: normal;
  line-height: 1;
  display: inline-block;
  -webkit-font-smoothing: antialiased;
}}
"""
    print(f'{weight}: {len(cps)} icônes, {out.stat().st_size} octets')
    return face + '\n' + rules + '\n'


def main():
    regular, fill = used_icons()
    parts = ['// Généré par scripts/subset-icons.py — ne pas modifier à la main.\n']
    parts.append(build('regular', regular))
    if fill:
        parts.append(build('fill', fill))
    SCSS.write_text('\n'.join(parts), encoding='utf-8')


if __name__ == '__main__':
    main()
