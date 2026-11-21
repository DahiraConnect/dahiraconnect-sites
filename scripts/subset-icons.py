#!/usr/bin/env python3
"""
Sous-ensemble des icônes Phosphor réellement utilisées (perf 3G).

Scanne src/app (.html, .ts) pour `ph-<nom>` (graisse regular) et `ph-fill ph-<nom>` (fill),
puis génère :
  - src/assets/fonts/phosphor-regular.woff2, phosphor-fill.woff2
  - src/styles/_icons.scss

Usage : npm run icons   (nécessite : pip install fonttools brotli)
À relancer après l'ajout d'une nouvelle icône.
"""
import re
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src' / 'app'
PKG = ROOT / 'node_modules' / '@phosphor-icons' / 'web' / 'src'
FONTS = ROOT / 'src' / 'assets' / 'fonts'
SCSS = ROOT / 'src' / 'styles' / '_icons.scss'

WEIGHTS = {
    'regular': {'css': PKG / 'regular' / 'style.css', 'font': PKG / 'regular' / 'Phosphor.woff2',
                'selector': '.ph', 'family': 'Phosphor'},
    'fill': {'css': PKG / 'fill' / 'style.css', 'font': PKG / 'fill' / 'Phosphor-Fill.woff2',
             'selector': '.ph-fill', 'family': 'Phosphor Fill'},
}


def used_icons():
    """`ph ph-x` (gabarits) ou `icon: 'ph-x'` (TS) → regular ; `ph-fill ph-x` → fill."""
    text = '\n'.join(
        p.read_text(encoding='utf-8') for p in SRC.rglob('*') if p.suffix in {'.html', '.ts'}
    )
    regular = set(re.findall(r"(?:\bph |icon: ')ph-([a-z0-9-]+)", text))
    fill = set(re.findall(r'\bph-fill ph-([a-z0-9-]+)', text))
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
    out = FONTS / f'phosphor-{weight}.woff2'
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = []
    font = subset.load_font(str(conf['font']), options)
    sub = subset.Subsetter(options)
    sub.populate(unicodes=[int(c, 16) for c in cps.values()])
    sub.subset(font)
    subset.save_font(font, str(out), options)
    rules = '\n'.join(f'{conf["selector"]}.ph-{n}::before {{\n  content: "\\{c}";\n}}' for n, c in cps.items())
    face = f"""@font-face {{
  font-family: '{conf['family']}';
  src: url('/assets/fonts/phosphor-{weight}.woff2') format('woff2');
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
