"""Police des titres arabes : Amiri gras réduit aux seules lettres des noms arabes des dahiras.

Le nom en arabe apparaît sur l'accueil : quelques Ko au lieu de 100 Ko en 3G.
Les lettres absentes (nom modifié dans l'admin) viennent d'Amiri complet (voir _typography.scss).
Usage : python3 scripts/arabic-title-font.py   (nécessite fonttools et brotli)
"""
import json
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / 'src/assets/fonts'

text = ''.join(
    json.loads(p.read_text()).get('nameArabic', '') for p in (ROOT / 'src/assets/mock').glob('tenant*.json')
)
options = subset.Options()
options.flavor = 'woff2'
options.layout_features = ['*']  # formes initiales, médianes, finales, ligatures, signes
options.name_IDs = ['*']
font = subset.load_font(str(FONTS / 'amiri-arabic-700-normal.woff2'), options)
sub = subset.Subsetter(options)
sub.populate(text=text + ' ')
sub.subset(font)
out = FONTS / 'amiri-titre.woff2'
subset.save_font(font, str(out), options)
print(f'{out.relative_to(ROOT)} : {out.stat().st_size} octets pour « {text} »')
